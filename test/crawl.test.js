const crawl = require("../crawler/index");
const expect = require("chai").expect;
const fs = require("fs");
const path = require("path");


jest.mock("../crawler/download.js");
const download = require("../crawler/download.js");
describe("crawl", () => {
    it("crawl title from one url", async () => {
        download.mockResolvedValueOnce(fs.readFileSync(path.join(__dirname, "./mock/F5JDV8GD000189FH.html"), {
            encoding: "utf8"
        }));
        let ret = await crawl(`SET ENCODING=gbk SELECT text($("h1")) AS title FROM https://news.163.com/20/0217/13/F5JDV8GD000189FH.html`);
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
        let ret = await crawl(`SET ENCODING=gbk SELECT text($("h1")) AS title FROM https://news.163.com/20/0217/13/F5JDV8GD000189FH.html, https://news.163.com/20/0225/11/F67P1C0Q000189FH.html`);
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
});