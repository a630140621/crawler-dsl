const Trie = require("../../lib/Trie.class");
const expect = require("chai").expect;


describe("Trie", () => {
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
