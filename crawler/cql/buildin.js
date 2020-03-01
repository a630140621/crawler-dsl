const debug = require("debug")("cql:compile:buildin");


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


// script: "text($('li'))"
function wrapper(_$, script) {
    // 内置函数
    function $(selector) {
        let node = _$(selector);
        node.$ = true; // 后续调用 attr, text, html 等内置函数 时返回字符串
        return node;
    }

    function $$(selector) {
        return _$(selector);
    }

    function css(selector) {
        return $$(selector);
    }

    // 获取节点属性
    function attr($_, attribute) {
        debug(`run buildin func attr to get attribute ${attribute}`);
        if ($_.$) return $_.eq(0).attr(attribute) || "";
        else {
            let ret = [];
            $_.each(function (i, elem) {
                ret.push(_$(this).attr(attribute) || "");
            });

            return ret;
        }
    }

    function href($_) {
        return attr($_, "href");
    }

    function src($_) {
        return attr($_, "src");
    }

    // @return "text" or ["text"]
    function text($_) {
        debug(`run buildin func text`);
        if ($_.$) return $_.eq(0).text().trim();
        else {
            let ret = [];
            // 虽然下述是回调函数形式，但是是同步执行的
            $_.each(function (i, elem) {
                ret.push(_$(this).text().trim());
            });

            return ret;
        }
    }

    // @return "html", ["html"]
    function html($_) {
        debug(`run buildin func html`);
        if ($_.$) return $_.eq(0).toString().trim();
        else {
            let ret = [];
            // 虽然下述是回调函数形式，但是是同步执行的
            $_.each(function (i, elem) {
                ret.push(_$(this).toString().trim());
            });

            return ret;
        }
    }

    /**
     * 使用正则表达式匹配文本内容，
     * 如果没传第二个参数，则全文匹配，并返回匹配到的第一个值
     * 如果传入第二个参数：
     *  1. 第二个参数是字符串数组，对数组中的每个元素执行一次匹配，返回匹配到的第一个值，若没匹配到则返回 []
     *  2. 第二个参数是 字符串，对该字符串执行一次匹配，返回匹配到的第一个值，若没匹配到则返回 ""
     * @param {RegExp} regex 正则表达式
     * @param {[String]} texts 
     */
    function regex(regex, texts) {
        debug(`run buildin func regex on texts = ${texts}`);
        if (typeof texts === "string" || !texts) {
            let text;
            if (typeof texts === "string") text = texts;
            else text = _$.html();
            let match = text.match(regex);
            if (!match) return "";
            return match[0].trim();
        } else {
            let ret = [];
            for (let text of texts) {
                let match = text.match(regex);
                if (!match) ret.push("");
                else ret.push(match[0].trim());
            }
            return ret;
        }
    }


    function runCodeWithBuildIn(func_str) {
        return Function(`return (${func_str})`)()(
            $,
            $$,
            css,
            text,
            regex,
            html,
            attr,
            href,
            src
        );
    }

    return runCodeWithBuildIn(`function($, $$, css, text, regex, html, attr, href, src){ return ${raw(script)} }`);
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
    debug(`run script ${script}`);
    return wrapper($, script);
};