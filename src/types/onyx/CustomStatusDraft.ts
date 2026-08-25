/** Model of custom status draft */
type CustomStatusDraft = {
    emojiCode?: string;

    text?: string;

    /** ISO 8601 format string, which represents the time when the status should be cleared */
    clearAfter: string;
};

export default CustomStatusDraft;
