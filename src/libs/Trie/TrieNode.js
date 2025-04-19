'use strict';
exports.__esModule = true;
var TrieNode = /** @class */ (function () {
    function TrieNode() {
        this.children = {};
        this.metaData = {};
        this.isEndOfWord = false;
    }
    return TrieNode;
})();
exports['default'] = TrieNode;
