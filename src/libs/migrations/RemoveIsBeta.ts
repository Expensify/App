import Log from '@libs/Log';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

// The `isBeta` key was replaced by `betaBuildVersion`; clean the orphaned entry out of existing installs' storage.
// The cast is needed because the key intentionally no longer exists in ONYXKEYS.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const DEPRECATED_IS_BETA_KEY = 'isBeta' as OnyxKey;

export default function (): Promise<void> {
    // No need to add a new action just for this migration
    // eslint-disable-next-line rulesdir/prefer-actions-set-data
    return Onyx.set(DEPRECATED_IS_BETA_KEY, null).then(() => {
        Log.info('[Migrate Onyx] Ran RemoveIsBeta migration');
    });
}
