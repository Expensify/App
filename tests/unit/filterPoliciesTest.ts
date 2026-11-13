import filterPolicies from '@libs/filterPolicies';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';

const ADMIN_POLICY: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), id: '1', role: CONST.POLICY.ROLE.ADMIN};
const MEMBER_POLICY: Policy = {...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM), id: '2', role: CONST.POLICY.ROLE.USER};
const POLICIES: OnyxCollection<Policy> = {
    [`${ONYXKEYS.COLLECTION.POLICY}1`]: ADMIN_POLICY,
    [`${ONYXKEYS.COLLECTION.POLICY}2`]: MEMBER_POLICY,
};

describe('filterPolicies', () => {
    it('keeps only the workspaces that pass the predicate', () => {
        // Given an administered workspace and one the user is a regular member of
        // When they are filtered to the administered ones
        const result = filterPolicies(POLICIES, (policy) => policy.role === CONST.POLICY.ROLE.ADMIN);

        // Then only the administered workspace is kept, under its collection key
        expect(result).toEqual({[`${ONYXKEYS.COLLECTION.POLICY}1`]: ADMIN_POLICY});
    });

    it('returns every workspace when there is no predicate', () => {
        // Given workspaces and no predicate, as every list outside Compliance passes
        // When they are filtered
        const result = filterPolicies(POLICIES);

        // Then the collection comes back unchanged
        expect(result).toBe(POLICIES);
    });
});
