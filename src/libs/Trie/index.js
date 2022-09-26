import _ from 'underscore';
import TrieNode from './TrieNode';

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    /**
    * Add a word to the Trie
    * @param {String} word
    * @param {Object} [metaData] - attach additional data to the word
    * @param {TrieNode} newNode
    * @param {Boolean} [allowEmptyWords] - empty word doesn't have any char, you shouldn't pass a true value for it because we are disallowing adding an empty word
    * @returns {void}
    */
    add(word, metaData, newNode = this.root, allowEmptyWords = false) {
        const node = newNode;
        if (word.length === 0 && !allowEmptyWords) {
            throw new Error('Cannot insert empty word into Trie');
        }
        if (word.length === 0) {
            node.isLeaf = true;
            node.metaData = metaData;
            return;
        }
        if (!node.children[word[0]]) {
            node.children[word[0]] = new TrieNode();
            return this.add(word.substring(1), metaData, node.children[word[0]], true);
        }
        return this.add(word.substring(1), metaData, node.children[word[0]], true);
    }

    /**
    * Check if the word is exist in the Trie.
    * @param {String} newWord
    * @returns {Object|null} – the node for the word if it's found, or null if it's not found
    */
    isWord(newWord) {
        let word = newWord;
        let node = this.root;
        while (word.length > 1) {
            if (!node.children[word[0]]) {
                return null;
            }
            node = node.children[word[0]];
            word = word.substring(1);
        }
        return node.children[word] && node.children[word].isLeaf ? node.children[word] : null;
    }

    /**
    * Update a word data in the Trie.
    * @param {String} newWord
    * @param {Object} metaData
    * @returns {void}
    */
    update(newWord, metaData) {
        let word = newWord;
        let node = this.root;
        while (word.length > 1) {
            if (!node.children[word[0]]) {
                return null;
            }
            node = node.children[word[0]];
            word = word.substring(1);
        }
        node.children[word].metaData = metaData;
    }

    /**
    * Find all leaf nodes starting with a substring.
    * @param {String} substr
    * @param {Number} [limit] - matching words limit
    * @returns {Array}
    */
    getAllMatchingWords(substr, limit = 4) {
        let node = this.root;
        let prefix = '';
        for (let i = 0; i < substr.length; i++) {
            prefix += substr[i];
            if (node.children[substr[i]]) {
                node = node.children[substr[i]];
            } else {
                return [];
            }
        }
        return this.getChildMatching(node, prefix, [], limit);
    }

    /**
    * Find all leaf nodes that are descendants of a given child node.
    * @param {TrieNode} node
    * @param {String} prefix
    * @param {Array} [words]
    * @param {Number} limit
    * @returns {Array}
    */
    getChildMatching(node, prefix, words = [], limit) {
        const matching = words;
        if (matching.length > limit) {
            return matching;
        }
        if (node.isLeaf) {
            matching.unshift({name: prefix, metaData: node.metaData});
        }
        const children = _.keys(node.children);
        for (let i = 0; i < children.length; i++) {
            this.getChildMatching(node.children[children[i]], prefix + children[i], matching, limit);
        }
        return matching;
    }
}

export default Trie;
