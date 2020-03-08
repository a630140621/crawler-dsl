process.env.NODE_ENV = "unittest";
const expect = require("chai").expect;
const compile = require("../../crawler/cql/compile");


describe("compile", () => {
    it("compile.compile with NEXT URL and MERGE", () => {
        let cql = `
        SET
            DOWNLOAD_TIMEOUT=-1,
            DOWNLOAD_ENGINE=puppeteer
        SELECT
            text($('h3')) AS title,
            text($('.forum-content')) AS content
        FROM
            https://www.esjzone.cc/forum/1546618252/57514.html
        NEXT URL
            href($('.btn-next'))`;

        expect(compile.compile(cql)).to.be.an("object").that.deep.equal({
            set: {
                DOWNLOAD_ENGINE: "puppeteer",
                DOWNLOAD_TIMEOUT: -1
            },
            select_script: {
                title: "text($('h3'))",
                content: "text($('.forum-content'))"
            },
            from: {
                subselect: "",
                urls: [
                    "https://www.esjzone.cc/forum/1546618252/57514.html"
                ]
            },
            next_url: {
                selector: "href($('.btn-next'))"
            }
        });
    });

    it("compile.compile with NEXT URL with url and MERGE", () => {
        let cql = `
        SET
            DOWNLOAD_TIMEOUT=-1,
            DOWNLOAD_ENGINE=puppeteer
        SELECT
            text($('h3')) AS title,
            text($('.forum-content')) AS content
        FROM
            https://www.esjzone.cc/forum/1546618252/57514.html
        NEXT URL
            https://www.esjzone.cc/forum/1546618252/57517.html
        MERGE content`;

        expect(compile.compile(cql)).to.be.an("object").that.deep.equal({
            set: {
                DOWNLOAD_ENGINE: "puppeteer",
                DOWNLOAD_TIMEOUT: -1
            },
            select_script: {
                title: "text($('h3'))",
                content: "text($('.forum-content'))"
            },
            from: {
                subselect: "",
                urls: [
                    "https://www.esjzone.cc/forum/1546618252/57514.html"
                ]
            },
            next_url: {
                urls: [
                    "https://www.esjzone.cc/forum/1546618252/57517.html"
                ]
            },
            merge: ["content"]
        });
    });

    it("compile.compile with NEXT URL with selector and MERGE", () => {
        let cql = `
        SET
            DOWNLOAD_TIMEOUT=-1,
            DOWNLOAD_ENGINE=puppeteer
        SELECT
            text($('h3')) AS title,
            text($('.forum-content')) AS content
        FROM
            https://www.esjzone.cc/forum/1546618252/57514.html
        NEXT URL
            href($('.btn-next'))
        MERGE content`;

        expect(compile.compile(cql)).to.be.an("object").that.deep.equal({
            set: {
                DOWNLOAD_ENGINE: "puppeteer",
                DOWNLOAD_TIMEOUT: -1
            },
            select_script: {
                title: "text($('h3'))",
                content: "text($('.forum-content'))"
            },
            from: {
                subselect: "",
                urls: [
                    "https://www.esjzone.cc/forum/1546618252/57514.html"
                ]
            },
            next_url: {
                selector: "href($('.btn-next'))"
            },
            merge: ["content"]
        });
    });

    it("compile.compile with LIMIT", () => {
        let cql = `
            SELECT text($('h1')) AS title
            FROM
                https://news.163.com/20/0217/13/F5JDV8GD000189FH.html,
                https://news.163.com/20/0217/13/F5JDV8GD000189FH.html
            LIMIT 3`;

        expect(compile.compile(cql)).to.be.an("object").and.that.deep.equal({
            select_script: {
                title: "text($('h1'))"
            },
            from: {
                subselect: "",
                urls: [
                    "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html",
                    "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html"
                ]
            },
            limit: 3
        });
    });

    it("compile.compile with comment", () => {
        let cql = `
            # some comment
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
            }
        });
    });

    it("compile.compile with same AS", () => {
        let cql = `
            # some comment
            select 
                text(css('#title')) AS title,
                html(css('#content')) as title
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
                title: "html(css('#content'))"
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
            }
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
            }
        });
    });


    
    it("compile.getSplitList with many keywords should return correct", () => {
        let string = `
            select 
                text($("h1")) AS title, 
                regex(/\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/, text($(".post_time_source"))) AS pubdate,
                text($("#ne_article_source")) AS origin
            from (
                select href($$("#js_top_news h2 a")) from https://news.163.com
            )`.trim().replace(/\s+/g, " ");
        
        expect(compile.getSplitList(string, ["SELECT", "FROM", "SET", "LIMIT", "NEXT URL", "MERGE"])).to.be.an("object")
            .that.deep.equal({
                SELECT: `text($("h1")) AS title, regex(/\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/, text($(".post_time_source"))) AS pubdate, text($("#ne_article_source")) AS origin`,
                FROM: `( select href($$("#js_top_news h2 a")) from https://news.163.com )`
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