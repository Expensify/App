/* eslint-disable @typescript-eslint/no-deprecated -- draining SHOULD_USE_STAGING_SERVER is this file's entire purpose */
import Log from '@libs/Log';
import readOnceOnyxValue from '@libs/readOnceOnyxValue';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxMultiSetInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * A missing legacy key must write NOTHING: `resolveActiveServer` derives the environment default from
 * `value === undefined`, so seeding 'production' would pin every staging and adhoc build to production.
 */
export default async function ReplaceShouldUseStagingServerWithActiveServer(): Promise<void> {
    const shouldUseStagingServer = await readOnceOnyxValue(ONYXKEYS.SHOULD_USE_STAGING_SERVER);
    if (shouldUseStagingServer === undefined) {
        return;
    }

    const updates: OnyxMultiSetInput = {[ONYXKEYS.SHOULD_USE_STAGING_SERVER]: null};
    if ((await readOnceOnyxValue(ONYXKEYS.ACTIVE_SERVER)) === undefined) {
        updates[ONYXKEYS.ACTIVE_SERVER] = shouldUseStagingServer ? CONST.SERVER.STAGING : CONST.SERVER.PRODUCTION;
    }

    await Onyx.multiSet(updates);
    Log.info('[Migrate Onyx] Ran ReplaceShouldUseStagingServerWithActiveServer migration');
}
