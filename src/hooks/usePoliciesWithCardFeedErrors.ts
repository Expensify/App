import {useMemo} from 'react';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import useCardFeedErrors from './useCardFeedErrors';
import useOnyx from './useOnyx';

function usePoliciesWithCardFeedErrors() {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});

    // If a policy was just deleted from Onyx, then Onyx will pass a null value to the props, and
    // those should be cleaned out before doing any error checking
    const cleanPolicies = Object.values(policies ?? {}).filter((policy) => policy?.id);

    const {shouldShowRbrForWorkspaceAccountID} = useCardFeedErrors();
    const policiesWithCardFeedErrors = useMemo(() => {
        const p: Policy[] = [];
        for (const [workspaceAccountID, hasErrors] of Object.entries(shouldShowRbrForWorkspaceAccountID)) {
            if (!hasErrors) {
                continue;
            }

            const policyWithCardFeedErrors = cleanPolicies.find((policy) => policy?.workspaceAccountID === Number(workspaceAccountID));
            if (!policyWithCardFeedErrors) {
                continue;
            }

            p.push(policyWithCardFeedErrors);
        }

        return p;
    }, [cleanPolicies, shouldShowRbrForWorkspaceAccountID]);

    return {
        policiesWithCardFeedErrors,
        isPolicyAdmin: policiesWithCardFeedErrors.some((policy) => isPolicyAdmin(policy, session?.email)),
    };
}

export default usePoliciesWithCardFeedErrors;
