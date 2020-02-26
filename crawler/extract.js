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

    let ret = {};
    for (let [key, script] of Object.entries(select_script)) {
        ret[key] = buildin.evalBuildInScript($, script);
    }

    return ret;
};