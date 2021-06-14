import styleVariables from '../../../../styles/variables';

const dynamicEmojiSize = (windowWidth) => {
    if (windowWidth <= 320) { return styleVariables.fontSizeSmall; }
    if (windowWidth <= 480) { return styleVariables.fontSizeNormal; }
    return styleVariables.fontSizeLarge;
};

export default dynamicEmojiSize;
