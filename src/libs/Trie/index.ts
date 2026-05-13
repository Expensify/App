import type {MetaData} from './TrieNode';
import TrieNode from './TrieNode';

type Word<TMetaData extends MetaData> = {
    name: string;
    metaData: Partial<TMetaData>;
};

class Trie<TMetaData extends MetaData> {
    root: TrieNode<TMetaData>;

    constructor() {
        this.root = new TrieNode();
    }

    /**
     * Walk to the end node for a word, creating intermediate nodes as needed.
     * Marks the final node as end-of-word if it wasn't already.
     * @returns the node and whether this is a new end-of-word entry
     */
    getOrCreate(word: string): {node: TrieNode<TMetaData>; isNew: boolean} {
        if (word.length === 0) {
            throw new Error('Cannot insert empty word into Trie');
        }
        const lower = word.toLowerCase();
        let node = this.root;
        for (const ch of lower) {
            if (!node.children[ch]) {
                node.children[ch] = new TrieNode();
            }
            node = node.children[ch];
        }
        const isNew = !node.isEndOfWord;
        node.isEndOfWord = true;
        return {node, isNew};
    }

    /**
     * Search for a word in the Trie.
     * @returns - the node for the word if it's found, or null if it's not found
     */
    search(word: string): TrieNode<TMetaData> | null {
        if (word.length === 0) {
            return null;
        }
        const lower = word.toLowerCase();
        let node = this.root;
        for (const ch of lower) {
            if (!node.children[ch]) {
                return null;
            }
            node = node.children[ch];
        }
        return node.isEndOfWord ? node : null;
    }

    /**
     * Find all leaf nodes starting with a substring.
     * @param [limit] - matching words limit
     */
    getAllMatchingWords(substr: string, limit = 5): Array<Word<TMetaData>> {
        const newSubstr = substr.toLowerCase();
        let node = this.root;
        let prefix = '';
        for (const char of newSubstr) {
            prefix += char;
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }
        return this.getChildMatching(node, prefix, limit, []);
    }

    /**
     * Find all leaf nodes that are descendants of a given child node.
     */
    getChildMatching(node: TrieNode<TMetaData>, prefix: string, limit: number, words: Array<Word<TMetaData>> = []): Array<Word<TMetaData>> {
        const matching = words;
        if (matching.length >= limit) {
            return matching;
        }
        if (node.isEndOfWord) {
            matching.push({name: prefix, metaData: node.metaData});
        }
        const children = Object.keys(node.children);
        for (const child of children) {
            this.getChildMatching(node.children[child], prefix + child, limit, matching);
        }
        return matching;
    }
}

export default Trie;
