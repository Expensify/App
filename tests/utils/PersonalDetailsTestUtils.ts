import {getPersonalDetailsKey, toPersonalDetailsList} from '@libs/PersonalDetailsCollection';
import readOnceOnyxValue from '@libs/readOnceOnyxValue';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {OnyxMergeCollectionInput, OnyxMergeInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type PersonalDetailsInput = OnyxMergeInput<typeof ONYXKEYS.PERSONAL_DETAILS_LIST> | undefined;

/** Re-keys an accountID-keyed personal details list into `personalDetails_<accountID>` collection members */
function toPersonalDetailsCollection(personalDetails: PersonalDetailsInput): OnyxMergeCollectionInput<typeof ONYXKEYS.COLLECTION.PERSONAL_DETAILS> {
    const collection: Record<string, unknown> = {};
    for (const [accountID, personalDetail] of Object.entries(personalDetails ?? {})) {
        if (personalDetail !== undefined) {
            collection[getPersonalDetailsKey(accountID)] = personalDetail;
        }
    }
    // A null member removes that account, which Onyx applies even though its collection input type excludes null
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return collection as OnyxMergeCollectionInput<typeof ONYXKEYS.COLLECTION.PERSONAL_DETAILS>;
}

// Like the server, these write both formats: derived values still read the legacy single key

/** Spread into a multiSet or initial state in place of `[ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails` */
function withPersonalDetails<TPersonalDetails extends PersonalDetailsInput>(personalDetails: TPersonalDetails) {
    return {
        [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
        ...toPersonalDetailsCollection(personalDetails),
    };
}

/** Replaces every stored personal detail, like `Onyx.set` on the legacy single key did */
async function setPersonalDetailsList(personalDetails: PersonalDetailsInput): Promise<void> {
    const existing = await readOnceOnyxValue(ONYXKEYS.COLLECTION.PERSONAL_DETAILS);
    const collection = toPersonalDetailsCollection(personalDetails);
    const removals: Record<string, null> = {};
    for (const key of Object.keys(existing ?? {})) {
        if (!(key in collection)) {
            removals[key] = null;
        }
    }
    await Onyx.multiSet({...collection, ...removals, [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails ?? null});
}

/** Merges personal details keyed by accountID, like `Onyx.merge` on the legacy single key did */
async function mergePersonalDetailsList(personalDetails: PersonalDetailsInput): Promise<void> {
    if (!personalDetails) {
        return setPersonalDetailsList(personalDetails);
    }
    await Promise.all([
        Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails),
        Onyx.mergeCollection(ONYXKEYS.COLLECTION.PERSONAL_DETAILS, toPersonalDetailsCollection(personalDetails)),
    ]);
}

/** The update `buildPersonalDetailsUpdate` emits for personal details keyed by accountID */
function personalDetailsUpdate(personalDetails: Record<string, unknown>) {
    const value: Record<string, unknown> = {};
    for (const [accountID, personalDetail] of Object.entries(personalDetails)) {
        value[getPersonalDetailsKey(accountID)] = personalDetail;
    }
    return {onyxMethod: Onyx.METHOD.MERGE_COLLECTION, key: ONYXKEYS.COLLECTION.PERSONAL_DETAILS, value};
}

/** Reads the stored personal details keyed by accountID */
async function getPersonalDetailsList(): Promise<PersonalDetailsList | undefined> {
    const collection = await readOnceOnyxValue(ONYXKEYS.COLLECTION.PERSONAL_DETAILS);
    return Object.keys(collection ?? {}).length > 0 ? toPersonalDetailsList(collection) : undefined;
}

export {personalDetailsUpdate, toPersonalDetailsCollection, withPersonalDetails, setPersonalDetailsList, mergePersonalDetailsList, getPersonalDetailsList};
