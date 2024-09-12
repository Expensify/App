/**
 * Model of a single saved search
 */
type SaveSearchItem = {
    /** Name of the saved search */
    name: string;

    /** Query string for the saved search */
    query: string;
};

/**
 * Model of saved searches
 */
type SaveSearch = Record<number, SaveSearchItem | null>;

export type {SaveSearch, SaveSearchItem};
