// 去除 cql 中的注释部分
exports.removeComment = function (cql) {
    let ret = [];
    for (let line of cql.split("\n")) {
        let trimleft_line = line.trimLeft();
        if (trimleft_line && trimleft_line.startsWith("#")) continue;
        ret.push(line);
    }

    return ret.join("\n");
};