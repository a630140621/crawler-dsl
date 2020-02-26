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

    // @return ["text"]
    function text($_) {
        let ret = [];
        // 虽然下述是回调函数形式，但是是同步执行的
        $_.each(function (i, elem) {
            ret.push($(this).text().trim());
        });
        return ret;
    }
    
    // @return ["html"]
    function html($_) {
        let ret = [];
        // 虽然下述是回调函数形式，但是是同步执行的
        $_.each(function (i, elem) {
            ret.push($(this).toString().trim());
        });
        return ret;
    }

    /**
     * 使用正则表达式匹配文本内容，
     * 如果没传第二个参数，则全文匹配，并返回匹配到的第一个值
     * 如果传入第二个参数，则第二个参数必须是数组，对于每个元素执行一次匹配，返回匹配到的第一个值，若没匹配到则返回 ""
     * @param {RegExp} regex 正则表达式
     * @param {[String]} texts 
     * 
     * @return [""]
     */
    function regex(regex, texts) {
        if (!texts) texts = [$.html()];
        let ret = [];
        for (let text of texts) {
            let match = text.match(regex);
            if (!match) ret.push("");
            else ret.push(match[0].trim());
        }

        return ret;
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