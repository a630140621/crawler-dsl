// 将 字符串中的 \ 转换成 \\ 
function raw(string) {
    let start = false;
    // 是否以及匹配了起始的 ' 或 " 
    let ret = "";
    for (let ch of string) {
        if (ch === "'" || ch === "\"") start = !start;
        ret += ch;
        if (start && ch === "\\") ret += ch;
    }
    return ret;
}

function wrapper($, script) {
    // 内置函数
    function css(selector) {
        return $(selector);
    }

    function text($_) {
        return $_.text().trim();
    }

    function html($_) {
        return $_.toString().trim();
    }

    /**
     * 使用正则表达式匹配文本内容，如果没传第二个参数，则全文匹配
     * @param {RegExp} regex 正则表达式
     * @param {String} text 
     * 
     * @return 返回匹配的第一个字符串，之后考虑增加第三个参数来表示获取第几个匹配
     */
    function regex(regex, text) {
        if (!text) text = $.html();
        // let regex = new RegExp(regex_str);
        let match = text.match(regex);
        if (!match) return "";
        return match[0];
    }

    function runCodeWithBuildIn(func_str) {
        return Function(`return (${func_str})`)()(
            css,
            text,
            regex,
            html
        );
    }


    return runCodeWithBuildIn(`function(css, text, regex, html){ return ${raw(script)} }`);
}

/**
 * 运行 cql 中的内置函数
 * @param {object} $ cheerio 实例
 * @param {string} script 
 * 
 * eg.
 *  evalBuildInScript($, "text(css("#id"))")
 */
exports.evalBuildInScript = function ($, script) {
    // console.log(`execute script: ${script}`);
    return wrapper($, script);
};