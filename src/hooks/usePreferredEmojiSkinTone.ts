import {useCallback} from 'react';
import {updatePreferredSkinTone as updatePreferredSkinToneAction} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

export default function usePreferredEmojiSkinTone() {
    const [preferredSkinTone] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE, {canBeMissing: true});

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
