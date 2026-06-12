type ReactionListProps = {
    /** Hide the ReactionList modal popover */
    onClose?: () => void;

    /** The emoji codes */
    emojiCodes: string[];

    /** The name of the emoji */
    emojiName: string;

    /** Count of the emoji reactions */
    emojiCount: number;
};

export default ReactionListProps;
