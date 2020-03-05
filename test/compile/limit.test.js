const expect = require("chai").expect;
const limit = require("../../crawler/cql/compile/limit");


describe("compile::limit", () => {
    it("limit", () => {
        expect(limit("4")).to.be.a("number").that.equal(4);
    });
});