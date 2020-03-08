const crawl = require("../crawler/index");
const expect = require("chai").expect;
const fs = require("fs");
const path = require("path");


jest.mock("../crawler/download.js");
const download = require("../crawler/download.js");
download.mockImplementation(() => {});

// 加载 mock 文件
// next-url
let have_many_next_url_mock = fs.readFileSync(path.join(__dirname, "./mock/next-url/have-many-next-url.html"), {
    encoding: "utf8"
});
let have_next_url_mock = fs.readFileSync(path.join(__dirname, "./mock/next-url/have-next-url.html"), {
    encoding: "utf8"
});
let no_next_url_mock = fs.readFileSync(path.join(__dirname, "./mock/next-url/no-next-url.html"), {
    encoding: "utf8"
});

describe("crawl", () => {
    afterEach(() => {
        download.mockRestore(); // 清理 mock
    });

    it("crawl with NEXT URL with $$ and MERGE should continue crawl util limit", async () => {
        download
            .mockResolvedValueOnce(have_many_next_url_mock)
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock)
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock);
        
        let ret = await crawl(`select text($('h1')) as title from http://example.com NEXT URL href($$('.next-url')) MERGE title limit 3`);
        expect(download.mock.calls.length).to.equal(3);
        expect(ret).to.be.an("array").that.have.length(1);
        expect(ret[0]).to.be.deep.equal({
            url: "http://example.com",
            select: {
                title: "many next url title这是一个title这是一个 no-next-url title"
            }
        });
    });
    it("crawl with NEXT URL with $$ should continue crawl util not next-url", async () => {
        download
            .mockResolvedValueOnce(have_many_next_url_mock)
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock)
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock);
        
        let ret = await crawl(`select text($('h1')) as title from http://example.com NEXT URL href($$('.next-url'))`);
        expect(download.mock.calls.length).to.equal(6);
        expect(ret).to.be.an("array").that.have.length(6);
        expect(ret[0]).to.be.deep.equal({
            url: "http://example.com",
            select: {
                title: "many next url title"
            }
        });
        expect(ret[1]).to.be.deep.equal({
            url: "http://example.com/next-url-0",
            select: {
                title: "这是一个title"
            }
        });
        expect(ret[2]).to.be.deep.equal({
            url: "http://example.com/next-url",
            select: {
                title: "这是一个 no-next-url title"
            }
        });
        expect(ret[3]).to.be.deep.equal({
            url: "http://example.com/next-url-1",
            select: {
                title: "这是一个title"
            }
        });
        expect(ret[4]).to.be.deep.equal({
            url: "http://example.com/next-url",
            select: {
                title: "这是一个 no-next-url title"
            }
        });
        expect(ret[5]).to.be.deep.equal({
            url: "http://example.com/next-url-2",
            select: {
                title: "这是一个 no-next-url title"
            }
        });
    });
    it("crawl with NEXT URL with $$ should continue crawl util limit", async () => {
        download
            .mockResolvedValueOnce(have_many_next_url_mock)
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock)
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock);
        
        let ret = await crawl(`select text($('h1')) as title from http://example.com NEXT URL href($$('.next-url')) limit 3`);
        expect(download.mock.calls.length).to.equal(3);
        expect(ret).to.be.an("array").that.have.length(3);
        expect(ret[0]).to.be.deep.equal({
            url: "http://example.com",
            select: {
                title: "many next url title"
            }
        });
        expect(ret[1]).to.be.deep.equal({
            url: "http://example.com/next-url-0",
            select: {
                title: "这是一个title"
            }
        });
        expect(ret[2]).to.be.deep.equal({
            url: "http://example.com/next-url",
            select: {
                title: "这是一个 no-next-url title"
            }
        });
    });
    it("crawl with NEXT URL should continue crawl util not next-url", async () => {
        download
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock);
        
        let ret = await crawl(`select text($('h1')) as title from http://example.com NEXT URL href($('.next-url'))`);
        expect(download.mock.calls.length).to.equal(4);
        expect(ret).to.be.an("array").that.have.length(4);
        expect(ret[0]).to.be.deep.equal({
            url: "http://example.com",
            select: {
                title: "这是一个title"
            }
        });
        expect(ret[1]).to.be.deep.equal({
            url: "http://example.com/next-url",
            select: {
                title: "这是一个title"
            }
        });
        expect(ret[2]).to.be.deep.equal({
            url: "http://example.com/next-url",
            select: {
                title: "这是一个title"
            }
        });
        expect(ret[3]).to.be.deep.equal({
            url: "http://example.com/next-url",
            select: {
                title: "这是一个 no-next-url title"
            }
        });
    });
    it("crawl with NEXT URL should continue crawl util LIMIT", async () => {
        download
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock);
        
        let ret = await crawl(`select text($('h1')) as title from http://example.com NEXT URL href($('.next-url')) limit 2`);
        expect(download.mock.calls.length).to.equal(2);
        expect(ret).to.be.an("array").that.have.length(2);
        expect(ret[0]).to.be.deep.equal({
            url: "http://example.com",
            select: {
                title: "这是一个title"
            }
        });
        expect(ret[1]).to.be.deep.equal({
            url: "http://example.com/next-url",
            select: {
                title: "这是一个title"
            }
        });
    });
    it("crawl with NEXT URL with url should continue crawl util LIMIT", async () => {
        download
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock);
        
        let ret = await crawl(`select text($('h1')) as title from http://example.com NEXT URL http://example.com/url1, http://example.com/url2, http://example.com/url3 limit 2`);
        expect(download.mock.calls.length).to.equal(2);
        expect(ret).to.be.an("array").that.have.length(2);
        expect(ret[0]).to.be.deep.equal({
            url: "http://example.com",
            select: {
                title: "这是一个title"
            }
        });
        expect(ret[1]).to.be.deep.equal({
            url: "http://example.com/url1",
            select: {
                title: "这是一个title"
            }
        });
    });
    it("crawl with NEXT URL should continue crawl util LIMIT and fail one", async () => {
        download.mockResolvedValueOnce("");
        
        let ret = await crawl(`select text($('h1')) as title from http://example.com NEXT URL href($('.next-url')) limit 3`);
        expect(download.mock.calls.length).to.equal(1);
        expect(ret).to.be.an("array").that.have.length(1);
        expect(ret[0]).to.be.deep.equal({
            url: "http://example.com",
            select: {}
        });
    });

    it("crawl with subselect should use same engine on subselect", async () => {
        download
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/news.163.com.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6Q9DP77000189FH.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6PNBC6R0001899O.html"), {
                encoding: "utf8"
            }));
        let ret = await crawl(`
                set download_engine=fetch
                select 
                    text($("h1")) AS title, 
                    regex(/\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/, text($(".post_time_source"))) AS pubdate,
                    text($("#ne_article_source")) AS origin
                from (
                    select href($$("#js_top_news h2 a")) from https://news.163.com
                )
                limit 2
            `);

        expect(ret).to.be.an("array").which.have.length(2);
        expect(download.mock.calls.length).equal(3);
        expect(download.mock.calls[0][1]).to.deep.equal({
            timeout: undefined,
            engine: "fetch"
        });
        expect(download.mock.calls[1][1]).to.deep.equal({
            timeout: undefined,
            engine: "fetch"
        });
        expect(download.mock.calls[2][1]).to.deep.equal({
            timeout: undefined,
            engine: "fetch"
        });
        expect(ret[0]).to.be.deep.equal({
            url: "https://news.163.com/20/0303/15/F6Q9DP77000189FH.html",
            select: {
                title: "习近平为何此时考察战疫科研攻关",
                pubdate: "2020-03-03 15:33:50",
                origin: "新华网"
            }
        });
        expect(ret[1]).to.be.deep.equal({
            url: "https://news.163.com/20/0303/10/F6PNBC6R0001899O.html",
            select: {
                title: "胡锡进:若这一步走不好 中国付出的巨大代价都白费",
                pubdate: "2020-03-03 10:17:57",
                origin: "环球网"
            }
        });
    });

    it("crawl with subselect can only have one select param", async () => {
        download
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/news.163.com.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6Q9DP77000189FH.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6PNBC6R0001899O.html"), {
                encoding: "utf8"
            }));
        try {
            await crawl(`
                select 
                    text($("h1")) AS title, 
                    regex(/\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/, text($(".post_time_source"))) AS pubdate,
                    text($("#ne_article_source")) AS origin
                from (
                    select href($$("#js_top_news h2 a")) AS urls, href($$("#js_top_news h2 a")) from https://news.163.com
                )
            `);
        } catch (error) {
            expect(error).to.be.instanceof(Error);
        }
    });

    it("crawl title from one url", async () => {
        download.mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F5JDV8GD000189FH.html"), {
            encoding: "utf8"
        }));
        let ret = await crawl(`SELECT text($("h1")) AS title FROM https://news.163.com/20/0217/13/F5JDV8GD000189FH.html`);
        expect(ret).to.be.an("array").that.have.length(1);
        expect(ret[0]).to.deep.equal({
            url: "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html",
            select: {
                title: "微视频 | 愿得此身长报国"
            }
        });
    });
    it("crawl title from two urls", async () => {
        download
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F5JDV8GD000189FH.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F67P1C0Q000189FH.html"), {
                encoding: "utf8"
            }));
        let ret = await crawl(`SELECT text($("h1")) AS title FROM https://news.163.com/20/0217/13/F5JDV8GD000189FH.html, https://news.163.com/20/0225/11/F67P1C0Q000189FH.html`);
        expect(ret).to.be.an("array").that.have.length(2);
        expect(ret[0]).to.deep.equal({
            url: "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html",
            select: {
                title: "微视频 | 愿得此身长报国"
            }
        });
        expect(ret[1]).to.deep.equal({
            "url": "https://news.163.com/20/0225/11/F67P1C0Q000189FH.html",
            "select": {
                "title": "世卫组织强调新冠肺炎疫情仍未构成“大流行病”"
            }
        });
    });
    it("cql url href", async () => {
        download.mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/news.163.com.html"), {
            encoding: "utf8"
        }));
        let ret = await crawl(`SELECT href($$("#js_top_news h2 a")) AS url FROM https://news.163.com`);
        expect(ret).to.be.an("array").that.have.length(1);
        expect(ret[0]).to.be.an("object").that.deep.equal({
            url: "https://news.163.com",
            select: [
                {
                    url: "https://news.163.com/20/0303/15/F6Q9DP77000189FH.html"
                },
                {
                    url: "https://news.163.com/20/0303/10/F6PNBC6R0001899O.html"
                }
            ]
        });
    });

    it("crawl use subselect and do not use puppeteer", async () => {
        download
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/news.163.com.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6Q9DP77000189FH.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6PNBC6R0001899O.html"), {
                encoding: "utf8"
            }));
        let ret = await crawl(`
                select 
                    text($("h1")) AS title, 
                    regex(/\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/, text($(".post_time_source"))) AS pubdate,
                    text($("#ne_article_source")) AS origin
                from (
                    select href($$("#js_top_news h2 a")) from https://news.163.com
                )
            `);

        expect(ret).to.be.an("array").which.have.length(2);
        expect(ret[0]).to.be.deep.equal({
            url: "https://news.163.com/20/0303/15/F6Q9DP77000189FH.html",
            select: {
                title: "习近平为何此时考察战疫科研攻关",
                pubdate: "2020-03-03 15:33:50",
                origin: "新华网"
            }
        });
        expect(ret[1]).to.be.deep.equal({
            url: "https://news.163.com/20/0303/10/F6PNBC6R0001899O.html",
            select: {
                title: "胡锡进:若这一步走不好 中国付出的巨大代价都白费",
                pubdate: "2020-03-03 10:17:57",
                origin: "环球网"
            }
        });
    });

    it("crawl use subselect and use puppeteer engine", async () => {
        download
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/news.163.com.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6Q9DP77000189FH.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6PNBC6R0001899O.html"), {
                encoding: "utf8"
            }));
        let ret = await crawl(`
                set download_engine=puppeteer
                select 
                    text($("h1")) AS title, 
                    regex(/\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/, text($(".post_time_source"))) AS pubdate,
                    text($("#ne_article_source")) AS origin
                from (
                    select href($$("#js_top_news h2 a")) from https://news.163.com
                )
            `);

        expect(ret).to.be.an("array").which.have.length(2);
        expect(ret[0]).to.be.deep.equal({
            url: "https://news.163.com/20/0303/15/F6Q9DP77000189FH.html",
            select: {
                title: "习近平为何此时考察战疫科研攻关",
                pubdate: "2020-03-03 15:33:50",
                origin: "新华网"
            }
        });
        expect(ret[1]).to.be.deep.equal({
            url: "https://news.163.com/20/0303/10/F6PNBC6R0001899O.html",
            select: {
                title: "胡锡进:若这一步走不好 中国付出的巨大代价都白费",
                pubdate: "2020-03-03 10:17:57",
                origin: "环球网"
            }
        });
    });

    it("crawl use subselect and use puppeteer engine with limit", async () => {
        download
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/news.163.com.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6Q9DP77000189FH.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6PNBC6R0001899O.html"), {
                encoding: "utf8"
            }));
        let ret = await crawl(`
                set download_engine=puppeteer
                select 
                    text($("h1")) AS title, 
                    regex(/\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/, text($(".post_time_source"))) AS pubdate,
                    text($("#ne_article_source")) AS origin
                from (
                    select href($$("#js_top_news h2 a")) from https://news.163.com
                )
                limit 1
            `);

        expect(ret).to.be.an("array").which.have.length(1);
        expect(ret[0]).to.be.deep.equal({
            url: "https://news.163.com/20/0303/15/F6Q9DP77000189FH.html",
            select: {
                title: "习近平为何此时考察战疫科研攻关",
                pubdate: "2020-03-03 15:33:50",
                origin: "新华网"
            }
        });
        expect(download.mock.calls.length).to.equal(2); // download 函数应该仅被调用2次
    });

    it("crawl use subselect and use puppeteer engine with limit 0", async () => {
        download
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/news.163.com.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6Q9DP77000189FH.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6PNBC6R0001899O.html"), {
                encoding: "utf8"
            }));
        let ret = await crawl(`
                set download_engine=puppeteer
                select 
                    text($("h1")) AS title, 
                    regex(/\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/, text($(".post_time_source"))) AS pubdate,
                    text($("#ne_article_source")) AS origin
                from (
                    select href($$("#js_top_news h2 a")) from https://news.163.com
                    limit 0
                )
                limit 1
            `);

        expect(ret).to.be.an("array").which.have.length(0);
        expect(download.mock.calls.length).to.equal(0);
    });

    it("crawl use subselect and use puppeteer engine with reject", async () => {
        download
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/news.163.com.html"), {
                encoding: "utf8"
            }))
            .mockRejectedValueOnce("some error general TimeoutError")
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6PNBC6R0001899O.html"), {
                encoding: "utf8"
            }));
        let ret = await crawl(`
                set download_engine=puppeteer
                select 
                    text($("h1")) AS title, 
                    regex(/\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/, text($(".post_time_source"))) AS pubdate,
                    text($("#ne_article_source")) AS origin
                from (
                    select href($$("#js_top_news h2 a")) from https://news.163.com
                )
            `);

        expect(ret).to.be.an("array").which.have.length(2);
        expect(ret[0]).to.be.deep.equal({
            url: "https://news.163.com/20/0303/15/F6Q9DP77000189FH.html",
            select: {}
        });
        expect(ret[1]).to.be.deep.equal({
            url: "https://news.163.com/20/0303/10/F6PNBC6R0001899O.html",
            select: {
                title: "胡锡进:若这一步走不好 中国付出的巨大代价都白费",
                pubdate: "2020-03-03 10:17:57",
                origin: "环球网"
            }
        });
    });

    it("crawl use subselect and from subselect use $()", async () => {
        download
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/news.163.com.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6Q9DP77000189FH.html"), {
                encoding: "utf8"
            }))
            .mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F6PNBC6R0001899O.html"), {
                encoding: "utf8"
            }));
        let ret = await crawl(`
                select 
                    text($("h1")) AS title, 
                    regex(/\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/, text($(".post_time_source"))) AS pubdate,
                    text($("#ne_article_source")) AS origin
                from (
                    select href($("#js_top_news h2 a")) from https://news.163.com
                )
            `);

        expect(ret).to.be.an("array").which.have.length(1);
        expect(ret[0]).to.be.deep.equal({
            url: "https://news.163.com/20/0303/15/F6Q9DP77000189FH.html",
            select: {
                title: "习近平为何此时考察战疫科研攻关",
                pubdate: "2020-03-03 15:33:50",
                origin: "新华网"
            }
        });
    });
});