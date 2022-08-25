import _ from 'underscore';
import TrieNode from './TrieNode';

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    /**
    * Add a word to the Trie
    * @param {String} word
    * @param {Object} [metaData]
    * @param {TrieNode} newNode
    * @param {String} [containChar]
    * @returns {void}
    */
    add(word, metaData, newNode = this.root, containChar) {
        const node = newNode;
        if (word.length === 0 && !containChar) {
            throw new Error('Cannot insert empty word into Trie :', word);
        }
        if (word.length === 0) {
            node.setCompleteWord();
            node.setMetaData(metaData);
            return;
        } if (!node.children[word[0]]) {
            node.children[word[0]] = new TrieNode();
            return this.add(word.substring(1), metaData, node.children[word[0]], word.charAt(0));
        }
        return this.add(word.substring(1), metaData, node.children[word[0]], word.charAt(0));
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
        const words = [];
        let firstChars = '';
        for (let i = 0; i < substr.length; i++) {
            firstChars += substr[i];
            if (node.children[substr[i]]) {
                node = node.children[substr[i]];
            } else {
                return words;
            }
        }
        this.getChildMatching(node, firstChars, words);
        return words;
    }

    /**
    * Find all leaf nodes inside a child node.
    * @param {TrieNode} node
    * @param {String} firstChars
    * @param {Array} words
    */
    getChildMatching = (node, firstChars, words) => {
        if (node.leaf) {
            words.unshift(firstChars);
        }
        _.keys(node.children).forEach(nodeChar => this.getChildMatching(node.children[nodeChar], firstChars + nodeChar, words));
    }
}

export default Trie;
