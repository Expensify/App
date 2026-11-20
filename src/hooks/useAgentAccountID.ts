import {isValidAgentAccountID} from '@libs/AgentAccountIDMapping';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

import useOnyx from './useOnyx';
import {usePersonalDetail} from './usePersonalDetails';

type AgentNavigation = {
    setParams: (params: {accountID: string}) => void;
};

/**
 * Follow the server-assigned ID even when this screen opens after the navigation redirect. Another tab's writes reach
 * this tab key by key, so the mapping can arrive before the real agent's data. The screen keeps the temporary agent until
 * this tab holds the real agent and its server details, unless the temporary agent is already gone.
 */
function useAgentAccountID(accountID: number | string, navigation: AgentNavigation) {
    const [mappedAccountID, metadata] = useOnyx(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {selector: (mapping) => mapping?.[accountID]});
    const realAccountID = isValidAgentAccountID(mappedAccountID) ? mappedAccountID : undefined;
    const [hasRealAgent] = useOnyx(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`, {selector: (agent) => !!agent});
    const [hasRealDetails] = usePersonalDetail(realAccountID, (personalDetail) => !!personalDetail?.login);
    const [hasTemporaryAgent] = useOnyx(`${ONYXKEYS.COLLECTION.AGENT}${accountID}`, {selector: (agent) => !!agent});
    const [hasTemporaryDetails] = usePersonalDetail(Number(accountID), (personalDetail) => !!personalDetail);
    const shouldUseRealAccountID = !!realAccountID && ((!!hasRealAgent && !!hasRealDetails) || (!hasTemporaryAgent && !hasTemporaryDetails));
    const resolvedAccountID = shouldUseRealAccountID ? realAccountID : Number(accountID);

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
