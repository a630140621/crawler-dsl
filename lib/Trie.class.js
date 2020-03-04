class Trie {
    constructor(init=[]) {
        /**
         * insert 'bed' to trie
         * lookup: {
         *      'b': {
         *          'e': {
         *              'd': {
         *                  'end': true
         *              }
         *          }
         *      }
         * }
         */
        this._lookup = {};
        for (let word of init) {
            this.add(word);
        }
    }

    /**
     * 向 trie 树中插入一个 string
     * @param {string} word 
     */
    add(word) {
        let node = this._lookup;
        for (let ch of word) {
            if (!node[ch]) node[ch] = {};
            node = node[ch];
        }
        node["end"] = true;
    }

    /**
     * 是否包含这个词
     * @param {string} word 
     */
    has(word) {
        let node = this._lookup;
        for (let ch of word) {
            if (!node[ch]) return false;
            node = node[ch];
        }
        if ("end" in node) return true;
        return false;
    }

    /**
     * 是否有以这个前缀开头的词
     * @param {string} prefix 前缀
     */
    startsWith(prefix) {
        let node = this._lookup;
        for (let ch of prefix) {
            if (!node[ch]) return false;
            node = node[ch];
        }
        return true;
    }

    /**
     * 返回所有插入的以该前缀开始的字符串，不存在则返回 []
     * @return ["word1", "word2"]
     */
    getStartsWith(prefix = "") {
        let node = this._lookup;
        for (let ch of prefix) {
            if (!node[ch]) return [];
            node = node[ch];
        }

        // 找到所有的目标字符串
        return this._getAllWords(node, prefix);
    }

    /**
     * 返回该节点下的所有单词 end === true
     * 
     * @param {Object} node this.lookup 的一个节点
     * 
     * @return []
     */
    _getAllWords(node, prefix = "") {
        let ret = [];
        for (let [key, value] of Object.entries(node)) {
            if (key === "end") {
                ret.push(prefix);
                continue;
            }
            ret = ret.concat(this._getAllWords(value, prefix + key));
        }

        return ret;
    }
}


module.exports = Trie;