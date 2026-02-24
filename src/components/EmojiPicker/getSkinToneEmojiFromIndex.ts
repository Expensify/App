import type {OnyxEntry} from 'react-native-onyx';
import * as Emojis from '@assets/emojis';

/**
 * Fetch the emoji code of selected skinTone
 */
function getSkinToneEmojiFromIndex(skinToneIndex: OnyxEntry<number | string>) {
    return Emojis.skinTones.find((emoji) => emoji.skinTone === skinToneIndex) ?? Emojis.skinTones[0];
}

export default getSkinToneEmojiFromIndex;
