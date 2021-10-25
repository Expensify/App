import {skinTones} from '../../../../../assets/emojis';

/**
 * Fetch the emoji code of selected skinTone
 * @param {Number} skinToneIndex
 * @returns {String}
 */
function getSkinToneEmojiFromIndex(skinToneIndex) {
    return skinTones.find(emoji => emoji.skinTone === skinToneIndex) || skinTones[0];
}

export default getSkinToneEmojiFromIndex;
