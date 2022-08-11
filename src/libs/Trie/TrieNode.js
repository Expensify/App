import _ from 'underscore';

class TrieNode {
    /**
     * Reset all attributes to default values.
     */
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
        return _.keys(this.children).length === 0;
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
}

export default TrieNode;
