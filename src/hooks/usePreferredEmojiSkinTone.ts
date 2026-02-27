import {useCallback} from 'react';
import {updatePreferredSkinTone as updatePreferredSkinToneAction} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

export default function usePreferredEmojiSkinTone() {
    const [preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE, {canBeMissing: true});

    const updatePreferredSkinTone = useCallback(
        (skinTone: number) => {
            if (Number(preferredSkinTone) === Number(skinTone)) {
                return;
            }

            updatePreferredSkinToneAction(skinTone);
        },
        [preferredSkinTone],
    );

    return [preferredSkinTone, updatePreferredSkinTone] as const;
}
