import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {OnyxCollection} from 'react-native-onyx';

import {activeAdminPoliciesSelector} from '@selectors/Policy';
import {useCallback} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

function useActiveAdminPolicies() {
    const {login} = useCurrentUserPersonalDetails();
    const selector = useCallback((policies: OnyxCollection<Policy>) => activeAdminPoliciesSelector(policies, login ?? ''), [login]);
    const [activeAdminPolicies = getEmptyArray<Policy>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector}, [login]);

    return activeAdminPolicies;
}

export default useActiveAdminPolicies;
