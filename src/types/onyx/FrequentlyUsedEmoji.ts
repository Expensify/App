/** Model of frequently used emoji */
type FrequentlyUsedEmoji = {
    code: string;

    name: string;

    /** Canonical Unicode hexcode when populated from hydrated picker emoji data */
    hexcode?: string;

    /** The number of times the emoji has been used */
    count: number;

    /** The timestamp in UNIX format when the emoji was last used */
    lastUpdatedAt: number;

    /** The emoji skin tone type */
    types?: readonly string[];

    keywords?: string[];
};

export default FrequentlyUsedEmoji;
