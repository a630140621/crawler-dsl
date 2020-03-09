// 爬虫生命周期函数
class LifeCycle {
    // 抓取过程
    // * beforeEachCrawl(url) -> 每一个具体的抓取前，__如果返回 false，则不抓取该地址__（会忽略除 `false` 之外的任何值）；
    async beforeEachCrawl(url) {}
    // * afterEachCrawl(url, status, select) -> 每一个链接抓取结束，status 表示抓取状态（`success`/`fail`），select 为抓取的内容；
    afterEachCrawl(url, status, select) {}
    // * afterCrawl(results) -> 一条语句执行完毕（`results`:`[{url: "", select: {}, status: ""}]`）；
    // afterCrawl(results) {}

    // 下载过程
    // * beforeEachDownload(url, engine)
    beforeEachDownload(url, engine) {}
    // * afterEachDownload(url, status, html) -> status: `success`/`fail`
    afterEachDownload(url, status, html) {}
}


// 单例（利用模块缓存机制）
module.exports = new LifeCycle();