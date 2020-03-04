process.env.NODE_ENV = "unittest";
const expect = require("chai").expect;
const select = require("../../crawler/cql/compile/select");


describe("compile/select", () => {
    it("select.getSelect should return object with one key", () => {
        let _select = `text(css("#epContentLeft")) AS title`;
        expect(select.getSelect(_select)).to.be.an("object")
            .that.have.all.keys(["title"])
            .has.own.property("title", `text(css("#epContentLeft"))`);
    });
    it("select.getSelect should return object with three keys", () => {
        let _select = `text(css("#epContentLeft")) AS title, html(css("#endText")) AS content, regex(text(css(".post_time_source")), "yyyy-MM-dd hh:mm:ss") AS pubdate`;
        expect(select.getSelect(_select)).to.be.an("object")
            .that.have.all.keys("title", "content", "pubdate")
            .and.deep.equal({
                "title": `text(css("#epContentLeft"))`,
                "content": `html(css("#endText"))`,
                "pubdate": `regex(text(css(".post_time_source")), "yyyy-MM-dd hh:mm:ss")`
            });
    });
    it("select.getSelect should return object with three keys instead of four", () => {
        let _select = `text(css("#asContentLeft") ) AS title, html(css("h1 #endText")) AS content, regex( text(css(".post_time_source")),   "yyyy-MM-dd hh:mm:ss") AS pubdate`;
        expect(select.getSelect(_select)).to.be.an("object")
            .that.deep.equal({
                title: `text(css("#asContentLeft") )`,
                content: `html(css("h1 #endText"))`,
                pubdate: `regex( text(css(".post_time_source")),   "yyyy-MM-dd hh:mm:ss")`
            });
    });
    it("select.getSelect should not distinguish lowerCase", () => {
        let _select = `text(css('#asContentLeft')) as title, html() AS content, a as b, c AS d, f as e`;
        expect(select.getSelect(_select)).to.be.an("object")
            .that.deep.equal({
                title: "text(css('#asContentLeft'))",
                content: "html()",
                b: "a",
                d: "c",
                e: "f"
            });
    });
    it("select.getSelect with one param but without AS", () => {
        let _select = `text($('h3'))`;
        expect(select.getSelect(_select)).to.be.an("object")
            .that.deep.equal({
                "text($('h3'))": "text($('h3'))"
            });
    });
    it("select.getSelect with two params but without AS", () => {
        let _select = `text($('h3')), html($$('#content'))`;
        expect(select.getSelect(_select)).to.be.an("object")
            .that.deep.equal({
                "text($('h3'))": "text($('h3'))",
                "html($$('#content'))": "html($$('#content'))"
            });
    });
    it("select.getSelect one have AS one not AS", () => {
        let _select = `text($('h3')) as title,  html($$('#content'))`;
        expect(select.getSelect(_select)).to.be.an("object")
            .that.deep.equal({
                "title": "text($('h3'))",
                "html($$('#content'))": "html($$('#content'))"
            });
    });
    it("select.getSelect one have AS one not AS and have , on regex()", () => {
        let _select = `text($('h3')) as title, regex('demo',  $$('#content'))`;
        expect(select.getSelect(_select)).to.be.an("object")
            .that.deep.equal({
                "title": "text($('h3'))",
                "regex('demo',  $$('#content'))": "regex('demo',  $$('#content'))"
            });
    });
    // it("select.getSelect with sub SELECT", () => {
    //     let _select = `text($('h3')) as title, regex('demo',  $$('#content'))`;
    //     expect(select.getSelect(_select)).to.be.an("object")
    //         .that.deep.equal({
    //             "title": "text($('h3'))",
    //             "regex('demo',  $$('#content'))": "regex('demo',  $$('#content'))"
    //         });
    // });
});