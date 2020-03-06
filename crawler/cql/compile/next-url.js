/**
 * 处理 NEXT_URL 子句
 * 
 * 子句目前可为:
 *  1. url1, url2, ...
 *  2. href($('a'))
 */
module.exports = function(next) {
    let ret = {};
    if (!next) return ret;
    if (next.startsWith("http://") || next.startsWith("https://")) {
        ret["urls"] = next.split(/\s*,\s*/);
    } else {
        ret["selector"] = next;
    }

    return ret;
};