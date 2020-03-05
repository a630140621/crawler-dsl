# 语法

例子：

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

## 注释

cql 中使用 `#` 开头的为注释

## SET

可以在 cql 中通过 `SET` 子句设置以下参数：

* DOWNLOAD_ENGINE -> 设置下载引擎，默认是直接下载，可以选择使用 `puppeteer`
* DOWNLOAD_TIMEOUT -> 下载url的超时设置，默认为 `30s`，单位 __毫秒__（`-1`表示不限超时时间，如果设置了一个非法的值，比如字符串，会被无视）

## SELECT

用来选择需要提取的内容

### AS

重命名待提取内容的返回字段

## FROM

用于指定抓取源。

eg1.

    FROM https://news.163.com/20/0217/13/F5JDV8GD000189FH.html

eg2.

    FROM
        https://news.163.com/20/0217/13/F5JDV8GD000189FH.html,
        https://news.163.com/20/0225/11/F67P1C0Q000189FH.html

eg3.

    FROM (
        SELECT 
            href($$("#js_top_news a")) AS url
        FROM https://news.163.com
    )

1. 和 sql 相同，作为子查询的 `SELECT` 应仅返回一列；
2. `()` 不能省略；
3. 子查询和指定 url 不能同时存在。

> 抓取源的选择计划有两种，一种是 __直接指定 url__，另一种是 __从 url 对应页面中选择(选择器)指定的区域__；目前仅实现第一种。

## LIMIT

用来限制抓取的数量；

虽然大部分情况下不会限制，但是还会有其用途，比如在自动翻页时指定翻页的最大数量（如果原网站的下一页永远存在）。

## 内置函数

### css()/$()/$$()

这三个函数都返回一个或多个 __节点类型__ 的值

* `$` -> 等同于浏览器的 `document.querySelector()`
* `$$` -> 等同于浏览器的 `document.querySelectorAll()`
* `css` -> `$` 的别名

### text()/html()

接受 `css()/$()/$$()` 返回的 __节点类型__ 的值，返回对应的 `text` 或 `html`

eg.

```python
text($(selector)) # 返回 string
text($$(selector)) # 返回 [string]
text(css(selector)) # 返回 [string]
```

### attr()/href()/src()

接受 `css()/$()/$$()` 返回的 __节点类型__ 的值，返回对应的 属性值。

同 `text()` 和 `html()` 类似，如果接受的参数为 `$()` 则返回 string；如果为 `$$()` 或 `css()` 则返回 `[string]`

### regex()

接受两个参数：

1. regex/regex_str -> js正则表达式，或正则表达式字符串（其中`\` 需要转义，即 `\d` 应写成 `\\d`）；
2. `$/$$/css` 返回值

返回值类型和上述相同。

# 一些解释

## 关于列表/表格抓取合并（zip）输出

采用这样的方案主要原因是没有想到更好的 cql 来从一个网页或网页的指定位置中提取若干段落并合并输出的方式。

想到的另一种实现方案是先使用 `css()` 选择器选择每个父节点，然后在从父节点中分别提取信息。

示例如下：

以 https://www.yuncaijing.com/story/details/id_1287.html 为例

```sql
# 抓取 相关股票, 关联原因, 相关性
SELECT
    text(css('td:nth-child(1)')) AS stock,
    text(css('td:nth-child(4) span span')) AS reason,
    text(css('td:nth-child(5)')) AS relate
FROM AREA (
    SELECT css('.child-wrap table tbody tr') AS area
    FROM https://www.yuncaijing.com/story/details/id_1287.html
)
```

* 此时需要在 `FROM` 子句中支持选定指定网页区域
* `FROM` 子句需要支持子 `cql`
* 子 `cql` 中 `SELECT` 语句由于可以随意写返回，难以确定使用哪一个返回体作为带抓取区域
* 未想到更合适的 `cql` 表述

虽然如果选择器选择到的内容有错位会导致返回异常，但是由于上述原因，暂时没有实现上述方案，而仅仅采用了目前 `zip` 的方式。
