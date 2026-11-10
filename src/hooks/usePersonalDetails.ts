/** Personal details reads for components, so nothing touches PERSONAL_DETAILS_LIST directly */
import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsListSelector, personalDetailsSelector} from '@src/selectors/PersonalDetails';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

import type {OnyxEntry, UseOnyxResult} from 'react-native-onyx';

// We need direct access to useOnyx from react-native-onyx to read the live personal details list instead of the search snapshot
// eslint-disable-next-line no-restricted-imports
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

import useOnyx from './useOnyx';

// On Search, @hooks/useOnyx reads the snapshot, which is missing while it loads. The live list covers that gap.
function usePersonalDetailsByIDs(accountIDs: Array<number | undefined> | undefined): UseOnyxResult<PersonalDetailsList>;
function usePersonalDetailsByIDs<TReturn>(accountIDs: Array<number | undefined> | undefined, selector: (personalDetails: PersonalDetailsList) => TReturn): UseOnyxResult<TReturn>;
function usePersonalDetailsByIDs<TReturn>(accountIDs: Array<number | undefined> | undefined, selector?: (personalDetails: PersonalDetailsList) => TReturn) {
    // Wrapped so a missing list (undefined) differs from a selector that returns undefined, and Onyx still deep-compares the selector output
    const wrappedSelector = (personalDetailsList: OnyxEntry<PersonalDetailsList>) => {
        if (!personalDetailsList) {
            return undefined;
        }
        const personalDetails = personalDetailsListSelector(accountIDs)(personalDetailsList);
        return {value: selector ? selector(personalDetails) : personalDetails};
    };
    const [personalDetailsFromSnapshot, result] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: wrappedSelector});
    const [livePersonalDetails] = useOnyxWithoutSnapshots(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: wrappedSelector});
    const loaded = personalDetailsFromSnapshot ?? livePersonalDetails;
    if (loaded) {
        return [loaded.value, result];
    }
    return [selector ? selector({}) : {}, result];
}

// Pass a selector when only part of the record is needed, so the caller doesn't re-render on the person's other fields
function usePersonalDetail(accountID: number | undefined): UseOnyxResult<PersonalDetails | undefined>;
function usePersonalDetail<TReturn>(accountID: number | undefined, selector: (personalDetail: PersonalDetails | undefined) => TReturn): UseOnyxResult<TReturn>;
function usePersonalDetail<TReturn>(accountID: number | undefined, selector?: (personalDetail: PersonalDetails | undefined) => TReturn) {
    const personalDetailSelector = (personalDetails: PersonalDetailsList) => {
        const personalDetail = personalDetailsSelector(accountID)(personalDetails);
        return selector ? selector(personalDetail) : personalDetail;
    };
    return usePersonalDetailsByIDs([accountID], personalDetailSelector);
}

// Re-renders on any account change, prefer usePersonalDetail/usePersonalDetailsByIDs when the accounts are known
function useAllPersonalDetails(): UseOnyxResult<PersonalDetailsList | undefined>;
function useAllPersonalDetails<TReturn>(selector: (value: PersonalDetailsList | undefined) => TReturn): UseOnyxResult<TReturn>;
function useAllPersonalDetails<TReturn>(selector?: (value: PersonalDetailsList | undefined) => TReturn) {
    return useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector});
}

// @hooks/useOnyx redirects this key to the search snapshot. Search surfaces need the live list.
function useAllPersonalDetailsWithoutSnapshots(): UseOnyxResult<PersonalDetailsList | undefined>;
function useAllPersonalDetailsWithoutSnapshots<TReturn>(selector: (value: PersonalDetailsList | undefined) => TReturn): UseOnyxResult<TReturn>;
function useAllPersonalDetailsWithoutSnapshots<TReturn>(selector?: (value: PersonalDetailsList | undefined) => TReturn) {
    return useOnyxWithoutSnapshots(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector});
}

export {usePersonalDetail, usePersonalDetailsByIDs, useAllPersonalDetails, useAllPersonalDetailsWithoutSnapshots};
