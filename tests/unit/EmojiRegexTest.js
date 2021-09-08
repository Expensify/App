import _ from 'underscore';
import Emoji from '../../assets/emojis';
import CONST from '../../src/CONST';
import {isSingleEmoji} from '../../src/libs/ValidationUtils';
import getEmojiUnicode from '../../src/libs/Emoji/getEmojiUnicode';

describe('EmojiRegexTest', () => {
    it('matches all the emojis in the list', () => {
        const emojiMatched = _.every(Emoji, (emoji) => {
            if (emoji.header === true || emoji.code === CONST.EMOJI_SPACER) {
                return true;
            }
            const isEmojiMatched = isSingleEmoji(emoji.code);
            let skinToneMatched = true;
            if (emoji.types) {
                skinToneMatched = _.every(emoji.types, emojiWithSkinTone => isSingleEmoji(emojiWithSkinTone));
            }
            return skinToneMatched && isEmojiMatched;
        });

        expect(emojiMatched).toBe(true);
    });
});
