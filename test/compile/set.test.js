const expect = require("chai").expect;
const set = require("../../crawler/cql/compile/set");


describe("compile/set", () => {
    it("set.getSet should return {ENCODING: 'gbk'}", () => {
        let _set = "ENCODING=gbk";
        expect(set.getSet(_set)).to.be.an("object").and.that.deep.equal({
            "ENCODING": "gbk"
        });
    });
    it("set.getSet should ignore space around = and return {ENCODING: 'gbk'}", () => {
        let _set = "ENCODING =  gbk";
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
    it("set.getSet set DOWNLOAD_TIMEOUT if receive number string, should return Number(string)", () => {
        let _set = "DOWNLOAD_TIMEOUT = 123";
        expect(set.getSet(_set)).to.be.an("object").that.deep.equal({
            DOWNLOAD_TIMEOUT: 123
        });
    });
    it("set.getSet set DOWNLOAD_TIMEOUT if not receive number string, should ignore this config", () => {
        let _set = "DOWNLOAD_TIMEOUT = abc";
        expect(set.getSet(_set)).to.be.an("object").that.deep.equal({});
    });
});