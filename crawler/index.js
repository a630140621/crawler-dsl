const debug = require("debug")("crawler");
const compile = require("./cql/compile");
const download = require("./download");
const extract = require("./extract");
const allSettled = require("promise.allsettled");
allSettled.shim(); // 注入 Promise if needed
const Denque = require("denque");
const lifeCycle = require("./lifecycle");


/**
 * 
 * @return [{url, select: {} || [{}] }]
 */
async function crawl(cql) {
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
    debug("compile next_url", JSON.stringify(NEXT_URL));
    if (limit === 0) return [];
    // 从 from 子查询中提取 url
    if (subselect) urls.push(...await getUrlsFromSubselect(set, subselect));

    // 根据是否 使用 puppeteer 选择是否使用异步抓取
    // puppeteer不使用异步主要是因为，如果同时开很多会非常消耗性能
    let options = {
        timeout: set.DOWNLOAD_TIMEOUT,
        engine: set.DOWNLOAD_ENGINE
    };
    let download_method = getDownloadMethodByEngine(set.DOWNLOAD_ENGINE);

    let ret = [];
    if (Object.keys(NEXT_URL).length === 0) { // 不存在 NEXT URL 子句
        // 由于需要并行处理，所以在未下载之前先调用生命周期函数 beforeEachCrawl 来确定哪些 url 要下载
        let wait_to_download_urls = [];
        for (let url of urls) {
            let is_crawl = await lifeCycle.beforeEachCrawl(url);
            if (is_crawl !== false) {
                wait_to_download_urls.push(url);
                if (wait_to_download_urls.length === limit) break;
            }
        }
        // 如果有 limit 则截取 urls 中前 limit 个进行处理
        for await (let [url, html] of download_method(wait_to_download_urls, options)) {
            let item = {
                url
            };
            item["select"] = extract(html, select_script, url);
            ret.push(item);
            await lifeCycle.afterEachCrawl(url, html ? "success" : "fail", item["select"]);
        }
    } else { // 有 NEXT URL 子句情况下
        for (let url of urls) {
            // 生命周期
            let is_crawl = await lifeCycle.beforeEachCrawl(url);
            if (is_crawl === false) continue;
            limit -= 1;
            let html = await download(url, options);
            ret.push({
                url,
                select: extract(html, select_script, url)
            });
            await lifeCycle.afterEachCrawl(url, html ? "success" : "fail", ret[ret.length - 1]["select"]);

            // 进行 NEXT URL 处理
            let next_url_list = getNextUrl(url, html, NEXT_URL);
            next_url_list.reverse();
            let deque = new Denque(next_url_list);
            while (!deque.isEmpty() && limit > 0) {
                let next_url = deque.pop();
                // 生命周期
                let is_crawl = await lifeCycle.beforeEachCrawl(next_url);
                if (is_crawl === false) continue;

                limit -= 1;
                debug(`continue NEXT URL clause download ${next_url}`);
                let next_html = await download(next_url, options);
                let next_select = extract(next_html, select_script, next_url);
                await lifeCycle.afterEachCrawl(next_url, next_html ? "success" : "fail", next_select);
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
}


// 从 from 子查询中获取 urls
async function getUrlsFromSubselect(set, subselect) {
    let [select_key, ok] = isValidSubselectThenGetSelectKey(subselect);
    if (!ok) return [];
    if (Object.keys(set).length > 0) {
        let _set = [];
        for (let [key, value] of Object.entries(set)) {
            _set.push(`${key}=${value}`);
        }
        subselect = `SET ${_set.join(",")} ${subselect}`;
    }

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
    return sub_urls;
}

// 子查询是否合法，目前仅判断子查询是否只包含一个字段（类似sql）
// @returns: [select_key, true/false]
function isValidSubselectThenGetSelectKey(subselect) {
    if (!subselect) return ["", false];
    let {
        select_script
    } = compile(subselect);
    let select_keys = Object.keys(select_script);
    if (select_keys.length > 1) throw new Error(`subselect can only have one but receive ${select_keys}`);
    return [select_keys[0], true];
}


function getNextUrl(url, html, next_url) {
    debug("getNextUrl", url, html, next_url);
    let ret = [];
    if (next_url.selector) {
        let select = extract(html, {
            url: next_url.selector
        }, url);
        if (Array.isArray(select)) {
            ret = select.map(item => item.url).filter(item => item); // 过滤到属性值为空的
        } else {
            if (select.url) ret = [select.url];
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


module.exports = crawl;