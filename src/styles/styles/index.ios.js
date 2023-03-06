import _ from 'lodash';
import variables from '../variables';
import baseStyles from './baseStyles';
import themeColors from '../themes/default';

const styles = {
    ...baseStyles.styles,
    displayNameText: {
        marginTop: 6,
    },

    emojiMessageText: {
        position: 'relative',
        fontSize: variables.fontSizeEmoji,
        lineHeight: variables.fontSizeEmojiHeight,
    },

    inboxEmojiMessageText: {
        marginTop: 1,
    },

    onlyEmojisText: {
        marginTop: 1,
        fontSize: variables.fontSizeOnlyEmojis,
        lineHeight: variables.fontSizeOnlyEmojisHeight,
    },

    inboxMessageText: {
        marginTop: 0,
    },

    profileEmojiText: {
        top: 0,
        fontSize: variables.fontSizeEmojiProfile,
        lineHeight: variables.fontSizeEmojiProfileHeight,
    },

    chatItemMessageHeaderTimestamp: {
        flexShrink: 0,
        paddingTop: 0,
        color: themeColors.textSupporting,
        fontSize: variables.fontSizeSmall,
        bottom: 2.5,
    },
};

export default _.assign(baseStyles, styles);
