// 处理 select 子句

/**
 * 切分 select section
 * @param {string} select SELECT 字符串
 * 
 * eg1:
 *  getSelect("text(css("#epContentLeft")) AS title, html(css("#endText")) AS content")
 *  return: {
 *      title: "text(css("#epContentLeft"))",
 *      content: "html(css("#endText"))"
 *  }
 */
exports.getSelect = function (select) {
    let stack = []; // 用于匹配成对的 ()
    let pairs = [];
    let token = "";
    let i = 0;
    while (i < select.length) {
        let ch = select[i];
        if (ch === "(") stack.push("(");
        if (ch === ")") stack.pop(")");
        if (ch === " " && select.slice(i, i + 4).toUpperCase() === " AS ") { // 是 token
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
        if (ch === " " && token === "") { // 去掉开头的空格
            continue;
        }
        token += ch;
    }
    pairs.push(token); // 增加最后一个值

    let ret = {};
    for (let index = 0; index < pairs.length; index += 2) {
        ret[pairs[index + 1]] = pairs[index];
    }

    return ret;
};