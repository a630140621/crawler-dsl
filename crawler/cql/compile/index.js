const comment = require("./comment");
const from = require("./from");
const set = require("./set");
const select = require("./select");
const Trie = require("../../../lib/Trie.class");
const limit = require("./limit");


function compile(cql) {
    // 去除注释
    let _cql = comment.removeComment(cql);
    // 去除前后空格符以及多余的空格符
    _cql = _cql.trim().replace(/\s+/g, " ");

    let {
        SELECT,
        FROM,
        SET,
        LIMIT
    } = getSplitList(_cql, ["SELECT", "FROM", "SET", "LIMIT"]);

    let ret = {
        from: from.handleFrom(FROM),
        select_script: select.getSelect(SELECT)
    };
    let _set = set.getSet(SET);
    if (Object.keys(_set).length > 0) ret["set"] = _set;
    let _limit = limit(LIMIT);
    if (_limit || _limit === 0) ret["limit"] = _limit;

    return ret;
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
    let trie = new Trie(keywords.map(keyword => keyword.toUpperCase()));
    let i = 0;
    let stack = []; // 匹配 ()
    let token = "";
    let tokens = []; // "keyword1", "xxx", "keyword2", "xxxx", ...
    outter:
    while (i < cql.length) {
        let ch = cql[i];
        if (ch === "(") stack.push("(");
        if (ch === ")") stack.pop();
        if (ch === " " && token === "") { // 去除多余的空格
            i += 1;
            continue;
        }
        if (stack.length === 0 && trie.startsWith(ch.toUpperCase())) { // 不在 () 中，且当前字母是关键词的开头
            let keywords = trie.getStartsWith(ch.toUpperCase());
            for (let keyword of keywords) { // 所有可能的关键词
                let word = cql.slice(i, i + keyword.length);
                if (word.toUpperCase() === keyword && cql[i + keyword.length] === " ") { // 是关键词
                    if (token) {
                        tokens.push(token);
                        token = "";
                    }
                    tokens.push(keyword);
                    i += keyword.length;
                    continue outter;
                }
            }
            
        }

        token += ch;
        i += 1;
    }
    tokens.push(token);
    
    // combine
    let ret = {};
    for (let i = 0; i < tokens.length; i += 2) {
        ret[tokens[i]] = tokens[i + 1].trimRight();
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