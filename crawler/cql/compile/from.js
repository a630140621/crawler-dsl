// 处理 from 子句

// @return ["url"]
exports.getUrlList = function(from) {
    return from.split(/,\s*/);
};