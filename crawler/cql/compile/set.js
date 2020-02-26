// 处理 set 子句
exports.getSet = function(set) {
    if (!set) return {};
    let ret = {};
    let secs = set.split(/,\s*/);
    for (let sec of secs) {
        let item = sec.split("=");
        ret[item[0].toUpperCase()] = item[1];
    }
    return ret;
};
