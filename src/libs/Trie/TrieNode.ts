type Suggestion = {
    code: string;
    types?: string[];
    name?: string;
};

type MetaData = {
    [key: string]: unknown;
    suggestions?: Suggestion[];
};

class TrieNode<TMetadata extends MetaData> {
    children: Record<string, TrieNode<TMetadata>>;

    metaData: Partial<TMetadata>;

    isEndOfWord: boolean;

    constructor() {
        this.children = {};
        this.metaData = {};
        this.isEndOfWord = false;
    }
}

export default TrieNode;

export type {MetaData};
