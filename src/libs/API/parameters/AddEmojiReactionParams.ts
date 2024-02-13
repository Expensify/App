type AddEmojiReactionParams = {
    reportID: string;
    skinTone: string | number;
    emojiCode: string;
    reportActionID: string;
    createdAt: string;
    useEmojiReactions: boolean;
};

export default AddEmojiReactionParams;
