const crawl = require("../crawler/index");
const expect = require("chai").expect;
const fs = require("fs");
const path = require("path");
const lifeCycle = require("../crawler/lifecycle");


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


describe("lifeCycle", () => {
    beforeAll(() => {
        lifeCycle.beforeEachCrawl = jest.fn().mockResolvedValue(true);
        lifeCycle.afterEachCrawl = jest.fn();
        lifeCycle.beforeEachDownload = jest.fn();
        lifeCycle.afterEachDownload = jest.fn();
    });
    afterEach(() => {
        // 清理 mock
        download.mockRestore();
        lifeCycle.beforeEachCrawl.mockRestore();
        lifeCycle.afterEachCrawl.mockRestore();
        lifeCycle.beforeEachDownload.mockRestore();
        lifeCycle.afterEachDownload.mockRestore();
    });


    it("if lifeCycle.beforeEachCrawl return false should not crawl", async () => {
        lifeCycle.beforeEachCrawl.mockResolvedValueOnce(false);
        download.mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F5JDV8GD000189FH.html"), {
            encoding: "utf8"
        }));
        let ret = await crawl(`SELECT text($("h1")) AS title FROM https://news.163.com/20/0217/13/F5JDV8GD000189FH.html`);
        expect(ret).to.be.an("array").that.have.length(0);
        expect(lifeCycle.beforeEachCrawl.mock.calls.length).to.equal(1);
        expect(lifeCycle.beforeEachCrawl.mock.calls[0][0]).to.equal("https://news.163.com/20/0217/13/F5JDV8GD000189FH.html");
        expect(lifeCycle.afterEachCrawl.mock.calls.length).to.equal(0);
        expect(download.mock.calls.length).to.equal(0);
    });

    it("crawl with NEXT URL should continue crawl util limit lifecycle should called", async () => {
        download
            .mockResolvedValueOnce(have_many_next_url_mock)
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock)
            .mockResolvedValueOnce(have_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock)
            .mockResolvedValueOnce(no_next_url_mock);

        let ret = await crawl(`select text($('h1')) as title from http://example.com NEXT URL href($$('.next-url')) limit 3`);
        expect(download.mock.calls.length).to.equal(3);
        expect(download.mock.calls[0][0]).to.equal("http://example.com");
        expect(download.mock.calls[1][0]).to.equal("http://example.com/next-url-0");
        expect(download.mock.calls[2][0]).to.equal("http://example.com/next-url");

        expect(lifeCycle.beforeEachCrawl.mock.calls.length).to.equal(3);
        expect(lifeCycle.beforeEachCrawl.mock.calls[0][0]).to.equal("http://example.com");
        expect(lifeCycle.beforeEachCrawl.mock.calls[1][0]).to.equal("http://example.com/next-url-0");
        expect(lifeCycle.beforeEachCrawl.mock.calls[2][0]).to.equal("http://example.com/next-url");
        
        expect(lifeCycle.afterEachCrawl.mock.calls.length).to.equal(3);
        expect(lifeCycle.afterEachCrawl.mock.calls[0][0]).to.equal("http://example.com");
        expect(lifeCycle.afterEachCrawl.mock.calls[0][1]).to.equal("success");
        expect(lifeCycle.afterEachCrawl.mock.calls[0][2]).to.deep.equal({
            title: "many next url title"
        });
        expect(lifeCycle.afterEachCrawl.mock.calls[1][0]).to.equal("http://example.com/next-url-0");
        expect(lifeCycle.afterEachCrawl.mock.calls[1][1]).to.equal("success");
        expect(lifeCycle.afterEachCrawl.mock.calls[1][2]).to.deep.equal({
            title: "这是一个title"
        });
        expect(lifeCycle.afterEachCrawl.mock.calls[2][0]).to.equal("http://example.com/next-url");
        expect(lifeCycle.afterEachCrawl.mock.calls[2][1]).to.equal("success");
        expect(lifeCycle.afterEachCrawl.mock.calls[2][2]).to.deep.equal({
            title: "这是一个 no-next-url title"
        });
    });
    
});