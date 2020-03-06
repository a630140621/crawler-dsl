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

## NEXT URL

后可跟：

1. `http://` 或 `https://` 开头的地址列表——此时直接抓取指定的网址；
2. 使用一个选择器，从当前正在抓取的网页中提取下一页的地址；
3. 使用一个 `SELECT` 子句——未实现。

> 如果使用 `NEXT_URL` 则无法使用并发下载功能。

### MERGE

只有语句中存在 `NEXT URL` 子句才有意义。

合并 `SELECT` 中指定的字段，上例的意思是，获取该网站的 `href($('.btn-next'))` 作为下一个抓取地址，并将抓取到的 `content` 进行合并。

> 如果有 `MERGE` 子句的话，会忽略掉提取到的，但是没有被合并的字段。
>> 暂时这样实现，考虑过使用内置函数来执行各种各样的合并操作，但是没有想到应用场景，所以暂时不实现。

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

## 下载/解析引擎

从网络上下载 html 到本地，然后进行解码的过程中可能会遇到很多问题；比如乱码，动态网页等。
所以本系统一共提供了三个下载（解析）引擎供使用：

* node-fetch
* jsdom
* puppeteer

### node-fetch

发送一个 http 请求，然后返回 http 流；此处需要将http流自行 __嗅探编码__ 并解码成 string。

__性能最佳__：默认使用，如果这个可以满足则请使用该引擎。

> 一开始使用的是 `request` 之后抛弃了是因为 `request` 的依赖较多，并且很多都用不到（做了太多不该他做的事情）；并且官方已经宣布不在维护这个项目。

### jsdom

使用纯js实现了很多 whatwg 的 DOM 和 HTML 标准的库。

__轻量级__：在一些动态网站中可以优先选择这个引擎来尝试解析，而不是直接使用 `puppeteer`

以下是一些尚未解决的问题：

1. jsdom 在等待资源 onload 过程中会阻塞nodejs的事件循环，考虑新建一个进程来进行下载解析操作；
2. 执行外部脚本有被攻击的风险，内置的 sandbox 不能完全避免；
3. 如果原网站使用了 jQuery，那么 内部注册的 window.onload 事件可能不会按照预期执行（概率性）；参考 https://www.jquery123.com/ready/
4. 如果原网站也在 window.onload 事件处理程序中注册了处理事件（如异步加载资源），则此处会先于原网站加载完成执行；——需要测试 puppeteer 在此情况下的行为。

> 有些网站没有按照预期的执行（https://www.esjzone.cc/forum/1546618252/57514.html），尚未查出问题原因。

### puppeteer

`puppeteer` 是一个浏览器驱动程序，可以使用脚本来操作任何支持 `devTool` 的浏览器，默认情况下使用内置的 `Chromium` 浏览器。

__重量级__：性能非常差，资源消耗也极多（当然功能也非常丰富，可以做到浏览器中看到的都可以抓到），因为每解析一个网页都需要开启一个 `Chromium`，不在万不得已的情况下请不要使用该引擎。
