// 抓取小说网站 https://www.esjzone.cc/detail/1546618252.html
const fs = require("fs");
const path = require("path");
const {
    crawl,
    lifeCycle
} = require("../index");

(async () => {
    let cql = `
        SET DOWNLOAD_TIMEOUT=-1, DOWNLOAD_ENGINE=puppeteer
        SELECT
            text($('h3')) AS title,
            text($('.forum-content')) AS content
        FROM https://www.esjzone.cc/forum/1546618252/57514.html
        NEXT URL href($('.btn-next'))
    `;

    lifeCycle.afterEachCrawl = function (url, status, select) {
        if (status === "success") {
            fs.writeFileSync(path.join(__dirname, `./esjzone/${select.title}.txt`), `${url}\n\n${select.title}\n\n${select.content}`);
        } else {
            console.error(`crawl url ${url} status = ${status}`);
        }
    };
    await crawl(cql);
})();