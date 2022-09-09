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
    * @param {Boolean} [containChar] - empty word doesn't have any char
    * @returns {void}
    */
    add(word, metaData, newNode = this.root, containChar = false) {
        const node = newNode;
        if (word.length === 0 && !containChar) {
            throw new Error('Cannot insert empty word into Trie :', word);
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
    * @returns {Object}
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
        return node.children[word];
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
        if (node.leaf) {
            matching.unshift(prefix);
        }
        _.keys(node.children).forEach(nodeChar => this.getChildMatching(node.children[nodeChar], prefix + nodeChar, matching));
        return matching;
    }
}

export default Trie;
