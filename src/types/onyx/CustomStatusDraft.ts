type CustomStatusDraft = {
    /** The emoji code of the draft status */
    emojiCode: string;

    /** The text of the draft status */
    text: string;

    /** ISO 8601 format string, which represents the time when the status should be cleared */
    clearAfter: string;
};

export default CustomStatusDraft;
