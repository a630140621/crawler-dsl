const debug = require("debug")("crawler:download");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch"); // https://www.npmjs.com/package/node-fetch
const htmlEncodingSniffer = require("html-encoding-sniffer"); // whatwg 标准解码嗅探算法
const whatwgEncoding = require("whatwg-encoding"); // 构建在 iconv-lite 之上，使其符合 whatwg 规范
const jsdom = require("jsdom");
const lifeCycle = require("./lifecycle");


const USERAGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36";
const MAX_RETRY = 3;

module.exports = async function (url, {
    timeout = 30000, // 30s 超时
    engine = ""
} = {}) {
    debug(`download url = ${url} with timeout = ${timeout}`);
    lifeCycle.beforeEachDownload(url, engine || "fetch");
    let options = {
        timeout
    };
    if (!engine || engine === "fetch") {
        return await downloadWithFetch(url, options);
    } else if (engine === "puppeteer") {
        return await downloadWithPuppeteer(url, options);
    } else if (engine === "jsdom") {
        return await downloadWithJsDom(url, options);
    } else {
        debug(`do not support engine 【${engine}】`);
        throw new Error(`do not support engine 【${engine}】`);
    }
};

async function downloadWithFetch(url, {
    timeout = 30000,
    retry = 0 // 重试次数
} = {}) {
    debug(`download url ${url} use node-fetch retry = ${retry}`);
    if (retry >= MAX_RETRY) {
        lifeCycle.afterEachDownload(url, "fail");
        return "";
    }

    let res = null;
    try {
        res = await fetch(url, {
            timeout: timeout !== -1 ? timeout : 0
        });
        lifeCycle.afterEachDownload(url, "success");
    } catch (error) {
        debug(error);
        lifeCycle.afterEachDownload(url, "retry");
        return downloadWithFetch(url, {
            timeout,
            retry: retry + 1
        });
    }
    return decodeHtmlBuffer(res.headers.get("content-type"), await res.buffer());
}

/**
 * 自动检测编码，并返回解码后的 html string
 * 参考:
 *  https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/meta
 *  https://html.spec.whatwg.org/multipage/parsing.html#encoding-sniffing-algorithm
 * 
 * @param {String} http header["Content-Type"], eg. text/html;charset=GBK
 * @param {Buffer} buf html body buffer
 * 
 * @return {String} 编码类型
 */
function decodeHtmlBuffer(content_type, buf) {
    // 从 content_type 获取 charset
    const list = content_type.split(";");
    let charset = null;
    for (let each of list) {
        each = each.trimLeft();
        if (each.startsWith("charset=")) {
            charset = each.replace("charset=", "");
            break;
        }
    }

    const sniffedEncoding = htmlEncodingSniffer(buf, {
        transportLayerEncodingLabel: charset,
        defaultEncoding: "UTF-8"
    });

    return whatwgEncoding.decode(buf, sniffedEncoding);
}


async function downloadWithJsDom(url, {
    timeout = 3000,
    retry = 0 // 重试次数
} = {}) {
    debug(`download url ${url} use jsdom retry = ${retry}`);
    if (retry >= MAX_RETRY) {
        lifeCycle.afterEachDownload(url, "fail");
        return "";
    }

    const virtualConsole = new jsdom.VirtualConsole();
    virtualConsole.on("error", debug);
    virtualConsole.on("warn", debug);
    virtualConsole.on("info", debug);
    virtualConsole.on("dir", debug);
    let _dom = null;
    return jsdom.JSDOM.fromURL(url, {
        // runScripts: "outside-only",
        runScripts: "dangerously",
        resources: "usable", // 开启加载 外部资源 如<script src=""></script> 脚本、<img> 等，由于jsdom尚未提供仅加载script脚本的，所以暂时仅处理到这里。
        pretendToBeVisual: true,
        userAgent: USERAGENT,
        virtualConsole
    }).then(dom => {
        debug(`jsdom load have already loaded url, now wait window.onload`);
        _dom = dom;
        return new Promise((resolve, reject) => {
            let timer = null;
            dom.window.addEventListener("load", () => {
                debug(`jsdom.window emit onload event get html and resolve`);
                if (timer) clearTimeout(timer); // 清除定时器
                lifeCycle.afterEachDownload(url, "success");
                return resolve(dom.serialize());
            });

            if (timeout && timeout !== -1) {
                timer = setTimeout(() => {
                    debug(`jsdom load resource timeout after ${timeout} reject error`);
                    lifeCycle.afterEachDownload(url, "retry");
                    return downloadWithJsDom(url, {
                        timeout,
                        retry: retry + 1
                    });
                }, timeout);
            }
        });
    }).finally(() => {
        debug(`close jsdom to release resources`);
        if (_dom) _dom.window.close();
    });
}


async function downloadWithPuppeteer(url, {
    timeout = 30000,
    retry = 0 // 重试次数
} = {}) {
    debug(`download url ${url} use puppeteer retry = ${retry}`);
    if (retry >= MAX_RETRY) {
        lifeCycle.afterEachDownload(url, "fail");
        return "";
    }

    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        await page.goto(url, {
            timeout: timeout === -1 ? 0 : timeout,
            // 应该用 "domcontentloaded" 会更好些，但是目前只有一个网站需要在 load 之后在获取内容，后续如果有更多需要使用 puppeteer 下载，在测试后考虑提供一个 SET 来修改此处配置
            // waitUntil: "domcontentloaded"
            waitUntil: "load"
        });
        debug(`after download url ${url} use puppeteer`);
        lifeCycle.afterEachDownload(url, "success");
        return await page.content();
    } catch (error) {
        debug(`download use puppeteer have some error = ${error}`);
        lifeCycle.afterEachDownload(url, "retry");
        return downloadWithPuppeteer(url, {
            timeout,
            retry: retry + 1
        });
    } finally {
        await browser.close();
    }
}
