import {useContext} from 'react';
import {PreferredEmojiSkinToneContext} from '@components/OnyxProvider';
import * as User from '@userActions/User';

export default function usePreferredEmojiSkinTone() {
    const preferredSkinTone = useContext(PreferredEmojiSkinToneContext);

    const updatePreferredSkinTone = (skinTone: number) => {
        if (Number(preferredSkinTone) === Number(skinTone)) {
            return;
        }

        User.updatePreferredSkinTone(skinTone);
    };

    return [preferredSkinTone, updatePreferredSkinTone];
}
