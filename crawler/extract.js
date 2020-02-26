const cheerio = require("cheerio");
const buildin = require("./cql/buildin");


/**
 * @param {string} html
 * @param {Object} { [variable]: "extract script" }
 */
module.exports = function (html, select_script) {
    let $ = cheerio.load(html, {
        decodeEntities: false
    });

    let combine = {}; // key -> []
    for (let [key, script] of Object.entries(select_script)) {
        combine[key] = buildin.evalBuildInScript($, script);
    }

    // combine 键对应值中数组长度的最大值
    let combine_max_length = 0;
    for (let value of Object.values(combine)) {
        if (value.length > combine_max_length) combine_max_length = value.length;
    }

    // zip
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