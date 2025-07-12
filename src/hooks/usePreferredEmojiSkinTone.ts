import {useCallback, useContext} from 'react';
import {PreferredEmojiSkinToneContext} from '@components/OnyxListItemProvider';
import {updatePreferredSkinTone as updatePreferredSkinToneAction} from '@userActions/User';

export default function usePreferredEmojiSkinTone() {
    const preferredSkinTone = useContext(PreferredEmojiSkinToneContext);

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
