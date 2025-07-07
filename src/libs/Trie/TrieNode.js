"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TrieNode = /** @class */ (function () {
    function TrieNode() {
        this.children = {};
        this.metaData = {};
        this.isEndOfWord = false;
    }
    return TrieNode;
}());
exports.default = TrieNode;
