import React from 'react';
import * as EmojiUtils from '../../libs/EmojiUtils';
import * as Browser from '../../libs/Browser';

/**
 * Checks text element for presence of emoji as first character
 * and insert Zero-Width character to avoid selection issue
 * mentioned here https://github.com/Expensify/App/issues/29021
 *
 * @param {String} text
 * @param {Boolean} displayAsGroup
 * @returns {ReactNode | null} Text component with zero width character
 */

const checkForEmojiForSelection = ({text, displayAsGroup}) => {
    const firstLetterIsEmoji = EmojiUtils.isFirstLetterEmoji(text);
    if (firstLetterIsEmoji && !displayAsGroup && !Browser.isMobile()) {
        return <Text>&#x200b;</Text>;
    }
    return null;
};

export default checkForEmojiForSelection;
