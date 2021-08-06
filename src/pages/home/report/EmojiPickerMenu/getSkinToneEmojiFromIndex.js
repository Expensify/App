import {skinTones} from '../../../../../assets/emojis';

/**
 * Fetch the emoji code of selected skinTone
 * @param {Number} skinToneIndex
 * @returns {String}
 */
const getSkinToneEmojiFromIndex = (skinToneIndex) => {
    if (typeof skinToneIndex !== 'number') {
        return skinTones[0];
    }
    const selectedSkinTone = skinTones.find(emoji => emoji.skinTone === skinToneIndex);
    return selectedSkinTone || skinTones[0];
};

export default getSkinToneEmojiFromIndex;
