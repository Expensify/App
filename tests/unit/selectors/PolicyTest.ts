import {activeAdminPoliciesSelector, hasMultipleOutputCurrenciesSelector} from '@selectors/Policy';
import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../../utils/collections/policies';

describe('hasMultipleOutputCurrenciesSelector', () => {
    it('returns false when paid group policies have the same output currency', () => {
        const policies: OnyxCollection<Policy> = {
            policy1: {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), outputCurrency: 'USD'},
            policy2: {...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE), outputCurrency: 'USD'},
        };

        expect(hasMultipleOutputCurrenciesSelector(policies)).toBe(false);
    });

    it('returns true when paid group policies have different output currencies', () => {
        const policies: OnyxCollection<Policy> = {
            policy1: {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), outputCurrency: 'USD'},
            policy2: {...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE), outputCurrency: 'EUR'},
        };

        expect(hasMultipleOutputCurrenciesSelector(policies)).toBe(true);
    });

    it('returns false when policies object is empty', () => {
        const policies: OnyxCollection<Policy> = {};

        expect(hasMultipleOutputCurrenciesSelector(policies)).toBe(false);
    });

    it('returns false when there are only personal policies', () => {
        const policies: OnyxCollection<Policy> = {
            policy1: {...createRandomPolicy(1, CONST.POLICY.TYPE.PERSONAL), outputCurrency: 'USD'},
            policy2: {...createRandomPolicy(2, CONST.POLICY.TYPE.PERSONAL), outputCurrency: 'EUR'},
        };

        expect(hasMultipleOutputCurrenciesSelector(policies)).toBe(false);
    });

    it('returns false when there is only a single paid group policy', () => {
        const policies: OnyxCollection<Policy> = {
            policy1: {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), outputCurrency: 'USD'},
        };

        expect(hasMultipleOutputCurrenciesSelector(policies)).toBe(false);
    });
});

const TEST_LOGIN = 'admin@expensify.com';

function buildSelectorPolicy(id: number, overrides: Partial<Policy>): Policy {
    return {
        ...createRandomPolicy(id, CONST.POLICY.TYPE.TEAM),
        pendingAction: undefined,
        ...overrides,
    };
}

describe('activeAdminPoliciesSelector', () => {
    it('returns only policies where the user is admin', () => {
        const policies: OnyxCollection<Policy> = {
            policy1: buildSelectorPolicy(1, {name: 'Admin Policy', role: CONST.POLICY.ROLE.ADMIN}),
            policy2: buildSelectorPolicy(2, {name: 'User Policy', role: CONST.POLICY.ROLE.USER}),
        };

        const result = activeAdminPoliciesSelector(policies, TEST_LOGIN);
        expect(result).toHaveLength(1);
        expect(result.at(0)?.name).toBe('Admin Policy');
    });

    it('excludes personal policies', () => {
        const policies: OnyxCollection<Policy> = {
            policy1: buildSelectorPolicy(1, {name: 'Personal Policy', role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.PERSONAL}),
            policy2: buildSelectorPolicy(2, {name: 'Team Policy', role: CONST.POLICY.ROLE.ADMIN}),
        };

        const result = activeAdminPoliciesSelector(policies, TEST_LOGIN);
        expect(result).toHaveLength(1);
        expect(result.at(0)?.name).toBe('Team Policy');
    });

    it('excludes policies with pendingAction DELETE', () => {
        const policies: OnyxCollection<Policy> = {
            policy1: buildSelectorPolicy(1, {name: 'Active Policy', role: CONST.POLICY.ROLE.ADMIN}),
            policy2: buildSelectorPolicy(2, {name: 'Deleted Policy', role: CONST.POLICY.ROLE.ADMIN, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
        };

        const result = activeAdminPoliciesSelector(policies, TEST_LOGIN);
        expect(result).toHaveLength(1);
        expect(result.at(0)?.name).toBe('Active Policy');
    });

    it('returns empty array for empty collection', () => {
        expect(activeAdminPoliciesSelector({}, TEST_LOGIN)).toEqual([]);
    });

    it('excludes policies where user has no role', () => {
        const policies: OnyxCollection<Policy> = {
            policy1: buildSelectorPolicy(1, {name: 'No Role Policy', role: undefined}),
        };

        const result = activeAdminPoliciesSelector(policies, TEST_LOGIN);
        expect(result).toHaveLength(0);
    });
});
