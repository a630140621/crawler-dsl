const debug = require("debug")("cql:download");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch"); // https://www.npmjs.com/package/node-fetch
const htmlEncodingSniffer = require("html-encoding-sniffer"); // whatwg 标准解码嗅探算法
const whatwgEncoding = require("whatwg-encoding"); // 构建在 iconv-lite 之上，使其符合 whatwg 规范


module.exports = async function (url, {
    timeout = 30000, // 30s 超时
    headers = {},
    engine = ""
} = {}) {
    debug(`download url = ${url} with timeout = ${timeout} headers = \n${JSON.stringify(headers, null, 4)}`);
    let options = {
        timeout,
        headers,
    };
    if (!engine) {
        return await downloadWithFetch(url, options);
    } else if (engine === "puppeteer") {
        return await downloadWithPuppeteer(url, options);
    } else {
        debug(`do not support engine 【${engine}】`);
        throw new Error(`do not support engine 【${engine}】`);
    }
};

async function downloadWithFetch(url, {
    timeout = 30000,
    headers = {},
} = {}) {
    debug(`download url ${url} use node-fetch`, {
        headers: Object.assign(headers, {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36"
        }),
        timeout
    });

    let res = await fetch(url);
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

async function downloadWithPuppeteer(url, {
    timeout = 30000
} = {}) {
    debug(`before download url ${url} use puppeteer`);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {
        timeout: timeout === -1 ? 0 : timeout,
        // 应该用 "domcontentloaded" 会更好些，但是目前只有一个网站需要在 load 之后在获取内容，后续如果有更多需要使用 puppeteer 下载，在测试后考虑提供一个 SET 来修改此处配置
        // waitUntil: "domcontentloaded"
        waitUntil: "load"
    });
    debug(`after download url ${url} use puppeteer`);
    return await page.content();
}
