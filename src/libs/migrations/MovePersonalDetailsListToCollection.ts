import Log from '@libs/Log';
import {getPersonalDetailsKey} from '@libs/PersonalDetailsCollection';
import readOnceOnyxValue from '@libs/readOnceOnyxValue';

import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxMergeCollectionInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Personal details moved from the single `personalDetailsList` key to the `personalDetails_` collection. ReconnectApp only
 * sends what changed, so a client upgrading with a cached list would otherwise start with an empty collection. The legacy
 * key stays in place because derived values still read it.
 */
export default async function MovePersonalDetailsListToCollection(): Promise<void> {
    const [personalDetailsList, personalDetailsCollection] = await Promise.all([readOnceOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST), readOnceOnyxValue(ONYXKEYS.COLLECTION.PERSONAL_DETAILS)]);
    if (!personalDetailsList || Object.keys(personalDetailsCollection ?? {}).length > 0) {
        return;
    }

    const collection: OnyxMergeCollectionInput<typeof ONYXKEYS.COLLECTION.PERSONAL_DETAILS> = {};
    for (const [accountID, personalDetail] of Object.entries(personalDetailsList)) {
        if (personalDetail) {
            collection[getPersonalDetailsKey(accountID)] = personalDetail;
        }
    }

    // A migration runs before the app starts, so it writes to Onyx directly instead of through an action
    // eslint-disable-next-line rulesdir/prefer-actions-set-data
    await Onyx.mergeCollection(ONYXKEYS.COLLECTION.PERSONAL_DETAILS, collection);
    Log.info(`[Migrate Onyx] Ran MovePersonalDetailsListToCollection migration on ${Object.keys(collection).length} personal details`);
}
