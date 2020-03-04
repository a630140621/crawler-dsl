process.env.NODE_ENV = "unittest";
const expect = require("chai").expect;
const compile = require("../../crawler/cql/compile");


describe("compile", () => {
    it("compile.compile 1", () => {
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
            from: {
                subselect: "",
                urls: [
                    "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html"
                ]
            },
            select_script: {
                title: "text(css('#title'))",
                content: "html(css('#content'))"
            },
            set: {
                ENCODING: "gb2312"
            }
        });
    });

    it("compile.compile 2", () => {
        let cql = `
            # 抓取 相关股票, 关联原因, 相关性
            SELECT
                text(css('.child-wrap table tbody tr td:nth-child(1)')) AS stock,
                text(css('.child-wrap table tr td:nth-child(4) span span')) AS reason,
                text(css('.child-wrap table tr td:nth-child(5)')) AS relate
            FROM
                https://www.yuncaijing.com/story/details/id_1287.html`;
        expect(compile.compile(cql)).to.be.an("object").and.that.deep.equal({
            from: {
                subselect: "",
                urls: [
                    "https://www.yuncaijing.com/story/details/id_1287.html"
                ]
            },
            select_script: {
                stock: "text(css('.child-wrap table tbody tr td:nth-child(1)'))",
                reason: "text(css('.child-wrap table tr td:nth-child(4) span span'))",
                relate: "text(css('.child-wrap table tr td:nth-child(5)'))"
            },
            set: {}
        });
    });

    it("compile.compile with sub SELECT", () => {
        let cql = `
            SELECT
                $("h1") AS title
            FROM (
                SELECT 
                    $$("#js_top_news a") AS url
                FROM https://news.163.com
            )
        `;
        expect(compile.compile(cql)).to.be.an("object").and.that.deep.equal({
            from: {
                subselect: `SELECT $$("#js_top_news a") AS url FROM https://news.163.com`,
                urls: []
            },
            select_script: {
                title: `$("h1")`,
            },
            set: {}
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
    it("compile.getSplitList with subselect", () => {
        let string = `
                SELECT  xxx AS xxxx
                FROM (
                    SELECT 
                        $$("#js_top_news a") AS url
                    FROM https://news.163.com
                )`.trim().replace(/\s+/g, " ");

        expect(compile.getSplitList(string, ["select", "from"])).to.be.an("object")
            .and.deep.equal({
                SELECT: "xxx AS xxxx",
                FROM: `( SELECT $$("#js_top_news a") AS url FROM https://news.163.com )`
            });
    });
});