import * as Emojis from '@assets/emojis';

/**
 * Fetch the emoji code of selected skinTone
 * @param skinToneIndex
 */
function getSkinToneEmojiFromIndex(skinToneIndex: number) {
    return Emojis.skinTones.find((emoji) => emoji.skinTone === skinToneIndex) ?? Emojis.skinTones[0];
}

export default getSkinToneEmojiFromIndex;
