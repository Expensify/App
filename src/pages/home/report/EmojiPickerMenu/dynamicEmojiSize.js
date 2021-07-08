import styleVariables from '../../../../styles/variables';

const dynamicEmojiSize = (windowWidth) => {
    if (windowWidth <= 320) {
        return styleVariables.iconSizeExtraSmall;
    }
    if (windowWidth <= 480) {
        return styleVariables.iconSizeNormal;
    }
    return styleVariables.iconSizeLarge;
};

export default dynamicEmojiSize;
