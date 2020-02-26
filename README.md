# crawler-cql

使用cql实现爬虫

## 基础示例

### 抓取详情页（单页）

```bash
crawl --cql 'SET ENCODING=gbk SELECT text(css('h1')) AS title FROM https://news.163.com/20/0217/13/F5JDV8GD000189FH.html'
# [ { title: '微视频 | 愿得此身长报国' } ]
```

或抓取多页

```bash
crawl --cql 'SET ENCODING=gbk SELECT text(css("h1")) AS title FROM https://news.163.com/20/0217/13/F5JDV8GD000189FH.html, https://news.163.com/20/0225/11/F67P1C0Q000189FH.html'
# [
#   { title: '微视频 | 愿得此身长报国' },
#   { title: '世卫组织强调新冠肺炎疫情仍未构成“大流行病”' }
# ]
```

## 语法

### 注释

cql 中使用 `#` 开头的为注释
