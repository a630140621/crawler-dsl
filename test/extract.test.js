const expect = require("chai").expect;
const extract = require("../crawler/extract");
const fs = require("fs");
const path = require("path");
const detail = fs.readFileSync(path.join(__dirname, "./mock/detail.html")).toString();
const list = fs.readFileSync(path.join(__dirname, "./mock/list.html")).toString();


describe("extract", () => {
    // it("extract list", () => {
    //     let script = {
    //         time: "text(css('.contentLeft .time-text'))",
    //         view_count: "regex('//d*', text(css('.contentLeft .bottomWrap .readingNum:last-child')))",
    //         content: "text(css('.contentLeft .overHidden'))"
    //     };
    //     let r = extract(list, script);
    //     expect({}).to.be.an("object");
    // });
    it("extract title", () => {
        let script = {
            title: "text(css(\"h1\"))"
        };
        expect(extract(detail, script)).to.be.an("array").that.deep.equal([{
            title: "微视频 | 愿得此身长报国"
        }]);
    });
    it("extract title and pubdate", () => {
        let script = {
            title: "text(css(\"h1\"))",
            t: "text(css(\"h1\"))",
            pubdate: "regex(\"\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\", text(css(\".post_time_source\")))"
        };
        expect(extract(detail, script)).to.be.an("array").that.deep.equal([{
            title: "微视频 | 愿得此身长报国",
            t: "微视频 | 愿得此身长报国",
            pubdate: "2020-02-17 13:22:54"
        }]);
    });
});