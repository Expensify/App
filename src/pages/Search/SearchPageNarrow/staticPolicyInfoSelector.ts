import type {OnyxCollection} from 'react-native-onyx';
import {isGroupPolicy, shouldShowPolicy} from '@libs/PolicyUtils';
import type {Policy} from '@src/types/onyx';

type StaticPolicyInfo = {
    hasMultipleWorkspaces: boolean;
    // True for any group workspace (Collect, Control, or Submit). Gates the "Submit" search tab,
    // which Submit workspaces also need — matches `getSuggestedSearchesVisibility` in SearchUIUtils.
    hasGroupPolicy: boolean;
};

function staticPolicyInfoSelector(policies: OnyxCollection<Policy>): StaticPolicyInfo {
    let workspaceCount = 0;
    let hasGroupPolicy = false;

    for (const policy of Object.values(policies ?? {})) {
        if (!policy) {
            continue;
        }
        if (!policy.isJoinRequestPending && shouldShowPolicy(policy, false, undefined)) {
            workspaceCount++;
        }
        if (isGroupPolicy(policy)) {
            hasGroupPolicy = true;
        }
        if (workspaceCount > 1 && hasGroupPolicy) {
            break;
        }
    }

    return {hasMultipleWorkspaces: workspaceCount > 1, hasGroupPolicy};
}

export default staticPolicyInfoSelector;
