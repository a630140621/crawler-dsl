const expect = require("chai").expect;
const removeComment = require("../../crawler/cql/compile/comment").removeComment;


describe("compile/comment", () => {
    it("remove comment", () => {
        let cql = `
            #这是一些注释，应该被清除掉
            SET ENCODING=gbk 
            SELECT 
                text(css("h1")) AS title 
            FROM 
                https://news.163.com/20/0217/13/F5JDV8GD000189FH.html, 
                https://news.163.com/20/0225/11/F67P1C0Q000189FH.html
        `;

        expect(removeComment(cql)).to.be.an("string").that.equal(`
            SET ENCODING=gbk 
            SELECT 
                text(css("h1")) AS title 
            FROM 
                https://news.163.com/20/0217/13/F5JDV8GD000189FH.html, 
                https://news.163.com/20/0225/11/F67P1C0Q000189FH.html
        `);
    });
});