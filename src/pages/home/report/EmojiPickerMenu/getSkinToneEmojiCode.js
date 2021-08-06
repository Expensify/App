import {skinTones} from '../../../../../assets/emojis';

/**
 * Fetch the emoji code of selected skinTone
 * @param {Number} skinToneIndex
 * @returns {String}
 */
const getSkinToneEmojiCode = (skinToneIndex) => {
    if (typeof skinToneIndex !== 'number') {
        return skinTones[0].code;
    }
    const selectedSkinTone = skinTones.find(emoji => emoji.skinTone === skinToneIndex);
    return selectedSkinTone ? selectedSkinTone.code : skinTones[0].code;
};

export default getSkinToneEmojiCode;
