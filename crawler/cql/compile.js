function compile(string) {
    string = string.trim().replace(/\s+/g, " "); // 去除前后空格符以及多余的空格符
    let {
        SELECT,
        FROM,
        SET
    } = getSplitList(string, ["SELECT", "FROM", "SET"]);

    let urls = getUrlListFromFROMSection(FROM);
    let select_script = splitSELECT(SELECT);
    let set = splitSET(SET);

    return {
        from_urls: urls,
        select_script,
        set
    };
}


/**
 * @param {string} cql 
 * @param {[string]} keywords []
 * 
 * @return {[Object]} [{ [keyword]: "" }]
 * eg.
 *  getSplitList("SELECT xxx FROM xxxx", ["SELECT", "FROM"])
 *  return: {
 *      SELECT: "xxx",
 *      FROM: "xxxx"
 *  }
 */
function getSplitList(cql, keywords = []) {
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


/**
 * 切分 select section
 * @param {string} select SELECT 字符串
 * 
 * eg1:
 *  splitSELECT("text(css("#epContentLeft")) AS title, html(css("#endText")) AS content")
 *  return: {
 *      title: "text(css("#epContentLeft"))",
 *      content: "html(css("#endText"))"
 *  }
 */
function splitSELECT(select) {
    let stack = []; // 用于匹配成对的 ()
    let pairs = [];
    let token = "";
    let i = 0;
    while (i < select.length) {
        let ch = select[i];
        if (ch === "(") stack.push("(");
        if (ch === ")") stack.pop(")");
        if (ch === " " && select.slice(i, i + 4) === " AS ") { // 是 token
            i += 4;
            pairs.push(token);
            token = "";
            continue;
        }
        i += 1;
        if (ch === "," && stack.length === 0) {
            pairs.push(token);
            token = "";
            continue;
        }
        if (ch === " " && token  === "") { // 去掉开头的空格
            continue;
        }
        token += ch;
    }
    pairs.push(token); // 增加最后一个值

    let ret = {};
    for (let index = 0; index < pairs.length; index += 2) {
        if (index % 2 == 0) { // 偶数
            ret[pairs[index + 1]] = pairs[index];
        }
    }
    
    return ret;
}


/**
 * @param {String} cql ENCODING=gbk, ENGINE=puppeteer
 * 
 * @return {Object} { ENCODING: "gbk", ENGINE: "puppeteer" }
 */
function splitSET(cql) {
    if (!cql) return {};
    let ret = {};
    let secs = cql.split(/,\s*/);
    for (let sec of secs) {
        let item = sec.split("=");
        ret[item[0].toUpperCase()] = item[1];
    }
    return ret;
}


/**
 * 从 from 字句中提取 url 列表
 * @param {string} from 
 */
function getUrlListFromFROMSection(from) {
    return from.split(/,\s*/);
}

module.exports = compile;

if (process.env.NODE_ENV === "unittest") {
    module.exports = {
        splitSELECT,
        getSplitList,
        getUrlListFromFROMSection,
        splitSET
    };
}