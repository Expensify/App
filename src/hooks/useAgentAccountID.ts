import {getAgentAccountIDState} from '@libs/AgentUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

import useOnyx from './useOnyx';
import {usePersonalDetail} from './usePersonalDetails';

type AgentNavigation = {
    setParams: (params: {accountID: string}) => void;
};

/**
 * Follow the server-assigned ID even when this screen opens after the navigation redirect. Another tab's writes reach
 * this tab key by key, in any order, so the screen applies the rule in getAgentAccountIDState: it keeps the temporary
 * agent until this tab holds the real agent and its server details, reads personal details with the real ID as soon as
 * this tab holds them, and reports while the agent is settling so the screen doesn't save or delete from an incomplete
 * copy. The temporary record's fallback name and avatar cover the time its personal details are missing.
 */
function useAgentAccountID(routeAccountID: number | string, navigation: AgentNavigation) {
    const accountID = Number(routeAccountID);
    const [mappedAccountID, metadata] = useOnyx(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {selector: (mapping) => mapping?.[accountID]});
    const [isMappedRealAccountID] = useOnyx(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {
        selector: (mapping) => Object.values(mapping ?? {}).some((realAccountID) => realAccountID === accountID),
    });
    const realAccountID = typeof mappedAccountID === 'number' ? mappedAccountID : undefined;
    const [hasRealAgent] = useOnyx(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`, {selector: (agent) => !!agent});
    const [hasRealDetailsWithLogin] = usePersonalDetail(realAccountID, (personalDetail) => !!personalDetail?.login);
    const [hasAgent] = useOnyx(`${ONYXKEYS.COLLECTION.AGENT}${accountID}`, {selector: (agent) => !!agent});
    const [fallbackDisplayName] = useOnyx(`${ONYXKEYS.COLLECTION.AGENT}${accountID}`, {selector: (agent) => agent?.fallbackDisplayName});
    const [fallbackAvatar] = useOnyx(`${ONYXKEYS.COLLECTION.AGENT}${accountID}`, {selector: (agent) => agent?.fallbackAvatar});
    const [hasDetails] = usePersonalDetail(accountID, (personalDetail) => !!personalDetail);
    const [hasDetailsWithLogin] = usePersonalDetail(accountID, (personalDetail) => !!personalDetail?.login);

    const state = getAgentAccountIDState({
        accountID,
        mappedAccountID,
        isMappedRealAccountID: !!isMappedRealAccountID,
        hasAgent: !!hasAgent,
        hasDetails: !!hasDetails,
        hasDetailsWithLogin: !!hasDetailsWithLogin,
        isTemporaryRecord: fallbackDisplayName !== undefined,
        hasRealAgent: !!hasRealAgent,
        hasRealDetailsWithLogin: !!hasRealDetailsWithLogin,
    });
    const resolvedAccountID = state.accountID;

    useEffect(() => {
        if (resolvedAccountID === accountID) {
            return;
        }
        // Dynamic routes parse path params as strings. Keep that form so Back/Save matches the existing parent.
        navigation.setParams({accountID: String(resolvedAccountID)});
    }, [accountID, navigation, resolvedAccountID]);

    return {...state, metadata, fallbackDisplayName, fallbackAvatar};
}

export default useAgentAccountID;
