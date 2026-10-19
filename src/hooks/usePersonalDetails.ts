/** Personal details reads for components, so nothing touches PERSONAL_DETAILS_LIST directly */
import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsListSelector, personalDetailsSelector} from '@src/selectors/PersonalDetails';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

import type {OnyxEntry, UseOnyxResult} from 'react-native-onyx';

// We need direct access to useOnyx from react-native-onyx to read the live personal details list instead of the search snapshot
// eslint-disable-next-line no-restricted-imports
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

import useOnyx from './useOnyx';

// Pass a selector when only part of the record is needed, so the caller doesn't re-render on the person's other fields
function usePersonalDetail(accountID: number | undefined): UseOnyxResult<PersonalDetails | undefined>;
function usePersonalDetail<TReturn>(accountID: number | undefined, selector: (personalDetail: PersonalDetails | undefined) => TReturn): UseOnyxResult<TReturn>;
function usePersonalDetail<TReturn>(accountID: number | undefined, selector?: (personalDetail: PersonalDetails | undefined) => TReturn) {
    const personalDetailSelector = (personalDetailsList: OnyxEntry<PersonalDetailsList>) => {
        const personalDetail = personalDetailsSelector(accountID)(personalDetailsList);
        return selector ? selector(personalDetail) : personalDetail;
    };
    return useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailSelector});
}

function usePersonalDetailsByIDs(accountIDs: Array<number | undefined> | undefined): UseOnyxResult<PersonalDetailsList>;
function usePersonalDetailsByIDs<TReturn>(accountIDs: Array<number | undefined> | undefined, selector: (personalDetails: PersonalDetailsList) => TReturn): UseOnyxResult<TReturn>;
function usePersonalDetailsByIDs<TReturn>(accountIDs: Array<number | undefined> | undefined, selector?: (personalDetails: PersonalDetailsList) => TReturn) {
    const personalDetailsByIDsSelector = (personalDetailsList: OnyxEntry<PersonalDetailsList>) => {
        const personalDetails = personalDetailsListSelector(accountIDs)(personalDetailsList);
        return selector ? selector(personalDetails) : personalDetails;
    };
    return useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsByIDsSelector});
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
