import React from 'react';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import Text from '../components/Text';
import * as EmojiUtils from './EmojiUtils';

/**
 *
 * @param {String} text message text
 * @param {Object} styles custom styles to apply to the text rendered
 * @returns {string | JSX.Element[]}
 */
export default function renderTextWithEmoji(text, styles) {
    return EmojiUtils.isEmoji(text) ? _.map([...Str.htmlDecode(text)], ((char, index) => (
        <Text key={char + index} style={[EmojiUtils.isEmoji(char) ? {...styles} : undefined]}>
            {char}
        </Text>
    ))) : text;
}
