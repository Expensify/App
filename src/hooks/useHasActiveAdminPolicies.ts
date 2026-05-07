import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasActiveAdminPoliciesSelector} from '@src/selectors/Policy';
import type {Policy} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

function useHasActiveAdminPolicies() {
    const login = useCurrentUserPersonalDetails().login ?? '';
    const selector = (policies: OnyxCollection<Policy>) => hasActiveAdminPoliciesSelector(policies, login);
    const [hasActiveAdminPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector});
    return !!hasActiveAdminPolicies;
}

export default useHasActiveAdminPolicies;
