const comment = require("./comment");
const from = require("./from");
const set = require("./set");
const select = require("./select");


function compile(cql) {
    // 去除注释
    let _cql = comment.removeComment(cql);
    // 去除前后空格符以及多余的空格符
    _cql = _cql.trim().replace(/\s+/g, " ");

    let {
        SELECT,
        FROM,
        SET
    } = getSplitList(_cql, ["SELECT", "FROM", "SET"]);

    return {
        from_urls: from.getUrlList(FROM),
        select_script: select.getSelect(SELECT),
        set: set.getSet(SET)
    };
}


/**
 * @param {string} cql 
 * @param {[string]} keywords
 * 
 * @return {[Object]} [{ [keyword]: "" }]
 * eg.
 *  getSplitList("SELECT xxx FROM xxxx", ["SELECT", "FROM"])
 *  return: {
 *      SELECT: "xxx",
 *      FROM: "xxxx"
 *  }
 */
function getSplitList(cql, keywords) {
    // 将 cql 按照 keywords 分解成 区块
    let sections_regex = new RegExp(`${keywords.join("|")}\\s+`, "ig"); // 需要作为一个区块单独处理
    let match;
    let list = [],
        item = {}; // {keywords: "", start_index: int, end_index: int}
    while ((match = sections_regex.exec(cql)) !== null) {
        if ("keyword" in item) item["end_index"] = match["index"];
        if ("end_index" in item) {
            list.push(item);
        }
        item = {
            keyword: match[0].toUpperCase(),
            start_index: sections_regex.lastIndex
        };
    }
    item.end_index = cql.length;
    list.push(item);

    // 提取 区块
    let ret = {};
    for (let item of list) {
        ret[item["keyword"].trim()] = cql.slice(item["start_index"], item["end_index"]).trim();
    }

    return ret;
}


module.exports = compile;

// 为了 coverage 测试
if (process.env.NODE_ENV === "unittest") {
    module.exports = {
        getSplitList,
        compile
    };
}