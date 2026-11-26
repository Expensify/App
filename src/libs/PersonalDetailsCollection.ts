import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

const PREFIX_LENGTH = ONYXKEYS.COLLECTION.PERSONAL_DETAILS.length;

function getPersonalDetailsKey(accountID: number | string | undefined) {
    return `${ONYXKEYS.COLLECTION.PERSONAL_DETAILS}${accountID}` as const;
}

// Whole-map subscribers share one Onyx collection object, so they share one re-keyed copy too
const personalDetailsListCache = new WeakMap<NonNullable<OnyxCollection<PersonalDetails>>, PersonalDetailsList>();

/** Re-keys the personal details collection by accountID, the shape every consumer indexes. An empty collection reads as not loaded, like the legacy key after a clear. */
function toPersonalDetailsList(collection: OnyxCollection<PersonalDetails>): PersonalDetailsList | undefined {
    if (!collection || isEmptyObject(collection)) {
        return undefined;
    }
    const cached = personalDetailsListCache.get(collection);
    if (cached) {
        return cached;
    }
    const personalDetailsList: PersonalDetailsList = {};
    for (const [key, personalDetail] of Object.entries(collection)) {
        personalDetailsList[key.slice(PREFIX_LENGTH)] = personalDetail ?? null;
    }
    personalDetailsListCache.set(collection, personalDetailsList);
    return personalDetailsList;
}

export {getPersonalDetailsKey, toPersonalDetailsList};
