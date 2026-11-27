import {getPolicyRules} from '@libs/actions/Policy/Rules';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useEffect, useState} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/** Wait for the workspace's first fetch before treating a missing rule as absent. */
function useRulesPrefetch(policyID: string | undefined, enabled = true): {areRulesLoading: boolean; haveRulesLoaded: boolean} {
    const [requestedPolicyID, setRequestedPolicyID] = useState<string>();
    const isEnabled = enabled && !!policyID;
    const {isOffline} = useNetwork({
        onReconnect: () => {
            if (!isEnabled) {
                return;
            }
            setRequestedPolicyID(policyID);
            getPolicyRules(policyID);
        },
    });
    const [status, statusResult] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_RULES_FETCH_STATUS}${getNonEmptyStringOnyxID(policyID)}`);
    const {FAILED, LOADED, LOADING} = CONST.RULES.FETCH_STATUS;
    const isStatusLoading = isLoadingOnyxValue(statusResult);
    // A mounted screen tries once after a failure; a new workspace or cleared cache still needs its own fetch.
    const isFetchNeeded = isEnabled && !isOffline && !isStatusLoading && (!status || (status === FAILED && requestedPolicyID !== policyID));

    useEffect(() => {
        if (!isFetchNeeded) {
            return;
        }
        getPolicyRules(policyID);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Each mount tracks whether it already tried this workspace.
        setRequestedPolicyID(policyID);
    }, [isFetchNeeded, policyID]);

    return {areRulesLoading: isEnabled && !isOffline && (isStatusLoading || isFetchNeeded || status === LOADING), haveRulesLoaded: status === LOADED};
}

export default useRulesPrefetch;
