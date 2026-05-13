import type {OnyxCollection} from 'react-native-onyx';
import {shouldShowPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

type StaticPolicyInfo = {
    hasMultipleWorkspaces: boolean;
    hasPaidGroupPolicy: boolean;
};

function staticPolicyInfoSelector(policies: OnyxCollection<Policy>): StaticPolicyInfo {
    let workspaceCount = 0;
    let hasPaidGroupPolicy = false;

    for (const policy of Object.values(policies ?? {})) {
        if (!policy) {
            continue;
        }
        if (!policy.isJoinRequestPending && shouldShowPolicy(policy, false, undefined)) {
            workspaceCount++;
        }
        if (policy.type === CONST.POLICY.TYPE.TEAM || policy.type === CONST.POLICY.TYPE.CORPORATE) {
            hasPaidGroupPolicy = true;
        }
        if (workspaceCount > 1 && hasPaidGroupPolicy) {
            break;
        }
    }

    return {hasMultipleWorkspaces: workspaceCount > 1, hasPaidGroupPolicy};
}

export type {StaticPolicyInfo};
export default staticPolicyInfoSelector;
