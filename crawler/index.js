const debug = require("debug")("cql");
const compile = require("./cql/compile");
const download = require("./download");
const extract = require("./extract");


module.exports = async function crawl(cql) {
    debug(`before compile cql = ${cql}`);
    let {
        from_urls,
        select_script,
        set
    } = compile(cql);

    // 使用同步下载（不使用异步主要是因为 puppeteer 如果同时开很多会非常消耗性能）
    let ret = [];
    for (let url of from_urls) {
        ret.push({
            url,
            select: extract(await download(url, {
                encoding: set.ENCODING
            }), select_script)
        });
    }

    return ret;
};