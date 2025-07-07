"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Trie_1 = require("@src/libs/Trie");
describe('Trie', function () {
    it('Test if a node can be found in the Trie', function () {
        var _a, _b;
        var wordTrie = new Trie_1.default();
        wordTrie.add('grinning', { code: '😀' });
        wordTrie.add('grin', { code: '😁' });
        wordTrie.add('joy', { code: '😂' });
        wordTrie.add('rofl', { code: '🤣' });
        expect(wordTrie.search('eyes')).toBeNull();
        expect((_a = wordTrie.search('joy')) === null || _a === void 0 ? void 0 : _a.metaData).toEqual({ code: '😂' });
        expect((_b = wordTrie.search('gRiN')) === null || _b === void 0 ? void 0 : _b.metaData).toEqual({ code: '😁' });
    });
    it('Test finding all leaf nodes starting with a substring', function () {
        var wordTrie = new Trie_1.default();
        wordTrie.add('John', { code: '👨🏿', suggestions: [] });
        wordTrie.add('Robert', { code: '👨🏾', suggestions: [] });
        wordTrie.add('Robertson', { code: '👨🏽', suggestions: [] });
        wordTrie.add('Rock', { code: '👨🏼', suggestions: [] });
        var expected = [
            { name: 'robert', metaData: { code: '👨🏾', suggestions: [] } },
            { name: 'robertson', metaData: { code: '👨🏽', suggestions: [] } },
            { name: 'rock', metaData: { code: '👨🏼', suggestions: [] } },
        ];
        expect(wordTrie.getAllMatchingWords('Ro')).toEqual(expected);
        expect(wordTrie.getAllMatchingWords('ro')).toEqual(expected);
    });
    it('Test finding only the first 5 matching words', function () {
        var wordTrie = new Trie_1.default();
        wordTrie.add('John', { code: '👨🏼', suggestions: [] });
        wordTrie.add('Robert', { code: '👨🏾', suggestions: [] });
        wordTrie.add('Robertson', { code: '👨🏼', suggestions: [] });
        wordTrie.add('Rock', { code: '👨🏽', suggestions: [] });
        wordTrie.add('Rob', { code: '👨🏻', suggestions: [] });
        wordTrie.add('Rocco', { code: '👨🏿', suggestions: [] });
        wordTrie.add('Roger', { code: '👨🏼', suggestions: [] });
        wordTrie.add('Roni', { code: '👨🏻', suggestions: [] });
        expect(wordTrie.getAllMatchingWords('Ro').length).toBe(5);
    });
    it('Test finding a specific number of matching words', function () {
        var wordTrie = new Trie_1.default();
        var limit = 7;
        wordTrie.add('John', { code: '👨🏼', suggestions: [] });
        wordTrie.add('Robert', { code: '👨🏾', suggestions: [] });
        wordTrie.add('Robertson', { code: '👨🏼', suggestions: [] });
        wordTrie.add('Rock', { code: '👨🏽', suggestions: [] });
        wordTrie.add('Rob', { code: '👨🏻', suggestions: [] });
        wordTrie.add('Rocco', { code: '👨🏿', suggestions: [] });
        wordTrie.add('Roger', { code: '👨🏼', suggestions: [] });
        wordTrie.add('Roni', { code: '👨🏻', suggestions: [] });
        expect(wordTrie.getAllMatchingWords('Ro', limit).length).toBe(limit);
    });
    it('Test throwing an error when try to add an empty word to the Trie.', function () {
        var wordTrie = new Trie_1.default();
        expect(function () {
            wordTrie.add('');
        }).toThrow('Cannot insert empty word into Trie');
    });
    it('Test updating a Trie node', function () {
        var _a;
        var wordTrie = new Trie_1.default();
        wordTrie.add('John', { code: '👨🏼' });
        wordTrie.update('John', { code: '👨🏻' });
        expect((_a = wordTrie.search('John')) === null || _a === void 0 ? void 0 : _a.metaData).toEqual({ code: '👨🏻' });
    });
    it('Test throwing an error when try to update a word that does not exist in the Trie.', function () {
        var wordTrie = new Trie_1.default();
        expect(function () {
            wordTrie.update('smile', {});
        }).toThrow('Word does not exist in the Trie');
    });
});
