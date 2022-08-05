import TrieNode from './TrieNode';

/** Class representing a Trie. */
class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    /**
    * Add a word to the Trie
    * @param {String} word
    * @param {String} [code]
    * @param {TrieNode} node
    * @returns {Object}
    */
    add(word, code, node = this.root) {
        if (word.length === 0) {
            node.setEnd();
            node.setCode(code);
            return;
        } if (!node.keys.has(word[0])) {
            node.keys.set(word[0], new TrieNode());
            return this.add(word.substring(1), code, node.keys.get(word[0]));
        }
        return this.add(word.substring(1), code, node.keys.get(word[0]));
    }

    /**
    * Check if the word is exist in the Trie.
    * @param {String} word
    * @returns {Object}
    */
    isWord(word) {
        let node = this.root;
        while (word.length > 1) {
            if (!node.keys.has(word[0])) {
                // return false;
                return {found: false};
            }
            node = node.keys.get(word[0]);
            // eslint-disable-next-line no-param-reassign
            word = word.substring(1);
        }
        const found = !!((node.keys.has(word) && node.keys.get(word).isEnd()));
        return {found, code: node.keys.get(word).getCode()};
    }
}

export default Trie;
