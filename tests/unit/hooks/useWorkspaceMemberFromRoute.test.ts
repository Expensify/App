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

    const pendingPolicy = createMock<Policy>({
        id: policy.id,
        employeeList: {[secondaryLogin]: {email: secondaryLogin, role: CONST.POLICY.ROLE.USER, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}},
    });
    const setOptimisticDetails = () => {
        mockPersonalDetails = {[routeAccountID]: {...buildPersonalDetails(secondaryLogin, routeAccountID, 'Secondary'), isOptimisticPersonalDetail: true}};
    };

    it('remembers an optimistic invite through cleanup until its explicit primary mapping arrives', () => {
        // Given a page opened offline before the invite has a real account ID
        setOptimisticDetails();
        const {result, rerender} = renderHook(({currentPolicy}) => useWorkspaceMemberFromRoute(currentPolicy, mockPersonalDetails, routeAccountID), {
            initialProps: {currentPolicy: pendingPolicy},
        });
        expect(result.current.isResolvingMember).toBe(false);

        // When cleanup removes the secondary entry and details before the association is supplied
        mockPersonalDetails = {[accountID]: buildPersonalDetails(primaryLogin, accountID, 'Primary')};
        const unmappedPolicy = {...policy, primaryLoginsInvited: undefined};
        rerender({currentPolicy: unmappedPolicy});

        // Then the unknown primary is not guessed, and the observed invite waits instead of becoming not found
        expect(result.current.memberLogin).toBe(secondaryLogin);
        expect(result.current.isResolvingMember).toBe(true);
        expect(result.current.accountID).toBe(routeAccountID);
        rerender({currentPolicy: policy});
        expect(result.current.memberLogin).toBe(primaryLogin);
        expect(result.current.accountID).toBe(accountID);
        expect(result.current.isResolvingMember).toBe(false);
        rerender({currentPolicy: unmappedPolicy});
        expect(result.current.memberLogin).toBe(primaryLogin);
        expect(result.current.isResolvingMember).toBe(false);
    });

    it('waits for real personal details when the primary mapping arrives first', () => {
        // Given the original optimistic member is editable while offline
        setOptimisticDetails();
        const {result, rerender} = renderHook(({currentPolicy}) => useWorkspaceMemberFromRoute(currentPolicy, mockPersonalDetails, routeAccountID), {
            initialProps: {currentPolicy: pendingPolicy},
        });

        // When the mapping and primary employee arrive before the primary account ID
        rerender({currentPolicy: policy});

        // Then a live role alone cannot enable writes with the stale optimistic account ID
        expect(result.current.memberLogin).toBe(primaryLogin);
        expect(result.current.isResolvingMember).toBe(true);
        mockPersonalDetails = {[accountID]: buildPersonalDetails(primaryLogin, accountID, 'Primary')};
        rerender({currentPolicy: policy});
        expect(result.current.accountID).toBe(accountID);
        expect(result.current.isResolvingMember).toBe(false);
    });

    it('does not treat clearing ADD as canonical identity settlement', () => {
        // Given an invite that was opened while its personal details were optimistic
        setOptimisticDetails();
        const {result, rerender} = renderHook(({currentPolicy}) => useWorkspaceMemberFromRoute(currentPolicy, mockPersonalDetails, routeAccountID), {
            initialProps: {currentPolicy: pendingPolicy},
        });

        // When success cleanup clears ADD before real personal details arrive
        rerender({currentPolicy: {...pendingPolicy, employeeList: {[secondaryLogin]: {email: secondaryLogin, role: CONST.POLICY.ROLE.USER, pendingAction: null}}}});

        // Then the original invitation association is still awaiting resolution
        expect(result.current.isResolvingMember).toBe(true);
        mockPersonalDetails = {};
        rerender({currentPolicy: {...pendingPolicy, employeeList: {[secondaryLogin]: {pendingAction: null}}}});
        expect(result.current.isResolvingMember).toBe(true);
    });

    it('waits until the page personal-details snapshot agrees with the canonical identity', () => {
        // Given an offline invitation whose page and by-login store initially share optimistic details
        setOptimisticDetails();
        const {result, rerender} = renderHook(({currentPolicy, details}) => useWorkspaceMemberFromRoute(currentPolicy, details, routeAccountID), {
            initialProps: {currentPolicy: pendingPolicy, details: mockPersonalDetails},
        });
        const oldPageDetails = mockPersonalDetails;

        // When the by-login provider has the primary account before the page receives the same raw details
        mockPersonalDetails = {[accountID]: buildPersonalDetails(primaryLogin, accountID, 'Primary')};
        rerender({currentPolicy: policy, details: oldPageDetails});

        // Then actions stay unavailable until their personal-details input can resolve the real account too
        expect(result.current.isResolvingMember).toBe(true);
        rerender({currentPolicy: policy, details: mockPersonalDetails});
        expect(result.current.isResolvingMember).toBe(false);
        expect(result.current.accountID).toBe(accountID);
    });

    it('also waits for matching page details when the invite keeps the same login', () => {
        // Given a normal single-login invite that was opened offline with fully optimistic personal details
        setOptimisticDetails();
        const {result, rerender} = renderHook(({currentPolicy, details}) => useWorkspaceMemberFromRoute(currentPolicy, details, routeAccountID), {
            initialProps: {currentPolicy: pendingPolicy, details: mockPersonalDetails},
        });
        const oldPageDetails = mockPersonalDetails;

        // When the by-login provider has the real account ID, but the page still has only the optimistic account ID
        mockPersonalDetails = {[accountID]: buildPersonalDetails(secondaryLogin, accountID, 'Member')};
        const syncedPolicy = {...pendingPolicy, employeeList: {[secondaryLogin]: {email: secondaryLogin, role: CONST.POLICY.ROLE.USER, pendingAction: null}}};
        rerender({currentPolicy: syncedPolicy, details: oldPageDetails});

        // Then matching login strings alone do not enable a save with an account absent from the page's details
        expect(result.current.isResolvingMember).toBe(true);
        rerender({currentPolicy: syncedPolicy, details: mockPersonalDetails});
        expect(result.current.isResolvingMember).toBe(false);
        expect(result.current.accountID).toBe(accountID);
    });

    it.each(['member', 'workspace'])('clears pending-invite history when the %s route changes', (routeChange) => {
        // Given pending identity history and a subsequent unresolved synchronization snapshot
        setOptimisticDetails();
        const {result, rerender} = renderHook(({currentPolicy, routeID}) => useWorkspaceMemberFromRoute(currentPolicy, mockPersonalDetails, routeID), {
            initialProps: {currentPolicy: pendingPolicy, routeID: routeAccountID},
        });
        mockPersonalDetails = {};
        const emptyPolicy = {...pendingPolicy, employeeList: {}};

        // When the same hook instance is reused by a different member or workspace
        rerender({currentPolicy: routeChange === 'workspace' ? {...emptyPolicy, id: 'workspace2'} : emptyPolicy, routeID: routeChange === 'member' ? 9999 : routeAccountID});

        // Then the new unknown route does not inherit the previous invitation's loading state
        expect(result.current.isResolvingMember).toBe(false);
        rerender({currentPolicy: emptyPolicy, routeID: routeAccountID});
        expect(result.current.isResolvingMember).toBe(false);
    });

    it('does not turn an unknown optimistic personal detail into a pending member', () => {
        // Given an optimistic personal detail without any live employee association
        setOptimisticDetails();

        // When a direct link points at that detail
        const {result} = renderHook(() => useWorkspaceMemberFromRoute({...pendingPolicy, employeeList: {}}, mockPersonalDetails, routeAccountID));

        // Then unknown membership remains not-found eligible rather than loading indefinitely
        expect(result.current.isResolvingMember).toBe(false);
    });

    it('ends waiting when the pending invitation is explicitly deleted', () => {
        // Given an invitation with retained optimistic identity
        setOptimisticDetails();
        const {result, rerender} = renderHook(({currentPolicy}) => useWorkspaceMemberFromRoute(currentPolicy, mockPersonalDetails, routeAccountID), {
            initialProps: {currentPolicy: pendingPolicy},
        });

        // When the original employee is explicitly marked for deletion
        rerender({currentPolicy: {...pendingPolicy, employeeList: {[secondaryLogin]: {role: CONST.POLICY.ROLE.USER, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}}}});

        // Then deletion is not hidden behind the reconciliation loader, even after the entry disappears
        expect(result.current.isResolvingMember).toBe(false);
        mockPersonalDetails = {};
        rerender({currentPolicy: {...pendingPolicy, employeeList: {}}});
        expect(result.current.isResolvingMember).toBe(false);
    });
});
