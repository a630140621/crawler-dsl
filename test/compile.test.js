process.env.NODE_ENV = "unittest";
const expect = require("chai").expect;
const compile = require("../crawler/cql/compile");


describe("compile", () => {
    it("compile.getUrlListFromFROMSection should return list with length 1", () => {
        let from = "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html";
        expect(compile.getUrlListFromFROMSection(from)).to.be.an("array")
            .with.length(1)
            .and.include("https://news.163.com/20/0217/13/F5JDV8GD000189FH.html");
    });
    it("compile.getUrlListFromFROMSection should return list with length 2", () => {
        let from = "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html, https://news.163.com/20/0225/11/F67P1C0Q000189FH.html";
        expect(compile.getUrlListFromFROMSection(from)).to.be.an("array")
            .with.length(2)
            .and.include("https://news.163.com/20/0217/13/F5JDV8GD000189FH.html")
            .and.include("https://news.163.com/20/0225/11/F67P1C0Q000189FH.html");
    });
    it("compile.getUrlListFromFROMSection should return list with length 2", () => {
        let from = "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html,https://news.163.com/20/0225/11/F67P1C0Q000189FH.html";
        expect(compile.getUrlListFromFROMSection(from)).to.be.an("array")
            .with.length(2)
            .and.include("https://news.163.com/20/0217/13/F5JDV8GD000189FH.html")
            .and.include("https://news.163.com/20/0225/11/F67P1C0Q000189FH.html");
    });
    it("compile.getUrlListFromFROMSection should return list with length 3", () => {
        let from = "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html,   https://news.163.com/20/0225/11/F67P1C0Q000189FH.html,xxx";
        expect(compile.getUrlListFromFROMSection(from)).to.be.an("array")
            .with.length(3)
            .and.include("https://news.163.com/20/0217/13/F5JDV8GD000189FH.html")
            .and.include("https://news.163.com/20/0225/11/F67P1C0Q000189FH.html")
            .and.include("xxx");
    });


    it("compile.splitSELECT should return object with one key", () => {
        let select = `text(css("#epContentLeft")) AS title`;
        expect(compile.splitSELECT(select)).to.be.an("object")
            .that.have.all.keys(["title"])
            .has.own.property("title", `text(css("#epContentLeft"))`);
    });
    it("compile.splitSELECT should return object with three keys", () => {
        let select = `text(css("#epContentLeft")) AS title, html(css("#endText")) AS content, regex(text(css(".post_time_source")), "yyyy-MM-dd hh:mm:ss") AS pubdate`;
        expect(compile.splitSELECT(select)).to.be.an("object")
            .that.have.all.keys("title", "content", "pubdate")
            .and.deep.equal({
                "title": `text(css("#epContentLeft"))`,
                "content": `html(css("#endText"))`,
                "pubdate": `regex(text(css(".post_time_source")), "yyyy-MM-dd hh:mm:ss")`
            });
    });
    it("compile.splitSELECT should return object with three keys instead of four", () => {
        let select = `text(css("#asContentLeft") ) AS title, html(css("h1 #endText")) AS content, regex( text(css(".post_time_source")),   "yyyy-MM-dd hh:mm:ss") AS pubdate`;
        expect(compile.splitSELECT(select)).to.be.an("object")
            .that.deep.equal({
                title: `text(css("#asContentLeft") )`,
                content: `html(css("h1 #endText"))`,
                pubdate: `regex( text(css(".post_time_source")),   "yyyy-MM-dd hh:mm:ss")`
            });
    });


    it("compile.getSplitList should return object with two keys", () => {
        let string = `
            SELECT
                text(css("#epContentLeft")) AS title,
                html(css("#endText")) AS content,
                regex(text(css(".post_time_source")), "yyyy-MM-dd hh:mm:ss") AS pubdate
            FROM
                https://news.163.com/20/0217/13/F5JDV8GD000189FH.html,
                https://news.163.com/20/0225/11/F67P1C0Q000189FH.html`.trim().replace(/\s+/g, " ");

        expect(compile.getSplitList(string, ["SELECT", "FROM"])).to.be.an("object")
            .and.deep.equal({
                SELECT: `text(css("#epContentLeft")) AS title, html(css("#endText")) AS content, regex(text(css(".post_time_source")), "yyyy-MM-dd hh:mm:ss") AS pubdate`,
                FROM: `https://news.163.com/20/0217/13/F5JDV8GD000189FH.html, https://news.163.com/20/0225/11/F67P1C0Q000189FH.html`
            });
    });
    it("compile.getSplitList should return object with three keys", () => {
        let string = `
            SELECT
                text(css("#epContentLeft")) AS title
            FROM
                https://news.163.com/20/0217/13/F5JDV8GD000189FH.html,
                https://news.163.com/20/0225/11/F67P1C0Q000189FH.html
            WHERE
                demo`.trim().replace(/\s+/g, " ");

        expect(compile.getSplitList(string, ["SELECT", "FROM", "WHERE"])).to.be.an("object")
            .and.deep.equal({
                SELECT: `text(css("#epContentLeft")) AS title`,
                FROM: `https://news.163.com/20/0217/13/F5JDV8GD000189FH.html, https://news.163.com/20/0225/11/F67P1C0Q000189FH.html`,
                WHERE: `demo`
            });
    });
    it("compile.getSplitList should return object with three keys instead of four", () => {
        let string = `
            DEFINE url=https://news.feheadline.com/from/page.html
            SELECT  xxx AS xxxx
            FROM url`.trim().replace(/\s+/g, " ");

        expect(compile.getSplitList(string, ["define", "select", "from"])).to.be.an("object")
            .and.deep.equal({
                DEFINE: "url=https://news.feheadline.com/from/page.html",
                SELECT: "xxx AS xxxx",
                FROM: "url"
            });
    });


    it("compile.splitSET should return {ENCODING: 'gbk'}", () => {
        let set = "ENCODING=gbk";
        expect(compile.splitSET(set)).to.be.an("object").and.that.deep.equal({
            "ENCODING": "gbk"
        });
    });
    it("compile.splitSET should return {ENCODING: 'gbk', ENGINE: 'puppeteer'}", () => {
        let set = "ENCODING=gbk, engine=puppeteer";
        expect(compile.splitSET(set)).to.be.an("object").and.that.deep.equal({
            "ENCODING": "gbk",
            "ENGINE": "puppeteer"
        });
    });
    it("compile.splitSET should return {}", () => {
        expect(compile.splitSET("")).to.be.an("object").which.is.empty;
    });
});