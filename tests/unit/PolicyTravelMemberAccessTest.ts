import {setPolicyTravelMemberAccess} from '@libs/actions/Policy/Travel';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {canChangeMemberTravelAccess, canMemberUseTravel, isMemberTravelAccessTurnedOff} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import type {Policy, PolicyEmployee} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';

jest.mock('@libs/API');

const mockWrite = jest.mocked(write);

const MEMBER = {email: 'member@example.com', accountID: 2};

/** The members of the workspace used to check who can change travel access, with their workspace roles. */
const WORKSPACE_MEMBERS: Array<[string, PolicyEmployee['role']]> = [
    ['owner@example.com', CONST.POLICY.ROLE.ADMIN],
    ['admin@example.com', CONST.POLICY.ROLE.ADMIN],
    ['admin2@example.com', CONST.POLICY.ROLE.ADMIN],
    ['traveladmin@example.com', CONST.POLICY.ROLE.TRAVEL_ADMIN],
    ['traveladmin2@example.com', CONST.POLICY.ROLE.TRAVEL_ADMIN],
    ['peopleadmin@example.com', CONST.POLICY.ROLE.PEOPLE_ADMIN],
    ['member@example.com', CONST.POLICY.ROLE.USER],
    ['member2@example.com', CONST.POLICY.ROLE.USER],
];

function buildPolicy(employee: PolicyEmployee): Policy {
    return {
        ...createRandomPolicy(1),
        id: 'policy-1',
        employeeList: {[MEMBER.email]: {email: MEMBER.email, role: CONST.POLICY.ROLE.USER, ...employee}},
    };
}

/** Matches Onyx data whose first update merges the given fields into the test member's employeeList entry. */
function withEmployeeUpdate(dataKey: 'optimisticData' | 'successData' | 'failureData', employeeUpdate: unknown) {
    return expect.objectContaining({[dataKey]: [expect.objectContaining({value: {employeeList: {[MEMBER.email]: employeeUpdate}}})]});
}

describe('Policy travel member access', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('setPolicyTravelMemberAccess', () => {
        it('does nothing when the member already has the requested access', () => {
            // Given a member without a stored value, who can book travel
            // When an admin turns travel on for them
            setPolicyTravelMemberAccess(buildPolicy({}), [MEMBER], true);

            // Then no request is sent, since nothing would change
            expect(mockWrite).not.toHaveBeenCalled();

            // And turning off a member who is already off sends nothing either
            setPolicyTravelMemberAccess(buildPolicy({canUseTravel: false}), [MEMBER], false);
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('stores false when turning a member off', () => {
            // Given a member without a stored value, who can book travel
            // When an admin turns travel off for them
            setPolicyTravelMemberAccess(buildPolicy({}), [MEMBER], false);

            // Then false is sent and stored optimistically, the only value the server stores
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_POLICY_TRAVEL_MEMBER_ACCESS,
                {policyID: 'policy-1', employeeAccountIDList: String(MEMBER.accountID), enabled: false},
                withEmployeeUpdate('optimisticData', {canUseTravel: false, pendingFields: {canUseTravel: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}}),
            );
        });

        it('removes the stored false when turning a member on, and restores it on failure', () => {
            // Given a member whose travel access is turned off
            // When an admin turns travel on for them
            setPolicyTravelMemberAccess(buildPolicy({canUseTravel: false}), [MEMBER], true);

            // Then the stored false is removed optimistically, since a member without a value can book travel
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_POLICY_TRAVEL_MEMBER_ACCESS,
                {policyID: 'policy-1', employeeAccountIDList: String(MEMBER.accountID), enabled: true},
                withEmployeeUpdate('optimisticData', {canUseTravel: null, pendingFields: {canUseTravel: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}}),
            );

            // And a failure restores false and marks the member as a failed update, so dismissing the error keeps them in
            // the list, while a success only clears the pending field
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_POLICY_TRAVEL_MEMBER_ACCESS,
                expect.anything(),
                withEmployeeUpdate('failureData', {
                    canUseTravel: false,
                    pendingFields: {canUseTravel: null},
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    errors: expect.any(Object) as unknown,
                }),
            );
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_POLICY_TRAVEL_MEMBER_ACCESS,
                expect.anything(),
                withEmployeeUpdate('successData', {pendingFields: {canUseTravel: null}}),
            );
        });
    });

    describe('travel member helpers', () => {
        it.each([
            [undefined, true, false],
            [false, false, true],
        ])('reads canUseTravel %s as can use travel %s and turned off %s', (canUseTravel, expectedCanUseTravel, expectedTurnedOff) => {
            // Given a member with the stored travel access value
            const policy = buildPolicy(canUseTravel === undefined ? {} : {canUseTravel});

            // When the app reads it
            // Then only a stored false stops them from booking
            expect(canMemberUseTravel(policy, MEMBER.email)).toBe(expectedCanUseTravel);
            expect(isMemberTravelAccessTurnedOff(policy, MEMBER.email)).toBe(expectedTurnedOff);
        });

        it.each([
            ['admin@example.com', 'owner@example.com', true],
            ['admin@example.com', 'admin2@example.com', true],
            ['admin@example.com', 'member@example.com', true],
            ['traveladmin@example.com', 'member@example.com', true],
            ['traveladmin@example.com', 'traveladmin2@example.com', true],
            ['traveladmin@example.com', 'admin@example.com', false],
            ['traveladmin@example.com', 'owner@example.com', false],
            ['peopleadmin@example.com', 'member@example.com', false],
            ['member@example.com', 'member2@example.com', false],
        ])('lets %s change travel access for %s: %s', (login, targetLogin, expected) => {
            // Given a Control workspace with an owner, workspace admins, travel admins, a People Admin, and members
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                owner: 'owner@example.com',
                travelSettings: {spotnanaCompanyID: 'company'},
                employeeList: Object.fromEntries(WORKSPACE_MEMBERS.map(([email, role]) => [email, {email, role}])),
            };

            // When we check whether the member can change the target's travel access
            // Then members who manage travel can, except that only full admins can change it for the owner and workspace admins, like Auth
            expect(canChangeMemberTravelAccess(policy, login, targetLogin, true)).toBe(expected);
        });

        it('lets nobody change travel access without the beta, before travel is provisioned, or for a member still being added', () => {
            // Given a provisioned Control workspace with an admin and a member
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                owner: 'owner@example.com',
                travelSettings: {spotnanaCompanyID: 'company'},
                employeeList: Object.fromEntries(WORKSPACE_MEMBERS.map(([email, role]) => [email, {email, role}])),
            };

            // When the beta is off, travel isn't provisioned, or the member is still being added
            // Then even a workspace admin can't change their travel access
            expect(canChangeMemberTravelAccess(policy, 'admin@example.com', 'member@example.com', false)).toBe(false);
            expect(canChangeMemberTravelAccess({...policy, travelSettings: undefined}, 'admin@example.com', 'member@example.com', true)).toBe(false);
            const pendingMemberPolicy: Policy = {
                ...policy,
                employeeList: {...policy.employeeList, [MEMBER.email]: {email: MEMBER.email, role: CONST.POLICY.ROLE.USER, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}},
            };
            expect(canChangeMemberTravelAccess(pendingMemberPolicy, 'admin@example.com', 'member@example.com', true)).toBe(false);
        });

        it('keeps travel admins from changing the owner even when the owner is not listed as an admin', () => {
            // Given a Control workspace whose owner's employeeList entry doesn't say admin
            const ownerEmail = 'owner@example.com';
            const travelAdminEmail = 'traveladmin@example.com';
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                owner: ownerEmail,
                travelSettings: {spotnanaCompanyID: 'company'},
                employeeList: {
                    [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.USER},
                    [travelAdminEmail]: {email: travelAdminEmail, role: CONST.POLICY.ROLE.TRAVEL_ADMIN},
                },
            };

            // When a travel admin checks whether they can change the owner's travel access
            // Then they can't, because Auth treats the owner as an admin whatever role is listed
            expect(canChangeMemberTravelAccess(policy, travelAdminEmail, ownerEmail, true)).toBe(false);
        });
    });
});
