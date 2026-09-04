import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import {useMemo} from 'react';

import useOnyx from './useOnyx';

/** Mapping from accountID to user name (login or displayName). */
type AccountIDToNameMap = Record<string, string>;

/** Build the accountID -> name map from PERSONAL_DETAILS_LIST. */
function buildAccountIDToNameMap(personalDetailsList: PersonalDetailsList | undefined): AccountIDToNameMap {
    const map: AccountIDToNameMap = {};
    for (const personalDetails of Object.values(personalDetailsList ?? {})) {
        if (!personalDetails) {
            continue;
        }
        map[personalDetails.accountID] = personalDetails.login ?? personalDetails.displayName ?? '';
    }
    return map;
}

/** Returns an accountID -> name (login or displayName) map built from PERSONAL_DETAILS_LIST. */
function useAccountIDToNameMap(): AccountIDToNameMap {
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    return useMemo(() => buildAccountIDToNameMap(personalDetailsList), [personalDetailsList]);
}

export default useAccountIDToNameMap;
