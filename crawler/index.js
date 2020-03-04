const debug = require("debug")("cql");
const compile = require("./cql/compile");
const download = require("./download");
const extract = require("./extract");
const allSettled = require("promise.allsettled");
allSettled.shim(); // 注入 Promise if needed


/**
 * 
 * @return [{url, select: {} || [{}] }]
 */
module.exports = async function crawl(cql) {
    debug(`before compile cql = ${cql}`);
    let {
        from: {
            subselect,
            urls
        },
        select_script,
        set
    } = compile(cql);

    // 从 from 子查询中提取 url
    let [select_key, ok] = isValidSubselectThenGetSelectKey(subselect);
    if (ok) {
        let ret = await crawl(subselect);
        let sub_urls = [];
        for (let each of ret) {
            if (!Array.isArray(each.select)) {
                sub_urls.push(each.select[select_key]);
            } else {
                for (let st of each.select) {
                    sub_urls.push(st[select_key]);
                }
            }
        }
        debug(`from subselect extract wait to crawl urls = ${sub_urls}`);
        urls.push(...sub_urls);
    }

    // 根据是否 使用 puppeteer 选择是否使用异步抓取
    // puppeteer不使用异步主要是因为，如果同时开很多会非常消耗性能
    let options = {
        encoding: set.ENCODING,
        timeout: set.DOWNLOAD_TIMEOUT,
        engine: set.DOWNLOAD_ENGINE
    };
    let download_method = getHtmls;
    if (set.DOWNLOAD_ENGINE === "puppeteer") download_method = getHtmlsSync;
    let ret = [];
    for await (let {
        url,
        html
    } of download_method(urls, options)) {
        let item = {
            url
        };
        if (html) item["select"] = extract(html, select_script);
        ret.push(item);
    }

    return ret;
};


// 子查询是否合法，目前仅判断子查询是否只包含一个字段（类似sql）
// @returns: [select_key, true/false]
function isValidSubselectThenGetSelectKey(subselect) {
    if (!subselect) return ["", false];
    let {
        select_script
    } = compile(subselect);
    let select_keys = Object.keys(select_script);
    if (select_keys.length > 1) throw new Error(`subselect can only have one`);
    return [select_keys[0], true];
}

// 异步处理
// @yield {url, html}
async function* getHtmls(urls, options) {
    debug(`asynchronous download urls = ${urls}`);
    let htmls = await Promise.allSettled(urls.map(url => download(url, options)));
    for (let [index, each] of htmls.entries()) {
        let item = {
            url: urls[index],
            html: ""
        };
        if (each.status !== "rejected") item["html"] = each.value;
        yield item;
    }
}

// 按照顺序处理
async function* getHtmlsSync(urls, options) {
    debug(`synchronize download urls = ${urls}`);
    for (let url of urls) {
        let html = "";
        try {
            html = await download(url, options);
        } catch (error) {
            console.error(error);
        }
        yield {
            url,
            html
        };
    }
}