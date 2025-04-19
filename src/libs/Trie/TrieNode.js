
exports.__esModule = true;
const TrieNode = /** @class */ (function () {
    function TrieNode() {
        this.children = {};
        this.metaData = {};
        this.isEndOfWord = false;
    }
    return TrieNode;
})();
exports['default'] = TrieNode;
