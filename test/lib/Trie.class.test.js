const Trie = require("../../lib/Trie.class");
const expect = require("chai").expect;


describe("Trie", () => {
    it("trie with default arguement", () => {
        let trie = new Trie(["app"]);

        expect(trie.getStartsWith("a")).to.be.an("array").with.length(1).and.contain("app");
        expect(trie.getStartsWith("b")).to.be.an("array").with.length(0);
        expect(trie.getStartsWith("appp")).to.be.an("array").with.length(0);
        
        trie.add("app");
        expect(trie.getStartsWith("a")).to.be.an("array").with.length(1).and.contain("app");
    });

    it("add same string", () => {
        let trie = new Trie();
        expect(trie.getStartsWith("a")).to.be.an("array").with.length(0);
    });

    it("empty trie and use getStartsWith", () => {
        let trie = new Trie();
        expect(trie.getStartsWith("")).to.be.an("array").with.length(0);
    });

    it("trie.getStartsWith", () => {
        let trie = new Trie();
        trie.add("apple");
        
        expect(trie.getStartsWith("")).to.be.an("array").with.length(1).contain("apple");
        expect(trie.getStartsWith("a")).to.be.an("array").with.length(1).contain("apple");
        expect(trie.getStartsWith("ap")).to.be.an("array").with.length(1).contain("apple");
        expect(trie.getStartsWith("appp")).to.be.an("array").with.length(0);
        trie.add("app");
        expect(trie.getStartsWith()).to.be.an("array").with.length(2).contain("apple").and.contain("app");
        expect(trie.getStartsWith("")).to.be.an("array").with.length(2).contain("apple").and.contain("app");
        expect(trie.getStartsWith("app")).to.be.an("array").with.length(2).contain("app").and.contain("apple");
        expect(trie.getStartsWith("appp")).to.be.an("array").with.length(0);
        expect(trie.getStartsWith("appl")).to.be.an("array").with.length(1).contain("apple");
    });

    it("trie.has", () => {
        let trie = new Trie();
        expect(trie.has("")).to.be.false;
        expect(trie.has("a")).to.be.false;
        trie.add("apple");
        expect(trie.has("app")).to.be.false;
        expect(trie.has("apple")).to.be.true;
        trie.add("app");
        expect(trie.has("app")).to.be.true;
        expect(trie.has("apple")).to.be.true;
    });

    it("trie.getStartsWith should return two value", () => {
        let trie = new Trie();
        trie.add("s");
        trie.add("sll");
        trie.add("");
        expect(trie.getStartsWith("s")).to.be.an("array").that.has.length(2).which.include("s").and.include("sll");
    });

    it("trie.getStartsWith should return ['']", () => {
        let trie = new Trie();
        trie.add("");
        expect(trie.getStartsWith("")).to.be.an("array").that.has.length(1).which.include("");
    });

    it("trie.startsWith", () => {
        let trie = new Trie();
        trie.add("app");
        expect(trie.startsWith("app")).to.be.true;
        expect(trie.startsWith("apple")).to.be.false;
        trie.add("apple");
        expect(trie.startsWith("app")).to.be.true;
        expect(trie.startsWith("apple")).to.be.true;
    });
    it("trie.getStartsWith", () => {
        let trie = new Trie();
        trie.add("apple");
        
        expect(trie.getStartsWith("")).to.be.an("array").with.length(1).contain("apple");
        expect(trie.getStartsWith("a")).to.be.an("array").with.length(1).contain("apple");
        expect(trie.getStartsWith("ap")).to.be.an("array").with.length(1).contain("apple");
        trie.add("app");
        expect(trie.getStartsWith("")).to.be.an("array").with.length(2).contain("apple").and.contain("app");
        expect(trie.getStartsWith("app")).to.be.an("array").with.length(2).contain("app").and.contain("apple");
        expect(trie.getStartsWith("appl")).to.be.an("array").with.length(1).contain("apple");
    });
    it("trie.has", () => {
        let trie = new Trie();
        trie.add("");
        expect(trie.has("")).to.be.true;
        trie.add("apple");
        expect(trie.has("apple")).to.be.true;
        expect(trie.has("app")).to.be.false;
    });
});
