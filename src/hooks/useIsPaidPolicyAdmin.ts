import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/**
 * Custom hook to check if the current user is an admin of any paid policy
 */
function useIsPaidPolicyAdmin() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const isUserPaidPolicyAdminSelector = useCallback(
        (policies: OnyxCollection<Policy>) => {
            return Object.values(policies ?? {}).some((policy) => isPaidGroupPolicy(policy) && isPolicyAdmin(policy, currentUserPersonalDetails.login));
        },
        [currentUserPersonalDetails?.login],
    );

    const [isCurrentUserPolicyAdmin = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: true,
        selector: isUserPaidPolicyAdminSelector,
    });

    return isCurrentUserPolicyAdmin;
}

export default useIsPaidPolicyAdmin;
