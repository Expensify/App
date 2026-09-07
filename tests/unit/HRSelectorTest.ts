import CONST from '@src/CONST';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';
import ONYXKEYS from '@src/ONYXKEYS';
import reusableMergeHRPoliciesSelector, {reusableMergeHRProviderSlugsSelector} from '@src/selectors/HR';
import type Policy from '@src/types/onyx/Policy';

import type {OnyxCollection} from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';

function makePolicy(id: number, integration: MergeHRProviderSlug = 'workday', role: Policy['role'] = CONST.POLICY.ROLE.ADMIN) {
    return {
        ...createRandomPolicy(id),
        role,
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
                config: {
                    integration,
                    approvalMode: null,
                    finalApprover: null,
                    groups: null,
                },
                lastSync: {
                    isAuthenticationError: true,
                    isSuccessful: false,
                    source: 'NEWEXPENSIFY',
                    syncStatus: CONST.MERGE.SYNC_STATUS.FAILED,
                },
            },
        },
    } satisfies Policy;
}

describe('reusableMergeHRPoliciesSelector', () => {
    it('includes only other workspaces with an admin role and the exact provider', () => {
        const eligible = makePolicy(2);
        const otherProvider = makePolicy(3, 'bamboohr');
        const policies = {
            [`${ONYXKEYS.COLLECTION.POLICY}1`]: makePolicy(1),
            [`${ONYXKEYS.COLLECTION.POLICY}2`]: eligible,
            [`${ONYXKEYS.COLLECTION.POLICY}3`]: otherProvider,
            [`${ONYXKEYS.COLLECTION.POLICY}4`]: makePolicy(4, 'workday', CONST.POLICY.ROLE.USER),
            [`${ONYXKEYS.COLLECTION.POLICY}5`]: {...makePolicy(5), connections: {}},
            [`${ONYXKEYS.COLLECTION.POLICY}6`]: undefined,
        } satisfies OnyxCollection<Policy>;

        expect(reusableMergeHRPoliciesSelector(policies, '1', 'workday')).toEqual([eligible]);
        expect(reusableMergeHRPoliciesSelector(policies, '1', 'bamboohr')).toEqual([otherProvider]);
    });

    it.each([undefined, '', 'unknown-provider', 'Workday', 'constructor', '__proto__'])('does not match an invalid provider %s', (providerSlug) => {
        expect(reusableMergeHRPoliciesSelector({[`${ONYXKEYS.COLLECTION.POLICY}2`]: makePolicy(2)}, '1', providerSlug)).toEqual([]);
    });

    it('handles absent collections and missing integration config', () => {
        expect(reusableMergeHRPoliciesSelector(undefined, '1', 'workday')).toEqual([]);
        const policy = createMock<Policy>({
            id: '2',
            role: CONST.POLICY.ROLE.ADMIN,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {}},
        });
        expect(reusableMergeHRPoliciesSelector({[`${ONYXKEYS.COLLECTION.POLICY}2`]: policy}, '1', 'workday')).toEqual([]);
    });

    it('does not apply accounting sync-health or completed-setup requirements', () => {
        const policy = makePolicy(2);
        expect(reusableMergeHRPoliciesSelector({[`${ONYXKEYS.COLLECTION.POLICY}2`]: policy}, '1', 'workday')).toEqual([policy]);
    });

    it.each([{archivedDate: '2026-09-07 10:00:00'}, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}])('excludes inactive workspaces (%j)', (inactiveState) => {
        const activePolicy = makePolicy(2);
        const policies = {
            [`${ONYXKEYS.COLLECTION.POLICY}2`]: activePolicy,
            [`${ONYXKEYS.COLLECTION.POLICY}3`]: {...makePolicy(3), ...inactiveState},
        };

        expect(reusableMergeHRPoliciesSelector(policies, '1', 'workday')).toEqual([activePolicy]);
        expect(reusableMergeHRProviderSlugsSelector(policies, '1')).toEqual(['workday']);
        expect(reusableMergeHRProviderSlugsSelector({[`${ONYXKEYS.COLLECTION.POLICY}3`]: {...makePolicy(3), ...inactiveState}}, '1')).toEqual([]);
    });
});

describe('reusableMergeHRProviderSlugsSelector', () => {
    it('returns only distinct supported provider slugs from eligible admin workspaces', () => {
        const policies = {
            [`${ONYXKEYS.COLLECTION.POLICY}1`]: makePolicy(1, 'breathe'),
            [`${ONYXKEYS.COLLECTION.POLICY}2`]: makePolicy(2),
            [`${ONYXKEYS.COLLECTION.POLICY}3`]: makePolicy(3),
            [`${ONYXKEYS.COLLECTION.POLICY}4`]: makePolicy(4, 'bamboohr'),
            [`${ONYXKEYS.COLLECTION.POLICY}5`]: makePolicy(5, 'breathe', CONST.POLICY.ROLE.USER),
            [`${ONYXKEYS.COLLECTION.POLICY}6`]: {...makePolicy(6), connections: {}},
            [`${ONYXKEYS.COLLECTION.POLICY}7`]: undefined,
        };

        expect(reusableMergeHRProviderSlugsSelector(policies, '1')).toEqual(['bamboohr', 'workday']);
        expect(reusableMergeHRProviderSlugsSelector(undefined, '1')).toEqual([]);
    });

    it('does not change its result when workspace details or the order of duplicate providers change', () => {
        const policy = makePolicy(2);
        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}2`]: policy, [`${ONYXKEYS.COLLECTION.POLICY}3`]: makePolicy(3, 'bamboohr')};
        const updatedPolicies = {
            [`${ONYXKEYS.COLLECTION.POLICY}4`]: makePolicy(4, 'bamboohr'),
            ...policies,
            [`${ONYXKEYS.COLLECTION.POLICY}2`]: {...policy, name: 'Renamed workspace', employeeList: {}},
        };

        expect(reusableMergeHRProviderSlugsSelector(updatedPolicies, '1')).toEqual(reusableMergeHRProviderSlugsSelector(policies, '1'));
    });
});
