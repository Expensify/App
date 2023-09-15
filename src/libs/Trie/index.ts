import TrieNode, {MetaData} from './TrieNode';

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
     * Add a word to the Trie
     * @param [metaData] - attach additional data to the word
     * @param [allowEmptyWords] - empty word doesn't have any char, you shouldn't pass a true value for it because we are disallowing adding an empty word
     */
    add(word: string, metaData: Partial<TMetaData> = {}, node = this.root, allowEmptyWords = false) {
        const newWord = word.toLowerCase();
        const newNode = node;
        if (newWord.length === 0 && !allowEmptyWords) {
            throw new Error('Cannot insert empty word into Trie');
        }
        if (newWord.length === 0) {
            newNode.isEndOfWord = true;
            newNode.metaData = metaData;
            return;
        }
        if (!newNode.children[newWord[0]]) {
            newNode.children[newWord[0]] = new TrieNode();
            this.add(newWord.substring(1), metaData, newNode.children[newWord[0]], true);
        }
        this.add(newWord.substring(1), metaData, newNode.children[newWord[0]], true);
    }

    /**
     * Search for a word in the Trie.
     * @returns - the node for the word if it's found, or null if it's not found
     */
    search(word: string): TrieNode<TMetaData> | null {
        let newWord = word.toLowerCase();
        let node = this.root;
        while (newWord.length > 1) {
            if (!node.children[newWord[0]]) {
                return null;
            }
            node = node.children[newWord[0]];

            newWord = newWord.substring(1);
        }
        return node.children[newWord] && node.children[newWord].isEndOfWord ? node.children[newWord] : null;
    }

    /**
     * Update a word data in the Trie.
     */
    update(word: string, metaData: TMetaData) {
        let newWord = word.toLowerCase();
        let node = this.root;
        while (newWord.length > 1) {
            if (!node.children[newWord[0]]) {
                throw new Error('Word does not exist in the Trie');
            }
            node = node.children[newWord[0]];
            newWord = newWord.substring(1);
        }
        node.children[newWord].metaData = metaData;
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
