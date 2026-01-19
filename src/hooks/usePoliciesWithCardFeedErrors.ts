import {isPolicyAdmin} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import useCardFeedErrors from './useCardFeedErrors';
import useOnyx from './useOnyx';

type PoliciesWithCardFeedErrors = {
    policiesWithCardFeedErrors: Policy[];
    hasCardFeedErrors: boolean;
    isPolicyAdmin: boolean;
};

function usePoliciesWithCardFeedErrors(): PoliciesWithCardFeedErrors {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});

    // If a policy was just deleted from Onyx, then Onyx will pass a null value to the props, and
    // those should be cleaned out before doing any error checking
    const cleanPolicies = Object.values(policies ?? {}).filter((policy) => policy?.id);

    const {shouldShowRbrForWorkspaceAccountID} = useCardFeedErrors();
    let hasCardFeedErrors = false;
    const policiesWithCardFeedErrors: Policy[] = [];
    for (const [workspaceAccountID, hasErrors] of Object.entries(shouldShowRbrForWorkspaceAccountID)) {
        if (!hasErrors) {
            continue;
        }
        hasCardFeedErrors = true;

        const policyWithCardFeedErrors = cleanPolicies.find((policy) => policy?.workspaceAccountID === Number(workspaceAccountID));
        if (!policyWithCardFeedErrors) {
            continue;
        }

        policiesWithCardFeedErrors.push(policyWithCardFeedErrors);
    }

    return {
        policiesWithCardFeedErrors,
        hasCardFeedErrors,
        isPolicyAdmin: policiesWithCardFeedErrors.some((policy) => isPolicyAdmin(policy, session?.email)),
    };
}

export default usePoliciesWithCardFeedErrors;
