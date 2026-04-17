import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import {createAdminPoliciesSelector, lastWorkspaceNumberSelector, policyNameSelector} from '@src/selectors/Policy';
import type {Policy} from '@src/types/onyx';

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
            [`${ONYXKEYS.COLLECTION.POLICY}1`]: {name: workspaceName} as Policy,
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
            [`${ONYXKEYS.COLLECTION.POLICY}1`]: {name: workspaceName} as Policy,
            [`${ONYXKEYS.COLLECTION.POLICY}2`]: {name: `${workspaceName} 2`} as Policy,
            [`${ONYXKEYS.COLLECTION.POLICY}3`]: {name: `${workspaceName} 5`} as Policy,
            [`${ONYXKEYS.COLLECTION.POLICY}4`]: {name: 'Other Workspace'} as Policy,
        };
        expect(lastWorkspaceNumberSelector(policies, email)).toBe(5);
    });

    it('should handle SMS domain correctly', () => {
        const smsEmail = `+15555555555${CONST.SMS.DOMAIN}`;
        const smsDisplayName = 'My Group Workspace';
        const policies = {
            [`${ONYXKEYS.COLLECTION.POLICY}1`]: {name: smsDisplayName} as Policy,
            [`${ONYXKEYS.COLLECTION.POLICY}2`]: {name: `${smsDisplayName} 3`} as Policy,
        };
        expect(lastWorkspaceNumberSelector(policies, smsEmail)).toBe(3);
    });

    it('should ignore case when matching workspace names', () => {
        const policies = {
            [`${ONYXKEYS.COLLECTION.POLICY}1`]: {name: workspaceName.toLowerCase()} as Policy,
            [`${ONYXKEYS.COLLECTION.POLICY}2`]: {name: `${workspaceName.toUpperCase()} 4`} as Policy,
        };
        expect(lastWorkspaceNumberSelector(policies, email)).toBe(4);
    });
});

describe('policyNameSelector', () => {
    it('should return the policy name', () => {
        expect(policyNameSelector({name: 'My Workspace'} as Policy)).toBe('My Workspace');
    });

    it('should return undefined for undefined policy', () => {
        expect(policyNameSelector(undefined)).toBeUndefined();
    });

    it('should return undefined when policy has no name', () => {
        expect(policyNameSelector({} as Policy)).toBeUndefined();
    });
});

describe('createAdminPoliciesSelector', () => {
    const P = ONYXKEYS.COLLECTION.POLICY;

    const adminPolicy = {id: '1', name: 'Admin WS', role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.TEAM, avatarURL: 'https://img/1', created: '2024-01-01'} as Policy;
    const memberPolicy = {id: '2', name: 'Member WS', role: CONST.POLICY.ROLE.USER, type: CONST.POLICY.TYPE.TEAM} as Policy;
    const personalPolicy = {id: '3', name: 'Personal', role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.PERSONAL} as Policy;
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
            [`${P}4`]: {role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.TEAM} as Policy,
            [`${P}5`]: {id: '5', role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.TEAM} as Policy,
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
