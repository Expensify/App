import {skinTones} from '../../../../../assets/emojis';

/**
 * Fetch the emoji code of selected skinTone
 * @param {Number} skinToneIndex
 * @returns {String}
 */
const getSkinToneEmojiFromIndex = skinToneIndex => skinTones.find(
    emoji => emoji.skinTone === skinToneIndex,
) ?? skinTones[0];

export default getSkinToneEmojiFromIndex;
