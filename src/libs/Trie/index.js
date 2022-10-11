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
    * @param {TrieNode} [node]
    * @param {Boolean} [allowEmptyWords] - empty word doesn't have any char, you shouldn't pass a true value for it because we are disallowing adding an empty word
    * @returns {void}
    */
    add(word, metaData = {}, node = this.root, allowEmptyWords = false) {
        const newNode = node;
        if (word.length === 0 && !allowEmptyWords) {
            throw new Error('Cannot insert empty word into Trie');
        }
        if (word.length === 0) {
            newNode.isLeaf = true;
            newNode.metaData = metaData;
            return;
        }
        if (!newNode.children[word[0]]) {
            newNode.children[word[0]] = new TrieNode();
            return this.add(word.substring(1), metaData, newNode.children[word[0]], true);
        }
        return this.add(word.substring(1), metaData, newNode.children[word[0]], true);
    }

    /**
    * Search for a word in the Trie.
    * @param {String} word
    * @returns {Object|null} – the node for the word if it's found, or null if it's not found
    */
    search(word) {
        let newWord = word;
        let node = this.root;
        while (newWord.length > 1) {
            if (!node.children[newWord[0]]) {
                return null;
            }
            node = node.children[newWord[0]];
            newWord = newWord.substring(1);
        }
        return node.children[newWord] && node.children[newWord].isLeaf ? node.children[newWord] : null;
    }

    /**
    * Update a word data in the Trie.
    * @param {String} word
    * @param {Object} metaData
    * @returns {void}
    */
    update(word, metaData) {
        let newWord = word;
        let node = this.root;
        while (newWord.length > 1) {
            if (!node.children[newWord[0]]) {
                return null;
            }
            node = node.children[newWord[0]];
            newWord = newWord.substring(1);
        }
        node.children[newWord].metaData = metaData;
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
        return this.getChildMatching(node, prefix, limit, []);
    }

    /**
    * Find all leaf nodes that are descendants of a given child node.
    * @param {TrieNode} node
    * @param {String} prefix
    * @param {Number} limit
    * @param {Array} [words]
    * @returns {Array}
    */
    getChildMatching(node, prefix, limit, words = []) {
        const matching = words;
        if (matching.length > limit) {
            return matching;
        }
        if (node.isLeaf) {
            matching.unshift({name: prefix, metaData: node.metaData});
        }
        const children = _.keys(node.children);
        for (let i = 0; i < children.length; i++) {
            this.getChildMatching(node.children[children[i]], prefix + children[i], limit, matching);
        }
        return matching;
    }
}

export default Trie;
