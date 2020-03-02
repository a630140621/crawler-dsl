// 处理 select 子句

/**
 * 切分 select section
 * @param {string} select SELECT 字符串
 * 
 * eg1:
 *  getSelect("text(css('#epContentLeft')) AS title, html(css('#endText'))")
 *  return: {
 *      title: "text(css("#epContentLeft"))",
 *      "html(css('#endText'))": "html(css("#endText"))"
 *  }
 */
exports.getSelect = function (select) {
    let stack = []; // 用于匹配成对的 ()
    let pairs = [];
    let token = ""; // xxx[ AS xx]
    let i = 0;
    while (i < select.length) {
        let ch = select[i];
        if (ch === "(") stack.push("(");
        if (ch === ")") stack.pop(")");
        i += 1;
        if (ch === "," && stack.length === 0) {
            pairs.push(token);
            token = "";
            continue;
        }
        if (ch === " " && token === "") { // 无视开头的空格
            continue;
        }
        token += ch;
    }
    pairs.push(token); // 增加最后一个 pair

    return splitAS(pairs);
};

/**
 * @param {Array} pairs ["xx AS xxx", "xx", "xxx as xxx"]
 */
const as_regex = /\s+as\s+/i;
function splitAS(pairs) {
    let ret = {};
    for (let pair of pairs) {
        if (as_regex.test(pair)) {
            let sp = pair.split(as_regex);
            ret[sp[1]] = sp[0];
        } else {
            ret[pair] = pair;
        }
    }
    return ret;
}