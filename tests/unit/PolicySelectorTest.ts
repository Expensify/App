import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import {
    createAdminPoliciesSelector,
    createCopySettingsEligibleTargetsSelector,
    createWorkspaceListPoliciesSelector,
    isAdminForPolicyByIDSelector,
    lastWorkspaceNumberSelector,
    policyNameSelector,
} from '@src/selectors/Policy';
import type {Policy} from '@src/types/onyx';

// Centralizes the single unsafe cast needed to build partial Policy fixtures for these selector tests.
const buildPolicy = (policy: Partial<Policy>): Policy => policy as Policy;

describe('lastWorkspaceNumberSelector', () => {
    const email = 'jdoe@expensify.com';
    const displayName = 'Expensify';
    const workspaceName = `${displayName} Workspace`;

    beforeAll(() => IntlStore.load(CONST.LOCALES.DEFAULT));

    it('should return undefined when there are no policies', () => {
        expect(lastWorkspaceNumberSelector({}, email)).toBeUndefined();
    });

    it('should return undefined when email is invalid', () => {
        expect(lastWorkspaceNumberSelector({}, 'invalid-email')).toBeUndefined();
    });

    it('should return 0 when there is a matching workspace without a number', () => {
        const policies = {
            [`${ONYXKEYS.COLLECTION.POLICY}1`]: buildPolicy({name: workspaceName}),
        };
        expect(lastWorkspaceNumberSelector(policies, email)).toBe(0);
    });

    it('should return the number when there is a matching workspace with a number', () => {
        const policies = {
            [`${ONYXKEYS.COLLECTION.POLICY}1`]: {name: `${workspaceName} 2`} as Policy,
        };
        expect(lastWorkspaceNumberSelector(policies, email)).toBe(2);
    });

    it('should return the maximum number when there are multiple matching workspaces', () => {
        const policies = {
            [`${ONYXKEYS.COLLECTION.POLICY}1`]: buildPolicy({name: workspaceName}),
            [`${ONYXKEYS.COLLECTION.POLICY}2`]: {name: `${workspaceName} 2`} as Policy,
            [`${ONYXKEYS.COLLECTION.POLICY}3`]: {name: `${workspaceName} 5`} as Policy,
            [`${ONYXKEYS.COLLECTION.POLICY}4`]: buildPolicy({name: 'Other Workspace'}),
        };
        expect(lastWorkspaceNumberSelector(policies, email)).toBe(5);
    });

    it('should handle SMS domain correctly', () => {
        const smsEmail = `+15555555555${CONST.SMS.DOMAIN}`;
        const smsDisplayName = 'My Group Workspace';
        const policies = {
            [`${ONYXKEYS.COLLECTION.POLICY}1`]: buildPolicy({name: smsDisplayName}),
            [`${ONYXKEYS.COLLECTION.POLICY}2`]: {name: `${smsDisplayName} 3`} as Policy,
        };
        expect(lastWorkspaceNumberSelector(policies, smsEmail)).toBe(3);
    });

    it('should ignore case when matching workspace names', () => {
        const policies = {
            [`${ONYXKEYS.COLLECTION.POLICY}1`]: buildPolicy({name: workspaceName.toLowerCase()}),
            [`${ONYXKEYS.COLLECTION.POLICY}2`]: {name: `${workspaceName.toUpperCase()} 4`} as Policy,
        };
        expect(lastWorkspaceNumberSelector(policies, email)).toBe(4);
    });
});

describe('policyNameSelector', () => {
    it('should return the policy name', () => {
        expect(policyNameSelector(buildPolicy({name: 'My Workspace'}))).toBe('My Workspace');
    });

    it('should return undefined for undefined policy', () => {
        expect(policyNameSelector(undefined)).toBeUndefined();
    });

    it('should return undefined when policy has no name', () => {
        expect(policyNameSelector(buildPolicy({}))).toBeUndefined();
    });
});

describe('createAdminPoliciesSelector', () => {
    const P = ONYXKEYS.COLLECTION.POLICY;

    const adminPolicy = buildPolicy({id: '1', name: 'Admin WS', role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.TEAM, avatarURL: 'https://img/1', created: '2024-01-01'});
    const memberPolicy = buildPolicy({id: '2', name: 'Member WS', role: CONST.POLICY.ROLE.USER, type: CONST.POLICY.TYPE.TEAM});
    const personalPolicy = buildPolicy({id: '3', name: 'Personal', role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.PERSONAL});
    const allPolicies = {
        [`${P}1`]: adminPolicy,
        [`${P}2`]: memberPolicy,
        [`${P}3`]: personalPolicy,
    };

    it('should return only admin non-personal policies', () => {
        const result = createAdminPoliciesSelector(undefined)(allPolicies);
        expect(Object.keys(result)).toEqual([`${P}1`]);
        expect(result[`${P}1`]).toEqual({id: '1', name: 'Admin WS', avatarURL: 'https://img/1', created: '2024-01-01'});
    });

    it('should always include the current policy even if not admin', () => {
        const result = createAdminPoliciesSelector('2')({[`${P}2`]: memberPolicy});
        expect(Object.keys(result)).toEqual([`${P}2`]);
    });

    it('should always include the current policy even if personal', () => {
        const result = createAdminPoliciesSelector('3')({[`${P}3`]: personalPolicy});
        expect(Object.keys(result)).toEqual([`${P}3`]);
    });

    it('should return empty object when policies is undefined', () => {
        expect(createAdminPoliciesSelector(undefined)(undefined)).toEqual({});
    });

    it('should skip policies without id or name', () => {
        const policies = {
            [`${P}4`]: buildPolicy({role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.TEAM}),
            [`${P}5`]: buildPolicy({id: '5', role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.TEAM}),
        };
        expect(createAdminPoliciesSelector(undefined)(policies)).toEqual({});
    });

    it('should only pick name, id, avatarURL, and created fields', () => {
        const result = createAdminPoliciesSelector(undefined)({[`${P}1`]: adminPolicy});
        const entry = result[`${P}1`];
        expect(entry).toBeDefined();
        expect(Object.keys(entry ?? {})).toEqual(['id', 'name', 'avatarURL', 'created']);
    });
});

describe('isAdminForPolicyByIDSelector', () => {
    const P = ONYXKEYS.COLLECTION.POLICY;

    it('returns true when policyID is undefined', () => {
        expect(isAdminForPolicyByIDSelector(undefined)(null)).toBe(true);
    });

    it('returns true when policyID is empty string', () => {
        expect(isAdminForPolicyByIDSelector('')({[`${P}p1`]: buildPolicy({role: CONST.POLICY.ROLE.USER})})).toBe(true);
    });

    it('returns false when policies is null and policyID is provided', () => {
        expect(isAdminForPolicyByIDSelector('p1')(null)).toBe(false);
    });

    it('returns false when the policy is not found in the collection', () => {
        const policies = {[`${P}p2`]: buildPolicy({role: CONST.POLICY.ROLE.ADMIN})};
        expect(isAdminForPolicyByIDSelector('p1')(policies)).toBe(false);
    });

    it('returns false when policy exists but role is not admin', () => {
        const policies = {[`${P}p1`]: buildPolicy({role: CONST.POLICY.ROLE.USER})};
        expect(isAdminForPolicyByIDSelector('p1')(policies)).toBe(false);
    });

    it('returns true when policy exists and role is admin', () => {
        const policies = {[`${P}p1`]: buildPolicy({role: CONST.POLICY.ROLE.ADMIN})};
        expect(isAdminForPolicyByIDSelector('p1')(policies)).toBe(true);
    });
});

describe('createCopySettingsEligibleTargetsSelector', () => {
    const P = ONYXKEYS.COLLECTION.POLICY;
    const adminLogin = 'admin@example.com';

    const makePolicy = (overrides: Partial<Policy>): Policy =>
        ({
            id: 'p1',
            name: 'Test WS',
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            ...overrides,
        }) as Policy;

    it('includes non-personal admin policies in adminNonPersonal', () => {
        const policies = {[`${P}p1`]: makePolicy({employeeList: {[adminLogin]: {role: CONST.POLICY.ROLE.ADMIN}}})};
        const result = createCopySettingsEligibleTargetsSelector(adminLogin)(policies);
        expect(result.adminNonPersonal).toContain('p1');
    });

    it('includes corporate admin policies in both adminNonPersonal and corporateOnly', () => {
        const policies = {
            [`${P}p1`]: makePolicy({
                type: CONST.POLICY.TYPE.CORPORATE,
                employeeList: {[adminLogin]: {role: CONST.POLICY.ROLE.ADMIN}},
            }),
        };
        const result = createCopySettingsEligibleTargetsSelector(adminLogin)(policies);
        expect(result.adminNonPersonal).toContain('p1');
        expect(result.corporateOnly).toContain('p1');
    });

    it('does not include corporate policies in corporateOnly when type is TEAM', () => {
        const policies = {
            [`${P}p1`]: makePolicy({
                type: CONST.POLICY.TYPE.TEAM,
                employeeList: {[adminLogin]: {role: CONST.POLICY.ROLE.ADMIN}},
            }),
        };
        const result = createCopySettingsEligibleTargetsSelector(adminLogin)(policies);
        expect(result.adminNonPersonal).toContain('p1');
        expect(result.corporateOnly).not.toContain('p1');
    });

    it('excludes personal policies', () => {
        const policies = {[`${P}p1`]: makePolicy({type: CONST.POLICY.TYPE.PERSONAL})};
        const result = createCopySettingsEligibleTargetsSelector(adminLogin)(policies);
        expect(result.adminNonPersonal).toHaveLength(0);
        expect(result.corporateOnly).toHaveLength(0);
    });

    it('excludes non-admin policies', () => {
        const policies = {[`${P}p1`]: makePolicy({role: CONST.POLICY.ROLE.USER})};
        const result = createCopySettingsEligibleTargetsSelector(adminLogin)(policies);
        expect(result.adminNonPersonal).toHaveLength(0);
    });

    it('excludes pending-delete policies', () => {
        const policies = {
            [`${P}p1`]: makePolicy({
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                employeeList: {[adminLogin]: {role: CONST.POLICY.ROLE.ADMIN}},
            }),
        };
        const result = createCopySettingsEligibleTargetsSelector(adminLogin)(policies);
        expect(result.adminNonPersonal).toHaveLength(0);
    });

    it('returns empty arrays when policies is undefined', () => {
        const result = createCopySettingsEligibleTargetsSelector(adminLogin)(undefined);
        expect(result).toEqual({adminNonPersonal: [], corporateOnly: []});
    });
});

describe('createWorkspaceListPoliciesSelector', () => {
    const P = ONYXKEYS.COLLECTION.POLICY;
    const userLogin = 'user@example.com';

    const makePolicy = (overrides: Partial<Policy>): Policy =>
        ({
            id: 'p1',
            name: 'Test Workspace',
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            ownerAccountID: 1,
            avatarURL: 'https://img/avatar.png',
            pendingAction: undefined,
            errors: undefined,
            ...overrides,
        }) as Policy;

    it('returns an empty array when policies is undefined', () => {
        expect(createWorkspaceListPoliciesSelector(userLogin)(undefined)).toEqual([]);
    });

    it('returns an empty array when no policies pass the shouldShowPolicy filter', () => {
        const policies = {
            [`${P}p1`]: makePolicy({type: CONST.POLICY.TYPE.PERSONAL}),
        };
        expect(createWorkspaceListPoliciesSelector(userLogin)(policies)).toEqual([]);
    });

    it('excludes policies where both role and employeeList entry are absent', () => {
        const policies = {
            [`${P}p1`]: makePolicy({role: undefined, employeeList: {}}),
        };
        expect(createWorkspaceListPoliciesSelector(userLogin)(policies)).toEqual([]);
    });

    it('includes a team policy where the user has an explicit role field', () => {
        const policy = makePolicy({id: 'p1', role: CONST.POLICY.ROLE.ADMIN});
        const result = createWorkspaceListPoliciesSelector(userLogin)({[`${P}p1`]: policy});
        expect(result).toHaveLength(1);
    });

    it('projects only the expected fields onto each result item', () => {
        const policy = makePolicy({
            id: 'p1',
            name: 'My WS',
            type: CONST.POLICY.TYPE.CORPORATE,
            role: CONST.POLICY.ROLE.ADMIN,
            ownerAccountID: 42,
            avatarURL: 'https://img/ws.png',
            pendingAction: undefined,
            errors: undefined,
        });
        const [item] = createWorkspaceListPoliciesSelector(userLogin)({[`${P}p1`]: policy});
        expect(Object.keys(item ?? {})).toEqual([
            'id',
            'name',
            'type',
            'role',
            'ownerAccountID',
            'avatarURL',
            'pendingAction',
            'errors',
            'isPendingDelete',
            'isJoinRequestPending',
            'nonMemberDetails',
        ]);
        expect(item?.id).toBe('p1');
        expect(item?.name).toBe('My WS');
        expect(item?.type).toBe(CONST.POLICY.TYPE.CORPORATE);
        expect(item?.role).toBe(CONST.POLICY.ROLE.ADMIN);
        expect(item?.ownerAccountID).toBe(42);
        expect(item?.avatarURL).toBe('https://img/ws.png');
    });

    it('sets isPendingDelete=true for policies with a DELETE pendingAction', () => {
        const policy = makePolicy({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
        const [item] = createWorkspaceListPoliciesSelector(userLogin)({[`${P}p1`]: policy});
        expect(item?.isPendingDelete).toBe(true);
    });

    it('sets isPendingDelete=false for policies without a DELETE pendingAction', () => {
        const policy = makePolicy({pendingAction: undefined});
        const [item] = createWorkspaceListPoliciesSelector(userLogin)({[`${P}p1`]: policy});
        expect(item?.isPendingDelete).toBe(false);
    });

    it('still includes a pending-delete policy because shouldShowPendingDeletePolicy is always true', () => {
        const policy = makePolicy({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
        const result = createWorkspaceListPoliciesSelector(userLogin)({[`${P}p1`]: policy});
        expect(result).toHaveLength(1);
    });

    it('sets isJoinRequestPending=false and omits nonMemberDetails when isJoinRequestPending is false', () => {
        const policy = makePolicy({isJoinRequestPending: false});
        const [item] = createWorkspaceListPoliciesSelector(userLogin)({[`${P}p1`]: policy});
        expect(item?.isJoinRequestPending).toBe(false);
        expect(item?.nonMemberDetails).toBeUndefined();
    });

    it('sets isJoinRequestPending=false when flag is true but policyDetailsForNonMembers is absent', () => {
        const policy = makePolicy({isJoinRequestPending: true, policyDetailsForNonMembers: undefined});
        const [item] = createWorkspaceListPoliciesSelector(userLogin)({[`${P}p1`]: policy});
        expect(item?.isJoinRequestPending).toBe(false);
        expect(item?.nonMemberDetails).toBeUndefined();
    });

    it('populates nonMemberDetails from the first policyDetailsForNonMembers entry when join request is pending', () => {
        const policy = {
            isJoinRequestPending: true,
            policyDetailsForNonMembers: {
                nonMemberPolicyID123: {
                    name: 'External WS',
                    type: CONST.POLICY.TYPE.CORPORATE,
                    ownerAccountID: 99,
                    ownerEmail: 'owner@example.com',
                    avatar: 'https://img/ext.png',
                },
            },
        } as unknown as Policy;
        const result = createWorkspaceListPoliciesSelector(userLogin)({[`${P}p1`]: policy});
        expect(result).toHaveLength(1);
        expect(result.at(0)?.isJoinRequestPending).toBe(true);
        expect(result.at(0)?.nonMemberDetails).toEqual({
            policyID: 'nonMemberPolicyID123',
            name: 'External WS',
            type: CONST.POLICY.TYPE.CORPORATE,
            ownerAccountID: 99,
            ownerEmail: 'owner@example.com',
            ownerDefaultAvatar: getDefaultAvatarURL({accountID: 99, accountEmail: 'owner@example.com'}),
            avatar: 'https://img/ext.png',
        });
    });

    it('returns multiple policies sorted in insertion order', () => {
        const policies = {
            [`${P}p1`]: makePolicy({id: 'p1', name: 'Alpha'}),
            [`${P}p2`]: makePolicy({id: 'p2', name: 'Beta'}),
            [`${P}p3`]: makePolicy({id: 'p3', name: 'Gamma'}),
        };
        const result = createWorkspaceListPoliciesSelector(userLogin)(policies);
        expect(result.map((p) => p.id)).toEqual(['p1', 'p2', 'p3']);
    });

    it('filters out null values in the policy collection', () => {
        const policies = {
            [`${P}p1`]: null,
            [`${P}p2`]: makePolicy({id: 'p2'}),
        } as unknown as Record<string, Policy>;
        const result = createWorkspaceListPoliciesSelector(userLogin)(policies);
        expect(result).toHaveLength(1);
        expect(result.at(0)?.id).toBe('p2');
    });

    it('handles undefined currentUserLogin by still including policies that have a role field', () => {
        const policy = makePolicy({role: CONST.POLICY.ROLE.ADMIN});
        const result = createWorkspaceListPoliciesSelector(undefined)({[`${P}p1`]: policy});
        expect(result).toHaveLength(1);
    });
});
