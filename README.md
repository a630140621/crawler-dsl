# crawler-cql

使用cql实现爬虫

## 安装

```bash
npm install a630140621/crawler-dsl -g
```

## 基础示例

### 抓取详情页（单页）

```bash
crawl --cql 'SET ENCODING=gbk SELECT text($("h1")) AS title FROM https://news.163.com/20/0217/13/F5JDV8GD000189FH.html'
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
crawl --cql 'SET ENCODING=gbk SELECT text($("h1")) AS title FROM https://news.163.com/20/0217/13/F5JDV8GD000189FH.html, https://news.163.com/20/0225/11/F67P1C0Q000189FH.html'
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
SET ENCODING=gb2312
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

### 自动翻页

* 情景1，翻页并提取内容，并将提取到的内容和 `SELECT` 中指定的字段合并（主要用在两页之间内容有关联）；
* 情景2，翻页后提取到的内容，不和之前的内容合并；

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
