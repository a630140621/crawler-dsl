const debug = require("debug")("cql:download");
const request = require("request-promise-native");
const iconv = require("iconv-lite");
const puppeteer = require("puppeteer");


module.exports = async function (url, {
    timeout = 30000, // 30s 超时
    headers = {},
    encoding = "utf8",
    engine = ""
} = {}) {
    debug(`download url = ${url} with timeout = ${timeout} encoding = ${encoding} headers = \n${JSON.stringify(headers, null, 4)}`);
    let options = {
        timeout,
        headers,
        encoding
    };
    if (!engine) {
        return await downloadWithRequest(url, options);
    } else if (engine === "puppeteer") {
        return await downloadWithPuppeteer(url, options);
    } else {
        debug(`do not support engine 【${engine}】`);
        throw new Error(`do not support engine 【${engine}】`);
    }
};

async function downloadWithRequest(url, {
    timeout = 30000,
    headers = {},
    encoding = "utf8"
}) {
    debug(`download url ${url} use request module`);
    if (!iconv.encodingExists(encoding)) {
        throw `iconv does not support encoding [${encoding}]`;
    }

    let buf = await request({
        uri: url,
        headers: Object.assign(headers, {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36"
        }),
        encoding: null,
        timeout
    });

    return iconv.decode(buf, encoding);
}

async function downloadWithPuppeteer(url, {
    timeout = 30000
}) {
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