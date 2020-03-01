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

const fruits = cheerio.load(`
<ul id="fruits">
    <li class="apple">Apple</li>
    <li class="orange">Orange</li>
    <li class="pear">Pear</li>
</ul>`);

describe("buildin", () => {
    it("buildin.$ with text() should return first node innerText", () => {
        expect(buildin.evalBuildInScript(fruits, "text($('li'))")).to.be.a("string").that.equal("Apple");
    });
    it("buildin.$ with text() should return first node innerText", () => {
        expect(buildin.evalBuildInScript(fruits, "text($('ul'))")).to.be.a("string").that.contain("Apple").contain("Orange").contain("Pear");
    });
    it("buildin.$ with text() should return '' if not match", () => {
        expect(buildin.evalBuildInScript(fruits, "text($('none'))")).to.be.a("string").that.empty;
    });

    it("buildin.$$ with text() should return array which have each node innerText", () => {
        expect(buildin.evalBuildInScript(fruits, "text($$('li'))")).to.be.an("array")
            .that.have.length(3)
            .and.include("Apple").include("Orange").include("Pear");
    });
    it("buildin.$$ with text() should return [] if not match", () => {
        expect(buildin.evalBuildInScript(fruits, "text($$('none'))")).to.be.an("array").that.empty;
    });

    it("extract title use text() and css()", () => {
        let script = "text(css('h1'))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(1).and.that.include("微视频 | 愿得此身长报国");
    });
    it("extract title which text() and css() which does not match", () => {
        let script = "text(css('.does .not .exist'))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").that.empty;
    });


    it("buildin.regex with $", () => {
        let script = "regex('\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}', text($('#epContentLeft')))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("string").that.equal("2020-02-17 13:22:54");
    });
    it("buildin.regex with $", () => {
        let script = "regex('\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{3}', text($('#epContentLeft')))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("string").that.equal("");
    });
    it("buildin.regex extract pubdate use regex with two params", () => {
        let script = "regex('\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}', text(css('#epContentLeft')))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(1).and.that.include("2020-02-17 13:22:54");
    });
    it("buildin.regex extract pubdate in specify area wich does not match", () => {
        let script = "regex('\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}', text(css('#epContentRight')))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(1).and.that.include("");
    });
    it("buildin.regex extract pubdate use regex with two params which does not match", () => {
        let script = "regex('这是随便写的一个正则字符串...', text(css('#epContentLeft')))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(1).and.that.include("");
    });
    it("buildin.regex extract pubdate use regex with one params", () => {
        let script = "regex(/\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/ig)";
        expect(buildin.evalBuildInScript($, script)).to.be.an("string").and.that.equal("2020-02-17 13:22:54");
    });


    it("extract origin  use text() and css()", () => {
        let script = "text(css('#ne_article_source'))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(1).and.that.include("央视新闻客户端");
    });
    it("extract title html use html() and css()", () => {
        let script = "html(css('h1'))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(1).and.that.include("<h1>微视频 | 愿得此身长报国</h1>");
    });
    it("extract title html use html() and $$()", () => {
        let script = "html($$('h1'))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(1).and.that.include("<h1>微视频 | 愿得此身长报国</h1>");
    });
    it("extract title html use html() and $()", () => {
        let script = "html($('h1'))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("string").that.equal("<h1>微视频 | 愿得此身长报国</h1>");
    });

    it("buildin.src extract first <img> src use src() and $()", () => {
        let script = "src($('.post_body li img'))";
        let html = `
        <ul class="post_body">
            <li><img src="http://www.demo.org/test1"></li>
            <li><img src="http://www.demo.org/test2"></li>
        </ul>`;
        expect(buildin.evalBuildInScript(cheerio.load(html), script)).to.be.an("string").that.equal("http://www.demo.org/test1");
    });
    it("buildin.attr extract first <img> src use attr() and $()", () => {
        let script = "attr($$('.post_body li img'), 'src')";
        let html = `
        <ul class="post_body">
            <li><img src="http://www.demo.org/test1"></li>
            <li><img src="http://www.demo.org/test2"></li>
        </ul>`;
        expect(buildin.evalBuildInScript(cheerio.load(html), script)).to.be.an("array")
            .that.have.length(2)
            .and.include("http://www.demo.org/test1").include("http://www.demo.org/test2");
    });
    it("buildin.src extract <img> src use src() and css()", () => {
        let script = "src(css('.post_body p img'))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(6);
    });
    it("buildin.src extract <img> src use src() and $$()", () => {
        let script = "src($$('.post_body p img'))";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(6);
    });
    it("buildin.attr extract <img> src use attr() and css()", () => {
        let script = "attr(css('.post_body p img'), 'src')";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(6);
    });
    it("buildin.attr extract <img> src use attr() and $$()", () => {
        let script = "attr($$('.post_body p img'), 'src')";
        expect(buildin.evalBuildInScript($, script)).to.be.an("array").have.length(6);
    });
    it("buildin.href with buildin.$ should return string", () => {
        let script = "href($('a'))";
        expect(buildin.evalBuildInScript(cheerio.load("<a href='http://www.baidu.com'>百度</a>"), script))
            .to.be.a("string").that.equal("http://www.baidu.com");
    });
    it("buildin.href with buildin.$ should return string", () => {
        let script = "href($('div'))";
        expect(buildin.evalBuildInScript(cheerio.load("<div>no href</div>"), script))
            .to.be.a("string").that.equal("");
    });
    it("buildin.href with buildin.$$ should return [string]", () => {
        let script = "href($$('a'))";
        expect(buildin.evalBuildInScript(cheerio.load("<a href='http://www.baidu.com'>百度</a>"), script))
            .to.be.an("array").that.have.length(1).and.include("http://www.baidu.com");
    });
    it("buildin.href with buildin.$$ should return ['']", () => {
        let script = "href($$('div'))";
        expect(buildin.evalBuildInScript(cheerio.load("<div>百度</div>"), script))
            .to.be.an("array").that.have.length(1).and.include("");
    });
});