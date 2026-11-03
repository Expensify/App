import ONYXKEYS from '@src/ONYXKEYS';
import {ownerPoliciesSelector} from '@src/selectors/Policy';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/** Whether the current user already owns at least one paid workspace. */
function useHasOwnedPaidPolicy() {
    const {accountID} = useCurrentUserPersonalDetails();
    const selector = (policies: OnyxCollection<Policy>) => ownerPoliciesSelector(policies, accountID).length > 0;
    const [hasOwnedPaidPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector});
    return !!hasOwnedPaidPolicy;
}

export default useHasOwnedPaidPolicy;
