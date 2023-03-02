import variables from '../variables';
import baseStyles from './styles.native';
import themeColors from '../themes/default';

const styles = {
    ...baseStyles.styles,
    displayNameText: {
        marginTop: 6,
    },

    emojiMessageText: {
        top: 1,
        position: 'relative',
        fontSize: variables.fontSizeEmoji,
        lineHeight: variables.fontSizeEmojiHeight,
    },

    inboxEmojiMessageText: {
        marginTop: 2,
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
        color: themeColors.textSupporting,
        fontSize: variables.fontSizeSmall,
        bottom: 2.5,
    },
};

export default {...baseStyles, ...styles};
