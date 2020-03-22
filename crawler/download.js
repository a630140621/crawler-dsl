const debug = require("debug")("crawler:download");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch"); // https://www.npmjs.com/package/node-fetch
const htmlEncodingSniffer = require("html-encoding-sniffer"); // whatwg 标准解码嗅探算法
const whatwgEncoding = require("whatwg-encoding"); // 构建在 iconv-lite 之上，使其符合 whatwg 规范
const jsdom = require("jsdom");
const lifeCycle = require("./lifecycle");
const os = require("os");
const path = require("path");
const URL = require("url").URL;
const fsPromise = require("fs").promises;


const USERAGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36";
const MAX_RETRY = 3;

module.exports = async function (url, {
    timeout = 30000, // 30s 超时
    engine = ""
} = {}) {
    let tmp_html = await getHtmlFromTemp(url);
    if (tmp_html) {
        debug(`get url content from temp`);
        return tmp_html;
    }
    debug(`download url = ${url} with timeout = ${timeout}`);
    lifeCycle.beforeEachDownload(url, engine || "fetch");
    let options = {
        timeout
    };

    let html;
    if (!engine || engine === "fetch") {
        html = await downloadWithFetch(url, options);
    } else if (engine === "puppeteer") {
        html = await downloadWithPuppeteer(url, options);
    } else if (engine === "jsdom") {
        html = await downloadWithJsDom(url, options);
    } else {
        debug(`do not support engine 【${engine}】`);
        throw new Error(`do not support engine 【${engine}】`);
    }
    await saveFileToTemp(url, html); // 不需要 await
    return html;
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


// 下述两个函数考虑提取到 lib/
// 将下载下来的内容保存到临时目录
async function saveFileToTemp(url, html) {
    let _url = new URL(url);
    let temp_dir = path.join(`${os.tmpdir()}`, "download", _url.hostname);
    try {
        let filename = _url.pathname.split("/").slice(-1)[0];
        await fsPromise.writeFile(path.join(temp_dir, filename), html, {
            encoding: "utf8"
        });
    } catch (error) {
        debug(error);
        // 使用异常避免每次都要判断文件夹是否存在
        if (error.code === "ENOENT") { // 无此文件或目录
            await fsPromise.mkdir(temp_dir, {
                recursive: true
            });

            return saveFileToTemp(url, html);
        }

        throw error;
    }
}

// 若返回空字符串则表示尚无缓存，或缓存已过期，需重新下载
async function getHtmlFromTemp(url) {
    let _url = new URL(url);
    let temp_dir = path.join(`${os.tmpdir()}`, "download", _url.hostname);
    try {
        let filename = _url.pathname.split("/").slice(-1)[0];
        let filehanlde = await fsPromise.open(path.join(temp_dir, filename), "r");
        let filestat = await filehanlde.stat();
        if (Date.now() - 60 * 60 * 1000 > filestat.ctimeMs) { // N分钟之前的文件，当做已过期
            // 暂不考虑删除过期文件
            return "";
        }
        return await filehanlde.readFile({
            encoding: "utf8"
        });
    } catch (error) {
        debug(error);
        // 使用异常避免每次都要判断文件夹是否存在
        if (error.code === "ENOENT") { // 无此文件或目录
            return "";
        }
    }
}