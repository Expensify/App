import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';

// This migration fixes the value of preferred skin tone to use number only.
export default function () {
    return new Promise<void>((resolve) => {
        // Connect to the PREFERRED_EMOJI_SKIN_TONE key in Onyx to get the value of PREFERRED_EMOJI_SKIN_TONE.
        // This will change the value of default to -1
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
            callback: (value: OnyxEntry<number | string>) => {
                Onyx.disconnect(connection);

                if (!value) {
                    Log.info('[Migrate Onyx] Skipped migration RenameEmojiSkinTone because there is no value');
                    return resolve();
                }

                if (typeof value === 'number') {
                    Log.info('[Migrate Onyx] Skipped migration RenameEmojiSkinTone because the value is correct');
                    return resolve();
                }

                Log.info('[Migrate Onyx] Running RenameEmojiSkinTone migration');

                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.merge(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE, -1).then(() => {
                    Log.info('[Migrate Onyx] Ran migration RenameEmojiSkinTone');
                    resolve();
                });
            },
        });
    });
}
