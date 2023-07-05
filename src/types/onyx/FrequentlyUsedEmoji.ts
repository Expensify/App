type FrequentlyUsedEmoji = {
    /** The emoji code */
    code: string;

    /** The name of the emoji */
    name: string;

    /** The number of times the emoji has been used */
    count: number;

    /** The timestamp of when the emoji was last used */
    lastUpdatedAt: number;
};

export default FrequentlyUsedEmoji;
