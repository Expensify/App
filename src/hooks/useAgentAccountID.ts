import {isValidAgentAccountID} from '@libs/AgentAccountIDMapping';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

import useOnyx from './useOnyx';

type AgentNavigation = {
    setParams: (params: {accountID: string}) => void;
};

/** Follow the server-assigned ID even when this screen opens after the navigation redirect. */
function useAgentAccountID(accountID: number | string, navigation: AgentNavigation) {
    const [mappedAccountID, metadata] = useOnyx(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {selector: (mapping) => mapping?.[accountID]});
    const resolvedAccountID = isValidAgentAccountID(mappedAccountID) ? mappedAccountID : Number(accountID);

    useEffect(() => {
        if (resolvedAccountID === Number(accountID)) {
            return;
        }
        // Dynamic routes parse path params as strings. Keep that form so Back/Save matches the existing parent.
        navigation.setParams({accountID: String(resolvedAccountID)});
    }, [accountID, navigation, resolvedAccountID]);

    return [resolvedAccountID, metadata] as const;
}

export default useAgentAccountID;
