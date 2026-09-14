import {getPersonalDetailsByID, getPersonalDetailsListByIDs} from '@libs/PersonalDetailsUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

import type {UseOnyxResult} from 'react-native-onyx';

import useOnyx from './useOnyx';

function usePersonalDetail(accountID: number | undefined): UseOnyxResult<PersonalDetails | undefined> {
    return useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: (personalDetailsList) => getPersonalDetailsByID(accountID, personalDetailsList)});
}

function usePersonalDetailsByIDs(accountIDs: Array<number | undefined> | undefined): UseOnyxResult<PersonalDetailsList> {
    return useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: (personalDetailsList) => getPersonalDetailsListByIDs(accountIDs, personalDetailsList)});
}

// Re-renders on any account change, prefer usePersonalDetail/usePersonalDetailsByIDs when the accounts are known
function useAllPersonalDetails(): UseOnyxResult<PersonalDetailsList | undefined>;
function useAllPersonalDetails<TReturn>(selector: (value: PersonalDetailsList | undefined) => TReturn): UseOnyxResult<TReturn>;
function useAllPersonalDetails<TReturn>(selector?: (value: PersonalDetailsList | undefined) => TReturn) {
    return useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector});
}

export {usePersonalDetail, usePersonalDetailsByIDs, useAllPersonalDetails};
