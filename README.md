# crawler-cql

使用cql实现爬虫

## 安装

```bash
npm install a630140621/crawler-dsl -g
```

## 基础示例

### 抓取详情页（单页）

```bash
crawl --cql 'SELECT text($("h1")) AS title FROM https://news.163.com/20/0217/13/F5JDV8GD000189FH.html'
# [
#     {
#         "url": "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html",
#         "select": {
#             "title": "微视频 | 愿得此身长报国"
#         }
#     }
# ]
```

或抓取多页

```bash
crawl --cql 'SELECT text($("h1")) AS title FROM https://news.163.com/20/0217/13/F5JDV8GD000189FH.html, https://news.163.com/20/0225/11/F67P1C0Q000189FH.html'
# [
#     {
#         "url": "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html",
#         "select": {
#             "title": "微视频 | 愿得此身长报国"
#         }
#     },
#     {
#         "url": "https://news.163.com/20/0225/11/F67P1C0Q000189FH.html",
#         "select": {
#             "title": "世卫组织强调新冠肺炎疫情仍未构成“大流行病”"
#         }
#     }
# ]
```

### 抓取列表

以 http://gold.jrj.com.cn/list/hjzx.shtml 为例

```bash
# 抓取 title, summary, pubdate
SELECT
    text(css("#news dt a")) AS title,
    text(css("#news dt p:nth-child(2)")) AS summary,
    text(css("#news dt p.time")) AS pubdate
FROM
    http://gold.jrj.com.cn/list/hjzx.shtml

# @return
# [
#     {
#         "url": "http://gold.jrj.com.cn/list/hjzx.shtml",
#         "select": [
#             {
#                 "title": "金价重返约1900美元/盎司的高点可能是一个时间问题",
#                 "summary": "其它货币计价的金价屡创新高，反映出外汇市场日益疲软。综合来看，周一操作上王金尧建议反弹高空为主，回调低多为辅；周一短期可关注上方1586-1590一线阻力，下方重点关注1565-1570一线支撑。",
#                 "pubdate": "2020-02-16 17:36"
#             },
#             {
#                 "title": "黄金突破1580上行趋势线维持牢固 鲍威尔听证摆阵特朗普",
#                 "summary": "除了鲍威尔谈及当前的疫情影响之外，本周澳洲联储和欧洲央行的经济学家均谈及疫情对年内经济的影响。",
#                 "pubdate": "2020-02-16 10:24"
#             },
#             ...
#         ]
#     }
# ]
```

* 由于`$$` 选择器返回的是一个列表，所以会对起返回值进行 __对应位置合并（zip）__ 后输出（不能有错位）

### 抓取表格

以 https://www.yuncaijing.com/story/details/id_1287.html 为例

```bash
# 抓取 相关股票, 关联原因, 相关性
SELECT
    text(css('.child-wrap table tbody tr td:nth-child(1)')) AS stock,
    text(css('.child-wrap table tr td:nth-child(4) span span')) AS reason,
    text(css('.child-wrap table tr td:nth-child(5)')) AS relate
FROM
    https://www.yuncaijing.com/story/details/id_1287.html
```

### 列表->详情

以 https://news.163.com 为例

```bash
SELECT
    text($("h1")) AS title,
    regex(/\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/, text($(".post_time_source"))) AS pubdate,
    text($("#ne_article_source")) AS origin
FROM (
    SELECT href($$("#js_top_news h2 a")) FROM https://news.163.com
)
# [
#     {
#         url: "https://news.163.com/20/0303/15/F6Q9DP77000189FH.html",
#         select: {
#             title: "习近平为何此时考察战疫科研攻关",
#             pubdate: "2020-03-03 15:33:50",
#             origin: "新华网"
#         }
#     },
#     {
#         url: "https://news.163.com/20/0303/10/F6PNBC6R0001899O.html",
#         select: {
#             title: "胡锡进:若这一步走不好 中国付出的巨大代价都白费",
#             pubdate: "2020-03-03 10:17:57",
#             origin: "环球网"
#         }
#     }
# ]
```

### 自动翻页

* 情景1，翻页并提取内容，并将提取到的内容和 `SELECT` 中指定的字段合并（主要用在两页之间内容有关联）；
* 情景2，翻页后提取到的内容，不和之前的内容合并；

注：下述两个例子速度很慢（因为原网站打开有个请求超时），所以请耐心等待！！！

> ps：之后如果遇到新的，可能会换成速度快的 demo。

#### 翻页不合并

以 https://www.esjzone.cc/forum/1546618252/57514.html 为例

```sql
SET
    DOWNLOAD_TIMEOUT=-1,
    DOWNLOAD_ENGINE=puppeteer
SELECT
    text($('h3')) AS title,
    text($('.forum-content')) AS text
FROM
    https://www.esjzone.cc/forum/1546618252/57514.html
NEXT URL
    href($('.btn-next'))
LIMIT 100
```

> 当 `NEXT URL` 后为空或到达 `LIMIT` 时，停止抓取。

#### 翻页合并

```sql
SET
    DOWNLOAD_TIMEOUT=-1,
    DOWNLOAD_ENGINE=puppeteer
SELECT
    text($('h3')) AS title,
    text($('.forum-content')) AS content
FROM
    https://www.esjzone.cc/forum/1546618252/57514.html
NEXT URL
    href($('.btn-next'))
MERGE content
LIMIT 3
```

#### NEXT URL vs FROM

`NEXT URL` 和 `FROM` 语句有很多相似的地方，但实际上他们是完全不同的。

虽然他们都可以接受一个 url 列表或者一个 `SELECT` 子句以实现抓取一批 url 的功能，
然而 `FROM` 子句中的 url 列表是异步抓取的（如果使用puppeteer则`FROM`也是同步的，防止压力过大），所以性能较高；
`NEXT URL` 后如果跟一个 url 列表则列表中的 url 是按照顺序抓取的；此外 `NEXT URL` 还可以跟一个 `MERGE` 子句用来合并指定的字段。

> 如果有一些地址需要同步抓取，则也可以使用 `NEXT URL`

## 下载缓存

每一次运行过程中会将下载下来的 html 的实际内容保存在 临时文件夹下 `/tmp/download/hostname/file`

* 当第二次下载时，如果发现文件已过期（暂写死一小时），则会进行重新下载；
* 否则直接获取临时文件的内容。

> 暂时没有删除保存的缓存文件。

## lifeCycle

爬虫抓取过程生命周期。

通常用来提供一些，统计，去重，监控功能。

### 抓取过程

<!-- * beforeCrawl(urls) -> 待抓取 url 列表，__如果返回一个数组，则抓取数组中指定的链接__（由于`NEXT URL`可能只有在抓取玩上一个页面才知道下一个页面的地址，所以不提供） -->
* beforeEachCrawl(url) -> 每一个具体的抓取前，__如果返回 false，则不抓取该地址__（会忽略除 `false` 之外的任何值）；
* afterEachCrawl(url, status， select) -> 每一个链接抓取结束，status 表示抓取状态（`success`/`fail`），select 为抓取的内容；
<!-- * afterCrawl(results) -> 一条语句执行完毕（`results`:`[{url: "", select: {}, status: ""}]`）； -->

### 下载过程

* beforeEachDownload(url, engine)
* afterEachDownload(url, status, html) -> status: `success`/`retry`(触发重试)/`fail`(重试到达上限仍然失败)

如果该 url 内容是从缓存中获取的，将不会触发上述两个生命周期函数。

[更多语法参考](docs/grammer.md)

## 测试

### 单元测试

```bash
npm run test
```

### 覆盖率测试

```bash
npm run test:coverage
```
