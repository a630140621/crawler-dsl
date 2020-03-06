const expect = require("chai").expect;
const merge = require("../../crawler/cql/compile/merge");


describe("compile::merge", () => {
    it("merge", () => {
        expect(merge()).to.deep.equal([]);
        expect(merge("")).to.deep.equal([]);
        expect(merge("title")).to.be.an("array").that.deep.equal(["title"]);
        expect(merge("title,content")).to.be.an("array").that.deep.equal(["title", "content"]);
        expect(merge("title, content")).to.be.an("array").that.deep.equal(["title", "content"]);
        expect(merge("title,content, pubdate")).to.be.an("array").that.deep.equal(["title", "content", "pubdate"]);
    });
});