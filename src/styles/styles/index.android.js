import _ from 'lodash';
import variables from '../variables';
import baseStyles from './baseStyles';

const styles = {
    ...baseStyles.styles,
    displayNameText: {
        marginTop: 4,
    },

    emojiMessageText: {
        top: 3,
        position: 'relative',
        fontSize: variables.fontSizeEmoji,
        lineHeight: variables.fontSizeEmojiHeight,
    },

    inboxEmojiMessageText: {
        marginTop: 6,
    },

    inboxMessageText: {
        marginTop: 1,
    },

    onlyEmojisText: {
        marginTop: 3,
        fontSize: variables.fontSizeOnlyEmojis,
        lineHeight: variables.fontSizeOnlyEmojisHeight,
    },

    profileEmojiText: {
        fontSize: variables.fontSizeEmojiProfile,
        lineHeight: variables.fontSizeEmojiProfileHeight,
        top: 4,
    },
};

export default _.assign(baseStyles, styles);
