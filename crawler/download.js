const request = require("request-promise-native");
const iconv = require("iconv-lite");


module.exports = async function (url, {
    timeout = 10000, // 10s 超时
    headers = {},
    encoding = "utf8",
} = {}) {
    if (!iconv.encodingExists(encoding)) {
        throw `iconv does not support encoding [${encoding}]`;
    }

    let buf = await request({
        uri: url,
        headers: Object.assign(headers, {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36"
        }),
        encoding: null,
        timeout
    });

    return iconv.decode(buf, encoding);
}
