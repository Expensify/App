import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

import useOnyx from './useOnyx';

type AgentNavigation = {
    setParams: (params: {accountID: number}) => void;
};

/** Follow the server-assigned ID even when this screen opens after the navigation redirect. */
function useAgentAccountID(accountID: number, navigation: AgentNavigation) {
    const [mappedAccountID, metadata] = useOnyx(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {selector: (mapping) => mapping?.[accountID]});
    const resolvedAccountID = mappedAccountID && Number.isSafeInteger(mappedAccountID) && mappedAccountID > 0 ? mappedAccountID : accountID;

    useEffect(() => {
        if (resolvedAccountID === accountID) {
            return;
        }
        // Keep this route aligned with child screens so their Back/Save fallback finds the existing parent.
        navigation.setParams({accountID: resolvedAccountID});
    }, [accountID, navigation, resolvedAccountID]);

    return [resolvedAccountID, metadata] as const;
}

export default useAgentAccountID;
