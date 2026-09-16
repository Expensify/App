/** Personal details reads for components, so nothing touches PERSONAL_DETAILS_LIST directly */
import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsListSelector, personalDetailsSelector} from '@src/selectors/PersonalDetails';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

import type {UseOnyxResult} from 'react-native-onyx';

// eslint-disable-next-line no-restricted-imports
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

import useOnyx from './useOnyx';

function usePersonalDetail(accountID: number | undefined): UseOnyxResult<PersonalDetails | undefined> {
    return useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsSelector(accountID)});
}

function usePersonalDetailsByIDs(accountIDs: Array<number | undefined> | undefined): UseOnyxResult<PersonalDetailsList> {
    return useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsListSelector(accountIDs)});
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
