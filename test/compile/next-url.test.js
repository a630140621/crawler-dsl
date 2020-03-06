const expect = require("chai").expect;
const nextUrl = require("../../crawler/cql/compile/next-url");


describe("compile::next-url", () => {
    it("next-url", () => {
        expect(nextUrl()).to.deep.equal({});
        expect(nextUrl("")).to.deep.equal({});
        expect(nextUrl("http://www.baidu.com")).to.be.an("object").that.deep.equal({
            urls: [
                "http://www.baidu.com"
            ]
        });
        expect(nextUrl("http://www.baidu.com,https://demo")).to.be.an("object").that.deep.equal({
            urls: [
                "http://www.baidu.com",
                "https://demo"
            ]
        });
        expect(nextUrl("http://www.baidu.com, https://demo")).to.be.an("object").that.deep.equal({
            urls: [
                "http://www.baidu.com",
                "https://demo"
            ]
        });
        expect(nextUrl("href($('a'))")).to.be.an("object").that.deep.equal({
            selector: "href($('a'))"
        });
    });
});