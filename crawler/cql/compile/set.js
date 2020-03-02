/**
 * 处理 set 子句
 * 目前可以设置的变量有:
 *  - ENCODING
 *  - DOWNLOAD_TIMEOUT
 *  - DOWNLOAD_ENGINE: "puppeteer" or ""
 */
exports.getSet = function(set) {
    if (!set) return {};
    let ret = {};
    let secs = set.split(/,\s*/);
    for (let sec of secs) {
        let item = sec.split("=");
        let key = item[0].toUpperCase();
        if (key === "DOWNLOAD_TIMEOUT") {
            let timeout = Number(item[1]);
            if (Number.isNaN(timeout)) timeout = 30000;
            ret[key] = timeout;
            continue;
        }
        ret[key] = item[1];
    }
    return ret;
};
