import _ from 'underscore';
import Emoji from '../../assets/emojis';
import CONST from '../../src/CONST';
import {isSingleEmoji} from '../../src/libs/ValidationUtils';
import getEmojiUnicode from '../../src/libs/Emoji/getEmojiUnicode';

describe('EmojiRegexTest', () => {
    it('matches all the emojis in the list', () => {
        const emojiMatched = true;
        _.each(Emoji, (emoji) => {
            if (emoji.header === true || emoji.code === CONST.EMOJI_SPACER) {
                return true;
            }
            const isEmojiMatched = isSingleEmoji(emoji.code);
            if (!isEmojiMatched) {
                console.log(' Emoji', emoji.code, getEmojiUnicode(emoji.code).trim());
            }

            return isEmojiMatched;
        });

        expect(emojiMatched).toBe(true);
    });
});
