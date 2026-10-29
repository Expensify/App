import Onyx from 'react-native-onyx';

import type {PersonalDetailsByLogin} from '../../src/components/PersonalDetailsByLoginProvider';
import type {PersonalDetails, PersonalDetailsList, PolicyEmployeeList} from '../../src/types/onyx';

import {createFilteredMemberCountSelector} from '../../src/libs/PolicyUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
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

const regularUser1: PersonalDetails = {
    accountID: regularUser1AccountID,
    login: regularUser1Email,
    displayName: 'User One',
};

const regularUser2: PersonalDetails = {
    accountID: regularUser2AccountID,
    login: regularUser2Email,
    displayName: 'User Two',
};

const expensifyGuide: PersonalDetails = {
    accountID: expensifyGuideAccountID,
    login: expensifyGuideEmail,
    displayName: 'Expensify Guide',
};

const expensifyEmployee: PersonalDetails = {
    accountID: expensifyEmployeeAccountID,
    login: expensifyEmployeeEmail,
    displayName: 'Expensify Employee',
};

const personalDetails: PersonalDetailsList = {
    [regularUser1AccountID]: regularUser1,
    [regularUser2AccountID]: regularUser2,
    [expensifyGuideAccountID]: expensifyGuide,
    [expensifyEmployeeAccountID]: expensifyEmployee,
};

const personalDetailsByLogin: PersonalDetailsByLogin = {
    [regularUser1Email]: regularUser1,
    [regularUser2Email]: regularUser2,
    [expensifyGuideEmail]: expensifyGuide,
    [expensifyEmployeeEmail]: expensifyEmployee,
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

describe('createFilteredMemberCountSelector', () => {
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

        it('should filter out Expensify guides (team.expensify.com)', () => {
            const selector = createFilteredMemberCountSelector(employeeListWithGuide, policyOwner, currentUserLogin, personalDetailsByLogin);
            const count = selector(personalDetails);
            expect(count).toBe(1);
        });

        it('should filter out Expensify employees (expensify.com)', () => {
            const selector = createFilteredMemberCountSelector(employeeListWithExpensifyEmployee, policyOwner, currentUserLogin, personalDetailsByLogin);
            const count = selector(personalDetails);
            expect(count).toBe(1);
        });

        it('should return full count when no Expensify team members are present', () => {
            const selector = createFilteredMemberCountSelector(employeeListAllRegular, policyOwner, currentUserLogin, personalDetailsByLogin);
            const count = selector(personalDetails);
            expect(count).toBe(2);
        });
    });

    describe('when policy owner IS an Expensify team member', () => {
        const policyOwner = 'owner@expensify.com';
        const currentUserLogin = regularUser1Email;

        it('should NOT filter out Expensify team members', () => {
            const selector = createFilteredMemberCountSelector(employeeListWithGuide, policyOwner, currentUserLogin, personalDetailsByLogin);
            const count = selector(personalDetails);
            expect(count).toBe(2);
        });
    });

    describe('when current user IS an Expensify team member', () => {
        const policyOwner = 'owner@company.com';
        const currentUserLogin = expensifyGuideEmail;

        it('should NOT filter out Expensify team members', () => {
            const selector = createFilteredMemberCountSelector(employeeListWithGuide, policyOwner, currentUserLogin, personalDetailsByLogin);
            const count = selector(personalDetails);
            expect(count).toBe(2);
        });
    });

    describe('edge cases', () => {
        it('should return 0 when employeeList is undefined', () => {
            const selector = createFilteredMemberCountSelector(undefined, 'owner@company.com', 'user@company.com', personalDetailsByLogin);
            const count = selector(personalDetails);
            expect(count).toBe(0);
        });

        it('should return 0 when employeeList is empty', () => {
            const selector = createFilteredMemberCountSelector({}, 'owner@company.com', 'user@company.com', personalDetailsByLogin);
            const count = selector(personalDetails);
            expect(count).toBe(0);
        });

        it('should NOT filter when policyOwner is undefined (filtering disabled)', () => {
            const selector = createFilteredMemberCountSelector(employeeListWithGuide, undefined, regularUser1Email, personalDetailsByLogin);
            const count = selector(personalDetails);
            expect(count).toBe(2);
        });

        it('should NOT filter when currentUserLogin is undefined (filtering disabled)', () => {
            const selector = createFilteredMemberCountSelector(employeeListWithGuide, 'owner@company.com', undefined, personalDetailsByLogin);
            const count = selector(personalDetails);
            expect(count).toBe(2);
        });
    });
});
