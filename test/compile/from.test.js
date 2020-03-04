const expect = require("chai").expect;
const from = require("../../crawler/cql/compile/from");


describe("compile/from", () => {
    it("from.handleFrom should return list with length 1", () => {
        let _from = "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html";
        expect(from.handleFrom(_from)["subselect"]).to.be.an("string").that.empty;
        expect(from.handleFrom(_from)["urls"]).to.be.an("array")
            .with.length(1)
            .and.include("https://news.163.com/20/0217/13/F5JDV8GD000189FH.html");
    });
    it("from.handleFrom should return list with length 2", () => {
        let _from = "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html, https://news.163.com/20/0225/11/F67P1C0Q000189FH.html";
        expect(from.handleFrom(_from)["subselect"]).to.be.an("string").that.empty;
        expect(from.handleFrom(_from)["urls"]).to.be.an("array")
            .with.length(2)
            .and.include("https://news.163.com/20/0217/13/F5JDV8GD000189FH.html")
            .and.include("https://news.163.com/20/0225/11/F67P1C0Q000189FH.html");
    });
    it("from.handleFrom should return list with length 2", () => {
        let _from = "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html,https://news.163.com/20/0225/11/F67P1C0Q000189FH.html";
        expect(from.handleFrom(_from)["subselect"]).to.be.an("string").that.empty;
        expect(from.handleFrom(_from)["urls"]).to.be.an("array")
            .with.length(2)
            .and.include("https://news.163.com/20/0217/13/F5JDV8GD000189FH.html")
            .and.include("https://news.163.com/20/0225/11/F67P1C0Q000189FH.html");
    });
    it("from.handleFrom should return list with length 3", () => {
        let _from = "https://news.163.com/20/0217/13/F5JDV8GD000189FH.html,   https://news.163.com/20/0225/11/F67P1C0Q000189FH.html,xxx";
        expect(from.handleFrom(_from)["subselect"]).to.be.an("string").that.empty;
        expect(from.handleFrom(_from)["urls"]).to.be.an("array")
            .with.length(3)
            .and.include("https://news.163.com/20/0217/13/F5JDV8GD000189FH.html")
            .and.include("https://news.163.com/20/0225/11/F67P1C0Q000189FH.html")
            .and.include("xxx");
    });

    it("from.handleFrom with subselect should return subselect", () => {
        let _from = "( SELECT $('h1') AS title FROM http://www.demo.org )";
        expect(from.handleFrom(_from)).to.be.an("object").that.deep.equal({
            subselect: "SELECT $('h1') AS title FROM http://www.demo.org",
            urls: []
        });
    });
});