process.env.NODE_ENV = "unittest";
const expect = require("chai").expect;
const compile = require("../../crawler/cql/compile");


describe("compile", () => {
    it("compile.compile", () => {
        let cql = `
            # some comment
            set encoding=gb2312
            select 
                text(css('#title')) AS title,
                html(css('#content')) as content
            # other comment
            from
                https://news.163.com/20/0217/13/F5JDV8GD000189FH.html
        `;

        expect(compile.compile(cql)).to.be.an("object").and.that.deep.equal({
            from_urls: [
                "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html"
            ],
            select_script: {
                title: "text(css('#title'))",
                content: "html(css('#content'))"
            },
            set: {
                ENCODING: "gb2312"
            }
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
});