// 抓取详情页
const crawl = require("../crawler/index.js");
// 如果网址可以正常打开且未改版，则下述抓取任务可正常执行

// 抓取单个网页
crawl(`
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


// 子查询
crawl(`
    SELECT 
        text($(".heading1 h1")) AS title,
        text($(".visited_parent +")) AS pubdate
    FROM (
        SELECT
            href($$(".tit a"))
        FROM
            https://cang.cngold.org/sczx/
    )
`).then(res => {
    console.log(JSON.stringify(res, null, 4));
}).catch(console.error);
// [
//     {
//         "url": "https://cang.cngold.org/c/2020-03-10/c6896908.html",
//         "select": {
//             "title": "金华7个历史文化村落被列入第八批省历史文化重点村落项目名单",
//             "pubdate": "2020-3-10 11:50:19"
//         }
//     },
//     {
//         "url": "https://cang.cngold.org/c/2020-03-10/c6896886.html",
//         "select": {
//             "title": "海量文博资源在线 “云看展”“云直播”不分国界",
//             "pubdate": "2020-3-10 11:49:24"
//         }
//     },
//     {
//         "url": "https://cang.cngold.org/c/2020-03-10/c6896869.html",
//         "select": {
//             "title": "沿黄九省区博物馆联合推出的“云探国宝”活动 引发格外关注",
//             "pubdate": "2020-3-10 11:46:53"
//         }
//     },
//     ...
// ]
