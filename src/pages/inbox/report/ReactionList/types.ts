type ReactionListProps = {
    /** Hide the ReactionList modal popover */
    onClose?: () => void;

    emojiCodes: string[];

    emojiName: string;

    emojiCount: number;
};

export default ReactionListProps;
