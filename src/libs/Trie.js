import TrieNode from './TrieNode';

/** Class representing a Trie. */
class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    /**
    * Add an emoji into the Trie
    * @param {String} input
    * @param {String} code
    * @param {TrieNode} node
    * @return {Object}
    */
    add(input, code, node = this.root) {
        if (input.length === 0) {
            node.setEnd();
            node.setCode(code);
            return;
        } if (!node.keys.has(input[0])) {
            node.keys.set(input[0], new TrieNode());
            return this.add(input.substring(1), code, node.keys.get(input[0]));
        }
        return this.add(input.substring(1), code, node.keys.get(input[0]));
    }

    /**
    * Check if the emoji is exist in the Trie.
    * @param {String} emoji
    * @return {Object}
    */
    isEmoji(emoji) {
        let node = this.root;
        while (emoji.length > 1) {
            if (!node.keys.has(emoji[0])) {
                // return false;
                return {found: false};
            }
            node = node.keys.get(emoji[0]);
            // eslint-disable-next-line no-param-reassign
            emoji = emoji.substring(1);
        }
        const found = !!((node.keys.has(emoji) && node.keys.get(emoji).isEnd()));
        return {found, code: node.keys.get(emoji).getCode()};
    }
}

export default Trie;
