/* eslint-disable @typescript-eslint/no-deprecated -- draining SHOULD_USE_STAGING_SERVER is this file's entire purpose */
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, OnyxMultiSetInput, OnyxValue} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** Onyx has no promise-based read. */
function readOnce<TKey extends OnyxKey>(key: TKey): Promise<OnyxValue<TKey>> {
    return new Promise((resolve) => {
        const connection = Onyx.connectWithoutView({
            key,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

/**
 * A missing legacy key must write NOTHING: `resolveActiveServer` derives the environment default from
 * `value === undefined`, so seeding 'production' would pin every staging and adhoc build to production.
 */
export default async function ReplaceShouldUseStagingServerWithActiveServer(): Promise<void> {
    const shouldUseStagingServer = await readOnce(ONYXKEYS.SHOULD_USE_STAGING_SERVER);
    if (shouldUseStagingServer === undefined) {
        Log.info('[Migrate Onyx] Skipped ReplaceShouldUseStagingServerWithActiveServer — no legacy value');
        return;
    }

    const updates: OnyxMultiSetInput = {[ONYXKEYS.SHOULD_USE_STAGING_SERVER]: null};
    if ((await readOnce(ONYXKEYS.ACTIVE_SERVER)) === undefined) {
        updates[ONYXKEYS.ACTIVE_SERVER] = shouldUseStagingServer ? CONST.SERVER.STAGING : CONST.SERVER.PRODUCTION;
    }

    await Onyx.multiSet(updates);
    Log.info('[Migrate Onyx] Ran ReplaceShouldUseStagingServerWithActiveServer migration');
}
