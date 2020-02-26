const expect = require("chai").expect;
const from = require("../../crawler/cql/compile/from");


describe("compile/from", () => {
    it("from.getUrlList should return list with length 1", () => {
        let _from = "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html";
        expect(from.getUrlList(_from)).to.be.an("array")
            .with.length(1)
            .and.include("https://news.163.com/20/0217/13/F5JDV8GD000189FH.html");
    });
    it("from.getUrlList should return list with length 2", () => {
        let _from = "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html, https://news.163.com/20/0225/11/F67P1C0Q000189FH.html";
        expect(from.getUrlList(_from)).to.be.an("array")
            .with.length(2)
            .and.include("https://news.163.com/20/0217/13/F5JDV8GD000189FH.html")
            .and.include("https://news.163.com/20/0225/11/F67P1C0Q000189FH.html");
    });
    it("from.getUrlList should return list with length 2", () => {
        let _from = "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html,https://news.163.com/20/0225/11/F67P1C0Q000189FH.html";
        expect(from.getUrlList(_from)).to.be.an("array")
            .with.length(2)
            .and.include("https://news.163.com/20/0217/13/F5JDV8GD000189FH.html")
            .and.include("https://news.163.com/20/0225/11/F67P1C0Q000189FH.html");
    });
    it("from.getUrlList should return list with length 3", () => {
        let _from = "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html,   https://news.163.com/20/0225/11/F67P1C0Q000189FH.html,xxx";
        expect(from.getUrlList(_from)).to.be.an("array")
            .with.length(3)
            .and.include("https://news.163.com/20/0217/13/F5JDV8GD000189FH.html")
            .and.include("https://news.163.com/20/0225/11/F67P1C0Q000189FH.html")
            .and.include("xxx");
    });
});