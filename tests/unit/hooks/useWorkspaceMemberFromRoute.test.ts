import {renderHook} from '@testing-library/react-native';

import useWorkspaceMemberFromRoute from '@hooks/useWorkspaceMemberFromRoute';

import {generateAccountID} from '@libs/UserUtils';

import CONST from '@src/CONST';
import type {PersonalDetailsList, Policy} from '@src/types/onyx';

import createMock from '../../utils/createMock';
import {buildPersonalDetails} from '../../utils/TestHelper';

let mockPersonalDetails: PersonalDetailsList = {};

jest.mock('@hooks/usePersonalDetailByLogin', () => ({
    __esModule: true,
    default: (login: string) => Object.values(mockPersonalDetails).find((details) => details?.login === login),
}));

describe('useWorkspaceMemberFromRoute', () => {
    const secondaryLogin = 'secondary@example.com';
    const primaryLogin = 'primary@example.com';
    const accountID = 7777;
    const routeAccountID = generateAccountID(secondaryLogin);
    const policy = createMock<Policy>({
        id: 'workspace1',
        primaryLoginsInvited: {[secondaryLogin]: primaryLogin},
        employeeList: {[primaryLogin]: {email: primaryLogin, role: CONST.POLICY.ROLE.USER}},
    });

    beforeEach(() => {
        mockPersonalDetails = {[accountID]: buildPersonalDetails(primaryLogin, accountID, 'Primary')};
    });

    it('retains only established identity when an informational mapping disappears', () => {
        // Given the optimistic route has authoritatively resolved a real account and primary employee
        const {result, rerender} = renderHook(({currentPolicy}) => useWorkspaceMemberFromRoute(currentPolicy, mockPersonalDetails, routeAccountID), {
            initialProps: {currentPolicy: policy},
        });
        expect(result.current.accountID).toBe(accountID);

        // When the message mapping is dismissed while the current employee remains
        rerender({currentPolicy: {...policy, primaryLoginsInvited: undefined}});

        // Then lookup retains the primary identity rather than returning an empty or optimistic login
        expect(result.current.memberLogin).toBe(primaryLogin);
        expect(result.current.accountID).toBe(accountID);
    });

    it.each(['member', 'workspace'])('forgets retained identity when the %s route changes', (routeChange) => {
        // Given an established identity scoped to one workspace and optimistic member route
        const {result, rerender} = renderHook(({currentPolicy, routeID}) => useWorkspaceMemberFromRoute(currentPolicy, mockPersonalDetails, routeID), {
            initialProps: {currentPolicy: policy, routeID: routeAccountID},
        });
        const unmappedPolicy = {...policy, primaryLoginsInvited: undefined};

        // When this hook instance is reused for another member or workspace without a matching mapping
        rerender({
            currentPolicy: routeChange === 'workspace' ? {...unmappedPolicy, id: 'workspace2'} : unmappedPolicy,
            routeID: routeChange === 'member' ? generateAccountID('unknown@example.com') : routeAccountID,
        });

        // Then the previous member cannot leak into the new route, even if the original route is later reopened
        expect(result.current.memberLogin).toBe('');
        rerender({currentPolicy: unmappedPolicy, routeID: routeAccountID});
        expect(result.current.memberLogin).toBe('');
    });

    it('does not retain deleted membership or accept a cleanup-only employee entry', () => {
        // Given an established primary identity
        const {result, rerender} = renderHook(({currentPolicy}) => useWorkspaceMemberFromRoute(currentPolicy, mockPersonalDetails, routeAccountID), {
            initialProps: {currentPolicy: policy},
        });

        // When the current employee is replaced with only invitation cleanup data
        rerender({currentPolicy: {...policy, primaryLoginsInvited: undefined, employeeList: {[primaryLogin]: {pendingAction: null}}}});

        // Then identity retention does not manufacture a valid member or revive the removed employee's role
        expect(result.current.memberLogin).toBe('');
        expect(result.current.memberPersonalDetails).toBeUndefined();
    });

    it('follows a known real account through a later login change without guessing another employee', () => {
        // Given an optimistic route that has resolved a real account
        const {result, rerender} = renderHook(({currentPolicy}) => useWorkspaceMemberFromRoute(currentPolicy, mockPersonalDetails, routeAccountID), {
            initialProps: {currentPolicy: policy},
        });
        const newLogin = 'newprimary@example.com';

        // When current personal details associate that same real account with a new primary login
        mockPersonalDetails = {[accountID]: buildPersonalDetails(newLogin, accountID, 'Primary')};
        rerender({currentPolicy: {...policy, primaryLoginsInvited: undefined, employeeList: {[newLogin]: {email: newLogin, role: CONST.POLICY.ROLE.USER}}}});

        // Then the stable account ID, not an unrelated new employee, establishes the new login
        expect(result.current.memberLogin).toBe(newLogin);
        expect(result.current.accountID).toBe(accountID);
    });

    it('does not infer identity for a route that has never resolved', () => {
        // Given a real primary member but no relationship between that member and the route's secondary login
        const unmappedPolicy = {...policy, primaryLoginsInvited: undefined};

        // When the route is opened without any prior successful resolution
        const {result} = renderHook(() => useWorkspaceMemberFromRoute(unmappedPolicy, mockPersonalDetails, routeAccountID));

        // Then merely having a primary employee is not enough to guess the invited identity
        expect(result.current.memberLogin).toBe('');
        expect(result.current.accountID).toBe(routeAccountID);
    });
});
