/**
 * 处理 from 子句
 * @return { subselect: "", urls: [] }
 */
exports.handleFrom = function (from) {
    let ret = {
        subselect: "",
        urls: []
    };
    if (from) {
        if (from[0] === "(") ret["subselect"] = getSubselect(from);
        else ret["urls"] = getUrls(from);
    }

    return ret;
};

// @return ["url"]
function getUrls(from) {
    return from.split(/,\s*/);
}

// @return subselect
function getSubselect(from) {
    let _from = from.slice(1, from.length - 1).trim(); // 去除前后 () 和 空格
    return _from;
}