# 语法

## 注释

cql 中使用 `#` 开头的为注释

## SET

可以在 cql 中通过 `SET` 子句设置以下参数：

* ENCODING -> 下载完html后使用指定的格式进行解码，默认为 `utf8`

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
