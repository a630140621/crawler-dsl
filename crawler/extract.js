const cheerio = require("cheerio");
const buildin = require("./cql/buildin");


/**
 * @param {string} html
 * @param {Object} { [variable]: "extract script" }
 */
module.exports = function (html, select_script, origin_url) {
    let $ = cheerio.load(html, {
        decodeEntities: false
    });

    let combine = {};
    for (let [key, script] of Object.entries(select_script)) {
        combine[key] = buildin.evalBuildInScript($, script, origin_url);
    }

    let is_zip = true; // 是否需要自动 zip
    // combine 键对应值中数组长度的最大值
    let combine_max_length = 0;
    for (let value of Object.values(combine)) {
        if (!Array.isArray(value)) {
            is_zip = false;
            break;
        }
        if (value.length > combine_max_length) combine_max_length = value.length;
    }

    // 提取的内容不需要 zip 操作
    if (!is_zip) return combine;
    // 如果返回的是数组，则需要 zip
    let ret = [];
    for (let i = 0; i < combine_max_length; i++) {
        let item = {};
        for (let key of Object.keys(combine)) {
            if (combine[key].length > i) item[key] = combine[key][i];
        }
        ret.push(item);
    }

    return ret;
};