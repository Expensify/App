import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import {lastWorkspaceNumberSelector} from '@src/selectors/Policy';
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
