"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TrieNode_1 = require("./TrieNode");
var Trie = /** @class */ (function () {
    function Trie() {
        this.root = new TrieNode_1.default();
    }
    /**
     * Add a word to the Trie
     * @param [metaData] - attach additional data to the word
     * @param [allowEmptyWords] - empty word doesn't have any char, you shouldn't pass a true value for it because we are disallowing adding an empty word
     */
    Trie.prototype.add = function (word, metaData, node, allowEmptyWords) {
        if (metaData === void 0) { metaData = {}; }
        if (node === void 0) { node = this.root; }
        if (allowEmptyWords === void 0) { allowEmptyWords = false; }
        var newWord = word.toLowerCase();
        var newNode = node;
        if (newWord.length === 0 && !allowEmptyWords) {
            throw new Error('Cannot insert empty word into Trie');
        }
        if (newWord.length === 0) {
            newNode.isEndOfWord = true;
            newNode.metaData = metaData;
            return;
        }
        if (!newNode.children[newWord[0]]) {
            newNode.children[newWord[0]] = new TrieNode_1.default();
        }
        this.add(newWord.substring(1), metaData, newNode.children[newWord[0]], true);
    };
    /**
     * Search for a word in the Trie.
     * @returns - the node for the word if it's found, or null if it's not found
     */
    Trie.prototype.search = function (word) {
        var _a;
        var newWord = word.toLowerCase();
        var node = this.root;
        while (newWord.length > 1) {
            if (!node.children[newWord[0]]) {
                return null;
            }
            node = node.children[newWord[0]];
            newWord = newWord.substring(1);
        }
        return ((_a = node.children[newWord]) === null || _a === void 0 ? void 0 : _a.isEndOfWord) ? node.children[newWord] : null;
    };
    /**
     * Update a word data in the Trie.
     */
    Trie.prototype.update = function (word, metaData) {
        var newWord = word.toLowerCase();
        var node = this.root;
        while (newWord.length > 1) {
            if (!node.children[newWord[0]]) {
                throw new Error('Word does not exist in the Trie');
            }
            node = node.children[newWord[0]];
            newWord = newWord.substring(1);
        }
        node.children[newWord].metaData = metaData;
    };
    /**
     * Find all leaf nodes starting with a substring.
     * @param [limit] - matching words limit
     */
    Trie.prototype.getAllMatchingWords = function (substr, limit) {
        if (limit === void 0) { limit = 5; }
        var newSubstr = substr.toLowerCase();
        var node = this.root;
        var prefix = '';
        for (var _i = 0, newSubstr_1 = newSubstr; _i < newSubstr_1.length; _i++) {
            var char = newSubstr_1[_i];
            prefix += char;
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }
        return this.getChildMatching(node, prefix, limit, []);
    };
    /**
     * Find all leaf nodes that are descendants of a given child node.
     */
    Trie.prototype.getChildMatching = function (node, prefix, limit, words) {
        if (words === void 0) { words = []; }
        var matching = words;
        if (matching.length >= limit) {
            return matching;
        }
        if (node.isEndOfWord) {
            matching.push({ name: prefix, metaData: node.metaData });
        }
        var children = Object.keys(node.children);
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var child = children_1[_i];
            this.getChildMatching(node.children[child], prefix + child, limit, matching);
        }
        return matching;
    };
    return Trie;
}());
exports.default = Trie;
