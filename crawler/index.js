const compile = require("./cql/compile");
const download = require("./download");
const extract = require("./extract");


module.exports = async function crawl(cql) {
    let {
        from_urls,
        select_script,
        set
    } = compile(cql);

    let ret = [];
    // 目前先使用同步下载的方式
    for (let url of from_urls) {
        let item = {
            url
        };
        let html = await download(url, {
            encoding: set.ENCODING
        });
        item.extract = extract(html, select_script);
        ret.push(item);
    }

    return ret;
};