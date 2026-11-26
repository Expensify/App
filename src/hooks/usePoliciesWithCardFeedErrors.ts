import {isPolicyAdmin, shouldCheckPolicyForErrors} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import useCardFeedErrors from './useCardFeedErrors';
import useOnyx from './useOnyx';

function usePoliciesWithCardFeedErrors() {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const cleanPolicies = Object.values(policies ?? {}).filter(shouldCheckPolicyForErrors);

    const {shouldShowRbrForWorkspaceAccountID} = useCardFeedErrors();
    const policiesWithCardFeedErrors: Policy[] = [];
    for (const [workspaceAccountID, hasErrors] of Object.entries(shouldShowRbrForWorkspaceAccountID)) {
        if (!hasErrors) {
            continue;
        }

        const policyWithCardFeedErrors = cleanPolicies.find((policy) => policy?.policyAccountID === Number(workspaceAccountID));
        if (!policyWithCardFeedErrors) {
            continue;
        }

        policiesWithCardFeedErrors.push(policyWithCardFeedErrors);
    }

    return {
        cleanPolicies,
        policiesWithCardFeedErrors,
        isPolicyAdmin: policiesWithCardFeedErrors.some((policy) => isPolicyAdmin(policy, session?.email)),
    };
}

export default usePoliciesWithCardFeedErrors;
