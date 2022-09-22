
class TrieNode {
    constructor() {
        this.children = {};
        this.leaf = false;
        this.metaData = {};
    }

    /**
     * Make the current as a leaf node.
    */
    setCompleteWord() {
        this.leaf = true;
    }

    /**
    * Check if the current node is a leaf node.
    * @returns {Boolean}
    */
    isCompleteWord() {
        return this.leaf;
    }

    /**
     * Attach additional metadata to this node.
     *
     * @param {Object} metaData
     */
    setMetaData(metaData) {
        this.metaData = metaData;
    }

    /**
    * Get additional metadata for this node.
    * @return {Object} metaData
    */
    getMetaData() {
        return this.metaData;
    }

    /**
    * Get code metadata for this node.
    * @return {Object} code
    */
    getCode() {
        return this.metaData.code ? this.metaData.code : null;
    }
}

export default TrieNode;
