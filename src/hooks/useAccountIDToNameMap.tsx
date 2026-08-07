import ONYXKEYS from '@src/ONYXKEYS';

import React, {createContext, useContext, useMemo} from 'react';

import useOnyx from './useOnyx';

/** Mapping from accountID to user name (login or displayName). */
type AccountIDToNameMap = Record<string, string>;

type AccountIDToNameMapContextProviderProps = {
    children: React.ReactNode;
};

const AccountIDToNameMapContext = createContext<AccountIDToNameMap>({});

/**
 * Provides an accountID -> name (login or displayName) map built from PERSONAL_DETAILS_LIST.
 *
 * The map is computed in a `useMemo` keyed on PERSONAL_DETAILS_LIST, so consumers keep the same reference
 * across re-renders that don't change personal details.
 */
function AccountIDToNameMapContextProvider({children}: AccountIDToNameMapContextProviderProps) {
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const accountIDToNameMap = useMemo<AccountIDToNameMap>(() => {
        const map: AccountIDToNameMap = {};

        for (const personalDetails of Object.values(personalDetailsList ?? {})) {
            if (!personalDetails) {
                continue;
            }

            map[personalDetails.accountID] = personalDetails.login ?? personalDetails.displayName ?? '';
        }

        return map;
    }, [personalDetailsList]);

    return <AccountIDToNameMapContext.Provider value={accountIDToNameMap}>{children}</AccountIDToNameMapContext.Provider>;
}

function useAccountIDToNameMap() {
    return useContext(AccountIDToNameMapContext);
}

export {AccountIDToNameMapContextProvider, useAccountIDToNameMap};
