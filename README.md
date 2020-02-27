# crawler-cql

使用cql实现爬虫

## 安装

```bash
npm install a630140621/crawler-dsl -g
```

## 基础示例

### 抓取详情页（单页）

```bash
crawl --cql 'SET ENCODING=gbk SELECT text(css('h1')) AS title FROM https://news.163.com/20/0217/13/F5JDV8GD000189FH.html'
# [ { url: 'https://news.163.com/20/0217/13/F5JDV8GD000189FH.html', extract: [{ title: '微视频 | 愿得此身长报国' }] }]
```

或抓取多页

```bash
crawl --cql 'SET ENCODING=gbk SELECT text(css("h1")) AS title FROM https://news.163.com/20/0217/13/F5JDV8GD000189FH.html, https://news.163.com/20/0225/11/F67P1C0Q000189FH.html'
# [
#   { url: 'https://news.163.com/20/0217/13/F5JDV8GD000189FH.html', extract: [{ title: '微视频 | 愿得此身长报国' }] },
#   { url: 'https://news.163.com/20/0225/11/F67P1C0Q000189FH.html', extract: [{ title: '世卫组织强调新冠肺炎疫情仍未构成“大流行病”' }] }
# ]
```

### 抓取列表

以 http://gold.jrj.com.cn/list/hjzx.shtml 为例

```sql
# 抓取 title, summary, pubdate
SET ENCODING=gb2312
SELECT
    text(css('#news dt a')) AS title,
    text(css('#news dt p:nth-child(2)')) AS summary,
    text(css('#news dt p.time')) AS pubdate
FROM
    http://gold.jrj.com.cn/list/hjzx.shtml

# [
#   { title: "", summary: "", pubdate: "" },
#   { title: "", summary: "", pubdate: "" }
#   ...
# ]
```

* 由于以下三个css选择器
  * `css('.contentLeft .time-text')`
  * `css('.contentLeft .bottomWrap .readingNum:last-child')`
  * `css('.contentLeft .overHidden')`
* 在文档中选择到的都是一个列表，所以会进行 __对应位置合并(zip)__ 后输出（不能有错位）

### 抓取表格

以 https://www.yuncaijing.com/story/details/id_1287.html 为例

```sql
# 抓取 相关股票, 关联原因, 相关性
SELECT
    text(css('.child-wrap table tbody tr td:nth-child(1)')) AS stock,
    text(css('.child-wrap table tr td:nth-child(4) span span')) AS reason,
    text(css('.child-wrap table tr td:nth-child(5)')) AS relate
FROM
    https://www.yuncaijing.com/story/details/id_1287.html
```

## 语法

### 注释

cql 中使用 `#` 开头的为注释

### SET

可以在 cql 中通过 `SET` 子句设置以下参数：

* ENCODING -> 下载完html后使用指定的格式进行解码，默认为 `utf8`

## 一些解释

### 关于列表/表格抓取合并（zip）输出

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
