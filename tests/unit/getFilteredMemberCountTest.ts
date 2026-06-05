import Onyx from 'react-native-onyx';
import {getFilteredMemberCount} from '../../src/libs/PolicyUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import type {PersonalDetailsList, PolicyEmployeeList} from '../../src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const regularUser1AccountID = 1;
const regularUser2AccountID = 2;
const expensifyGuideAccountID = 3;
const expensifyEmployeeAccountID = 4;

const regularUser1Email = 'user1@company.com';
const regularUser2Email = 'user2@company.com';
const expensifyGuideEmail = 'guide@team.expensify.com';
const expensifyEmployeeEmail = 'employee@expensify.com';

const personalDetails: PersonalDetailsList = {
    [regularUser1AccountID]: {
        accountID: regularUser1AccountID,
        login: regularUser1Email,
        displayName: 'User One',
    },
    [regularUser2AccountID]: {
        accountID: regularUser2AccountID,
        login: regularUser2Email,
        displayName: 'User Two',
    },
    [expensifyGuideAccountID]: {
        accountID: expensifyGuideAccountID,
        login: expensifyGuideEmail,
        displayName: 'Expensify Guide',
    },
    [expensifyEmployeeAccountID]: {
        accountID: expensifyEmployeeAccountID,
        login: expensifyEmployeeEmail,
        displayName: 'Expensify Employee',
    },
};

const employeeListWithGuide: PolicyEmployeeList = {
    [regularUser1Email]: {email: regularUser1Email, role: 'user'},
    [expensifyGuideEmail]: {email: expensifyGuideEmail, role: 'user'},
};

const employeeListWithExpensifyEmployee: PolicyEmployeeList = {
    [regularUser1Email]: {email: regularUser1Email, role: 'user'},
    [expensifyEmployeeEmail]: {email: expensifyEmployeeEmail, role: 'user'},
};

const employeeListAllRegular: PolicyEmployeeList = {
    [regularUser1Email]: {email: regularUser1Email, role: 'user'},
    [regularUser2Email]: {email: regularUser2Email, role: 'user'},
};

describe('getFilteredMemberCount', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => Onyx.clear());

    describe('when policy owner and current user are NOT Expensify team members', () => {
        const policyOwner = 'owner@company.com';
        const currentUserLogin = regularUser1Email;

        beforeEach(() => Onyx.multiSet({[ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails}).then(waitForBatchedUpdates));

        it('should filter out Expensify guides (team.expensify.com)', () => {
            const count = getFilteredMemberCount(employeeListWithGuide, personalDetails, policyOwner, currentUserLogin);
            expect(count).toBe(1);
        });

        it('should filter out Expensify employees (expensify.com)', () => {
            const count = getFilteredMemberCount(employeeListWithExpensifyEmployee, personalDetails, policyOwner, currentUserLogin);
            expect(count).toBe(1);
        });

        it('should return full count when no Expensify team members are present', () => {
            const count = getFilteredMemberCount(employeeListAllRegular, personalDetails, policyOwner, currentUserLogin);
            expect(count).toBe(2);
        });
    });

    describe('when policy owner IS an Expensify team member', () => {
        const policyOwner = 'owner@expensify.com';
        const currentUserLogin = regularUser1Email;

        beforeEach(() => Onyx.multiSet({[ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails}).then(waitForBatchedUpdates));

        it('should NOT filter out Expensify team members', () => {
            const count = getFilteredMemberCount(employeeListWithGuide, personalDetails, policyOwner, currentUserLogin);
            expect(count).toBe(2);
        });
    });

    describe('when current user IS an Expensify team member', () => {
        const policyOwner = 'owner@company.com';
        const currentUserLogin = expensifyGuideEmail;

        beforeEach(() => Onyx.multiSet({[ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails}).then(waitForBatchedUpdates));

        it('should NOT filter out Expensify team members', () => {
            const count = getFilteredMemberCount(employeeListWithGuide, personalDetails, policyOwner, currentUserLogin);
            expect(count).toBe(2);
        });
    });

    describe('edge cases', () => {
        beforeEach(() => Onyx.multiSet({[ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails}).then(waitForBatchedUpdates));

        it('should return 0 when employeeList is undefined', () => {
            const count = getFilteredMemberCount(undefined, personalDetails, 'owner@company.com', 'user@company.com');
            expect(count).toBe(0);
        });

        it('should return 0 when employeeList is empty', () => {
            const count = getFilteredMemberCount({}, personalDetails, 'owner@company.com', 'user@company.com');
            expect(count).toBe(0);
        });

        it('should NOT filter when policyOwner is undefined (filtering disabled)', () => {
            const count = getFilteredMemberCount(employeeListWithGuide, personalDetails, undefined, regularUser1Email);
            expect(count).toBe(2);
        });

        it('should NOT filter when currentUserLogin is undefined (filtering disabled)', () => {
            const count = getFilteredMemberCount(employeeListWithGuide, personalDetails, 'owner@company.com', undefined);
            expect(count).toBe(2);
        });
    });
});
