/** Class representing a Trie node. */
class TrieNode {
    /**
     * Reset all attributes to default values.
     */
    constructor() {
        this.keys = new Map();
        this.end = false;
        this.code = '';
    }

    /**
     * Make the current node an end node.
    */
    setEnd() {
        this.end = true;
    }

    /**
    * Check if the current node is an end node.
    * @returns {Boolean}
    */
    isEnd() {
        return this.end;
    }

    /**
    * Set the node code, code represent an emoji
    * @param {String} code
    */
    setCode(code) {
        this.code = code;
    }

    /**
    * Get the node code, code represent an emoji
    * @return {String}
    */
    getCode() {
        return this.code;
    }
}

export default TrieNode;
