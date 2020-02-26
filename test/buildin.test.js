const expect = require("chai").expect;
const buildin = require("../crawler/cql/buildin");
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "./mock/detail.html"), {
    encoding: "utf8"
});
const cheerio = require("cheerio");
const $ = cheerio.load(html, {
    decodeEntities: false
});


describe("buildin", () => {
    it("extract title use text() and css()", () => {
        let script = "text(css('h1'))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(1).and.that.include("微视频 | 愿得此身长报国");
    });
    it("extract title which text() and css() which does not match", () => {
        let script = "text(css('.does .not .exist'))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").that.empty;
    });
    it("extract pubdate use regex with two params", () => {
        let script = "regex('\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}', text(css('#epContentLeft')))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(1).and.that.include("2020-02-17 13:22:54");
    });
    it("extract pubdate in specify area wich does not match", () => {
        let script = "regex('\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}', text(css('#epContentRight')))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(1).and.that.include("");
    });
    it("extract pubdate use regex with two params which does not match", () => {
        let script = "regex('这是随便写的一个正则字符串...', text(css('#epContentLeft')))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(1).and.that.include("");
    });
    it("extract pubdate use regex with one params", () => {
        let script = "regex(/\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/ig)";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(1).and.that.include("2020-02-17 13:22:54");
    });
    it("extract origin  use text() and css()", () => {
        let script = "text(css('#ne_article_source'))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(1).and.that.include("央视新闻客户端");
    });
    it("extract title html use html() and css()", () => {
        let script = "html(css('h1'))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(1).and.that.include("<h1>微视频 | 愿得此身长报国</h1>");
    });
});