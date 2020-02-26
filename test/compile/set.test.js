const expect = require("chai").expect;
const set = require("../../crawler/cql/compile/set");


describe("compile/set", () => {
    it("set.getSet should return {ENCODING: 'gbk'}", () => {
        let _set = "ENCODING=gbk";
        expect(set.getSet(_set)).to.be.an("object").and.that.deep.equal({
            "ENCODING": "gbk"
        });
    });
    it("set.getSet should return {ENCODING: 'gbk', ENGINE: 'puppeteer'}", () => {
        let _set = "ENCODING=gbk, engine=puppeteer";
        expect(set.getSet(_set)).to.be.an("object").and.that.deep.equal({
            "ENCODING": "gbk",
            "ENGINE": "puppeteer"
        });
    });
    it("set.getSet should return {}", () => {
        expect(set.getSet("")).to.be.an("object").which.is.empty;
    });
});