/** Personal details reads for components, so nothing touches the personal details collection directly */
import {getPersonalDetailsKey, toPersonalDetailsList} from '@libs/PersonalDetailsCollection';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry, UseOnyxResult} from 'react-native-onyx';

// We need direct access to useOnyx from react-native-onyx to read the live personal details instead of the search snapshot
// eslint-disable-next-line no-restricted-imports
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

import useOnyx from './useOnyx';

const skipPersonalDetailsSelector = (): {value: unknown} | undefined => undefined;

// On Search, @hooks/useOnyx reads the snapshot, which is missing while it loads. The live collection covers that gap.
function usePersonalDetailsByIDs(accountIDs: Array<number | undefined> | undefined): UseOnyxResult<PersonalDetailsList>;
function usePersonalDetailsByIDs<TReturn>(accountIDs: Array<number | undefined> | undefined, selector: (personalDetails: PersonalDetailsList) => TReturn): UseOnyxResult<TReturn>;
function usePersonalDetailsByIDs<TReturn>(accountIDs: Array<number | undefined> | undefined, selector?: (personalDetails: PersonalDetailsList) => TReturn) {
    // Wrapped so a missing collection (undefined) differs from a selector that returns undefined, and Onyx still deep-compares the selector output
    const wrappedSelector = (collection: OnyxCollection<PersonalDetails>) => {
        if (!collection) {
            return undefined;
        }
        const personalDetails: PersonalDetailsList = {};
        for (const accountID of accountIDs ?? []) {
            const personalDetail = accountID ? collection[getPersonalDetailsKey(accountID)] : undefined;
            if (accountID && personalDetail) {
                personalDetails[accountID] = personalDetail;
            }
        }
        return {value: selector ? selector(personalDetails) : personalDetails};
    };
    const [personalDetailsFromSnapshot, result] = useOnyx(ONYXKEYS.COLLECTION.PERSONAL_DETAILS, {selector: wrappedSelector});
    // Off Search both reads hit the same live collection, so the live one only selects while the first has nothing
    const hasPersonalDetailsFromSnapshot = !!personalDetailsFromSnapshot;
    const [livePersonalDetails, liveResult] = useOnyxWithoutSnapshots(ONYXKEYS.COLLECTION.PERSONAL_DETAILS, {
        selector: hasPersonalDetailsFromSnapshot ? skipPersonalDetailsSelector : wrappedSelector,
    });
    if (personalDetailsFromSnapshot) {
        return [personalDetailsFromSnapshot.value, result];
    }
    if (livePersonalDetails) {
        return [livePersonalDetails.value, liveResult];
    }
    return [selector ? selector({}) : {}, result];
}

// Pass a selector when only part of the record is needed, so the caller doesn't re-render on the person's other fields
function usePersonalDetail(accountID: number | undefined): UseOnyxResult<PersonalDetails | undefined>;
function usePersonalDetail<TReturn>(accountID: number | undefined, selector: (personalDetail: PersonalDetails | undefined) => TReturn): UseOnyxResult<TReturn>;
function usePersonalDetail<TReturn>(accountID: number | undefined, selector?: (personalDetail: PersonalDetails | undefined) => TReturn) {
    const key = getPersonalDetailsKey(accountID ?? CONST.DEFAULT_NUMBER_ID);
    // Wrapped for the same reason as usePersonalDetailsByIDs: a missing record falls through to the live read
    const wrappedSelector = (personalDetail: OnyxEntry<PersonalDetails>) => {
        if (!accountID || !personalDetail) {
            return undefined;
        }
        return {value: selector ? selector(personalDetail) : personalDetail};
    };
    const [personalDetailFromSnapshot, result] = useOnyx(key, {selector: wrappedSelector});
    const hasPersonalDetailFromSnapshot = !!personalDetailFromSnapshot;
    const [livePersonalDetail, liveResult] = useOnyxWithoutSnapshots(key, {
        selector: hasPersonalDetailFromSnapshot ? skipPersonalDetailsSelector : wrappedSelector,
    });
    if (personalDetailFromSnapshot) {
        return [personalDetailFromSnapshot.value, result];
    }
    if (livePersonalDetail) {
        return [livePersonalDetail.value, liveResult];
    }
    return [selector ? selector(undefined) : undefined, result];
}

// Re-renders on any account change, prefer usePersonalDetail/usePersonalDetailsByIDs when the accounts are known
function useAllPersonalDetails(): UseOnyxResult<PersonalDetailsList | undefined>;
function useAllPersonalDetails<TReturn>(selector: (value: PersonalDetailsList | undefined) => TReturn): UseOnyxResult<TReturn>;
function useAllPersonalDetails<TReturn>(selector?: (value: PersonalDetailsList | undefined) => TReturn) {
    const collectionSelector = selector ? (collection: OnyxCollection<PersonalDetails>) => selector(toPersonalDetailsList(collection)) : undefined;
    const [value, result] = useOnyx(ONYXKEYS.COLLECTION.PERSONAL_DETAILS, {selector: collectionSelector});
    return [selector ? value : toPersonalDetailsList(value), result];
}

// @hooks/useOnyx redirects this key to the search snapshot. Search surfaces need the live collection.
function useAllPersonalDetailsWithoutSnapshots(): UseOnyxResult<PersonalDetailsList | undefined>;
function useAllPersonalDetailsWithoutSnapshots<TReturn>(selector: (value: PersonalDetailsList | undefined) => TReturn): UseOnyxResult<TReturn>;
function useAllPersonalDetailsWithoutSnapshots<TReturn>(selector?: (value: PersonalDetailsList | undefined) => TReturn) {
    const collectionSelector = selector ? (collection: OnyxCollection<PersonalDetails>) => selector(toPersonalDetailsList(collection)) : undefined;
    const [value, result] = useOnyxWithoutSnapshots(ONYXKEYS.COLLECTION.PERSONAL_DETAILS, {selector: collectionSelector});
    return [selector ? value : toPersonalDetailsList(value), result];
}

export {usePersonalDetail, usePersonalDetailsByIDs, useAllPersonalDetails, useAllPersonalDetailsWithoutSnapshots};
