import styleVariables from '../../../../styles/variables';

const dynamicEmojiSize = (windowWidth) => {
    if (windowWidth <= 320) {
        return styleVariables.emojiSizeExtraSmall;
    }
    if (windowWidth <= 480) {
        return styleVariables.emojiSizeNormal;
    }
    return styleVariables.emojiSizeLarge;
};

export default dynamicEmojiSize;
