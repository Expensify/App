import _ from 'underscore';
import * as Emojis from '../../../assets/emojis';

/**
 * Fetch the emoji code of selected skinTone
 * @param {Number} skinToneIndex
 * @returns {String}
 */
function getSkinToneEmojiFromIndex(skinToneIndex) {
    return _.find(Emojis.skinTones, emoji => emoji.skinTone === skinToneIndex) || Emojis.skinTones[0];
}

export default getSkinToneEmojiFromIndex;
