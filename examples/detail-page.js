// 抓取详情页
const crawl = require("../crawler/index.js");
// 如果网址可以正常打开且未改版，则下述抓取任务可正常执行

// 抓取单个网页
crawl(`
SET ENCODING=gbk 
SELECT 
    text(css('h1')) AS title,
    regex("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}", text(css(".post_time_source"))) AS pubdate
FROM 
    https://news.163.com/20/0217/13/F5JDV8GD000189FH.html
`).then(res => {
    console.log(JSON.stringify(res, null, 4));
}).catch(console.error);
// [
//     {
//         "url": "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html",
//         "select": [
//             {
//                 "title": "微视频 | 愿得此身长报国",
//                 "pubdate": "2020-02-17 13:22:54"
//             }
//         ]
//     }
// ]


// 同时抓取多个网页
crawl(`
SET ENCODING=gbk 
SELECT 
    text(css('h1')) AS title,
    regex("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}", text(css(".post_time_source"))) AS pubdate
FROM 
    https://news.163.com/20/0217/13/F5JDV8GD000189FH.html,
    https://news.163.com/20/0225/11/F67P1C0Q000189FH.html
`).then(res => {
    console.log(JSON.stringify(res, null, 4));
}).catch(console.error);
// [
//     {
//         "url": "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html",
//         "select": [
//             {
//                 "title": "微视频 | 愿得此身长报国",
//                 "pubdate": "2020-02-17 13:22:54"
//             }
//         ]
//     },
//     {
//         "url": "https://news.163.com/20/0225/11/F67P1C0Q000189FH.html",
//         "select": [
//             {
//                 "title": "世卫组织强调新冠肺炎疫情仍未构成“大流行病”",
//                 "pubdate": "2020-02-25 11:01:06"
//             }
//         ]
//     }
// ]
