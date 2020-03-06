const debug = require("debug")("crawler");
const compile = require("./cql/compile");
const download = require("./download");
const extract = require("./extract");
const allSettled = require("promise.allsettled");
allSettled.shim(); // 注入 Promise if needed
const Denque = require("denque");


/**
 * 
 * @return [{url, select: {} || [{}] }]
 */
module.exports = async function crawl(cql) {
    debug(`before compile cql = ${cql}`);
    let {
        from: {
            subselect = "",
            urls = []
        },
        select_script = {},
        set = {},
        limit = Infinity,
        next_url: NEXT_URL = {}, // {selector: "", urls: []}
        merge = []
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
        timeout: set.DOWNLOAD_TIMEOUT,
        engine: set.DOWNLOAD_ENGINE
    };
    let download_method = getDownloadMethodByEngine(set.DOWNLOAD_ENGINE);

    let ret = [];
    if (Object.keys(NEXT_URL).length === 0) { // 不存在 NEXT URL 子句
        // 如果有 limit 则截取 urls 中前 limit 个进行处理
        for await (let [url, html] of download_method(urls.slice(0, limit), options)) {
            let item = {
                url
            };
            if (html) item["select"] = extract(html, select_script, url);
            ret.push(item);
        }
    } else { // 有 NEXT URL 子句情况下
        for (let url of urls) {
            limit -= 1;
            let html = await download(url, options);
            if (!html) { // 下载失败或超时等情况
                ret.push({
                    url
                });
                continue;
            }
            ret.push({
                url,
                select: extract(html, select_script, url)
            });

            // 进行 NEXT URL 处理
            let next_url_list = getNextUrl(url, html, NEXT_URL);
            next_url_list.reverse();
            let deque = new Denque(next_url_list);
            while (!deque.isEmpty() && limit > 0) {
                limit -= 1;
                let next_url = deque.pop();
                debug(`continue NEXT URL clause download ${next_url}`);
                let next_html = await download(next_url, options);
                let next_select = extract(next_html, select_script, next_url);
                if (merge.length === 0) { // 不需要合并
                    ret.push({
                        url: next_url,
                        select: next_select
                    });
                } else {
                    for (let need_to_merge_key of merge) {
                        if (Array.isArray(ret[ret.length - 1].select)) ret[ret.length - 1].select.push(...next_select);
                        else ret[ret.length - 1].select[need_to_merge_key] += next_select[need_to_merge_key];
                    }
                }
                // 继续处理 NEXT URL 直到为 falsy
                let _next_url_list = getNextUrl(next_url, next_html, NEXT_URL);
                _next_url_list.reverse();
                for (let u of _next_url_list) {
                    deque.push(u);
                }
            }
        }
    }

    return ret;
};


function getNextUrl(url, html, next_url) {
    let ret = [];
    if (next_url.selector) {
        let select = extract(html, {
            url: next_url.selector
        }, url);
        if (Array.isArray(select.url)) {
            ret = select.url;
        } else {
            ret = [select.url];
        }
    } else if (next_url.urls) {
        ret = next_url.urls;
    }

    debug(`get next url = ${ret}`);
    return ret;
}


function getDownloadMethodByEngine(engine) {
    if (engine === "puppeteer") return getHtmlsSync;
    else return getHtmls;
}


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
        let item = [urls[index]];
        if (each.status !== "rejected") item.push(each.value);
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
            debug(`download url ${url} have some error = ${error}`);
        }
        yield [url, html];
    }
}