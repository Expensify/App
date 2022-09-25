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
            node.setCompleteWord();
            node.setMetaData(metaData);
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
        return node.children[word] && node.children[word].isCompleteWord() ? node.children[word] : null;
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
        node.children[word].setMetaData(metaData);
    }

    /**
    * Find all leaf nodes starting with a substring.
    * @param {String} substr
    * @returns {Array}
    */
    getAllMatchingWords(substr) {
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
        return this.getChildMatching(node, prefix);
    }

    /**
    * Find all leaf nodes that are descendants of a given child node.
    * @param {TrieNode} node
    * @param {String} prefix
    * @param {Array} [words]
    * @returns {Array}
    */
    getChildMatching = (node, prefix, words = []) => {
        const matching = words;
        if (matching.length > 4) {
            return matching;
        }
        if (node.isCompleteWord()) {
            if (node.getCode() && !_.find(matching, obj => obj.code === node.getCode() && obj.name === prefix)) {
                matching.unshift({code: node.getCode(), name: prefix});
            }
            const suggestions = node.getMetaData().suggestions;
            for (let i = 0; i < suggestions.length; i++) {
                if (matching.length > 4) {
                    return matching;
                }
                if (!_.find(matching, obj => obj.code === node.getCode() && obj.name === prefix)) {
                    matching.unshift(suggestions[i]);
                }
            }
        }
        _.keys(node.children).forEach(nodeChar => this.getChildMatching(node.children[nodeChar], prefix + nodeChar, matching));
        return matching;
    }
}

export default Trie;
