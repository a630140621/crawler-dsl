const expect = require("chai").expect;
const extract = require("../crawler/extract");
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "./mock/detail.html"), {
    encoding: "utf8"
});


describe("extract", () => {
    it("extract title", () => {
        let script = {
            title: 'text(css("h1"))'
        };
        expect(extract(html, script)).to.be.an("object").that.deep.equal({
            title: "微视频 | 愿得此身长报国"
        });
    })
    it("extract title and pubdate", () => {
        let script = {
            title: 'text(css("h1"))',
            t: 'text(css("h1"))',
            pubdate: 'regex("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}", text(css(".post_time_source")))'
        };
        expect(extract(html, script)).to.be.an("object").that.deep.equal({
            title: "微视频 | 愿得此身长报国",
            t: "微视频 | 愿得此身长报国",
            pubdate: "2020-02-17 13:22:54"
        });
    });
});