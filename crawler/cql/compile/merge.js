// 处理 MERGE 子句
module.exports = function(merge) {
    if (!merge) return [];
    return merge.split(/\s*,\s*/);
};