import {setPolicyTravelMemberAccess, setPolicyTravelMemberAccessValue, setPolicyTravelMemberRole} from '@libs/actions/Policy/Travel';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {canMemberUseTravel, getTravelMemberRole, isMemberTravelAccessTurnedOff} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyEmployee} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxKey} from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';

jest.mock('@libs/API');

const mockWrite = jest.mocked(write);

const MEMBER = {email: 'member@example.com', accountID: 2};

function buildPolicy(employee: PolicyEmployee): Policy {
    return {
        ...createRandomPolicy(1),
        id: 'policy-1',
        employeeList: {[MEMBER.email]: {email: MEMBER.email, role: CONST.POLICY.ROLE.USER, ...employee}},
    };
}

function getEmployeeUpdate(call: number, dataKey: 'optimisticData' | 'successData' | 'failureData'): Record<string, unknown> | undefined {
    const options = mockWrite.mock.calls.at(call)?.[2] as OnyxData<OnyxKey> | undefined;
    const value = options?.[dataKey]?.at(0)?.value as {employeeList?: Record<string, Record<string, unknown>>} | undefined;
    return value?.employeeList?.[MEMBER.email];
}

describe('Policy travel member access', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('setPolicyTravelMemberAccess', () => {
        it('does nothing when the stored value already matches', () => {
            // Given a member whose travel access is already stored as on
            // When an admin turns travel on for them
            setPolicyTravelMemberAccess(buildPolicy({canUseTravel: true}), [MEMBER], true);

            // Then no request is sent, since nothing would change
            expect(mockWrite).not.toHaveBeenCalled();
        });

        it('stores off for a member without a stored value', () => {
            // Given a member without a stored travel access value, who shows as off
            // When an admin turns travel off for them
            setPolicyTravelMemberAccess(buildPolicy({}), [MEMBER], false);

            // Then off is still sent and stored, so the member is explicitly turned off like the server stores it
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_POLICY_TRAVEL_MEMBER_ACCESS,
                {policyID: 'policy-1', employeeAccountIDList: String(MEMBER.accountID), enabled: false},
                expect.anything(),
            );
            expect(getEmployeeUpdate(0, 'optimisticData')).toEqual({canUseTravel: false, pendingFields: {canUseTravel: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}});
        });

        it('restores the stored value and marks the member as a failed update on failure', () => {
            // Given a member whose travel access is stored as off
            // When an admin turns travel on for them
            setPolicyTravelMemberAccess(buildPolicy({canUseTravel: false}), [MEMBER], true);

            // Then a failure restores off and marks the member as a failed update, so dismissing the error keeps them in
            // the list, and a success clears both
            const failureUpdate = getEmployeeUpdate(0, 'failureData');
            expect(failureUpdate).toMatchObject({canUseTravel: false, pendingFields: {canUseTravel: null}, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE});
            expect(failureUpdate?.errors).toBeTruthy();
            expect(getEmployeeUpdate(0, 'successData')).toEqual({pendingFields: {canUseTravel: null}, pendingAction: null, errors: null});
        });
    });

    describe('setPolicyTravelMemberRole', () => {
        it('stores the role even when it matches the role the member gets from their workspace role', () => {
            // Given a member without a stored travel role, who is a traveler because of their workspace role
            // When an admin makes them a traveler
            setPolicyTravelMemberRole(buildPolicy({}), [MEMBER], CONST.TRAVEL.MEMBER_ROLE.TRAVELER);

            // Then the role is still sent, so a later workspace role change doesn't change their travel role
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_POLICY_TRAVEL_MEMBER_ROLE,
                {policyID: 'policy-1', employeeAccountIDList: String(MEMBER.accountID), travelRole: CONST.TRAVEL.MEMBER_ROLE.TRAVELER},
                expect.anything(),
            );
            expect(getEmployeeUpdate(0, 'failureData')).toMatchObject({travelRole: null, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE});
        });

        it('does nothing when the stored role already matches', () => {
            // Given a member whose travel role is stored as travel admin
            // When an admin makes them a travel admin
            setPolicyTravelMemberRole(buildPolicy({travelRole: CONST.TRAVEL.MEMBER_ROLE.ADMIN}), [MEMBER], CONST.TRAVEL.MEMBER_ROLE.ADMIN);

            // Then no request is sent
            expect(mockWrite).not.toHaveBeenCalled();
        });
    });

    describe('setPolicyTravelMemberAccessValue', () => {
        it('turns travel on and sets the role when a role is chosen', () => {
            // Given a member with travel off
            // When an admin picks travel admin for them
            setPolicyTravelMemberAccessValue(buildPolicy({canUseTravel: false}), [MEMBER], CONST.TRAVEL.MEMBER_ROLE.ADMIN);

            // Then travel is turned on and the role is set
            expect(mockWrite).toHaveBeenNthCalledWith(1, WRITE_COMMANDS.SET_POLICY_TRAVEL_MEMBER_ACCESS, expect.objectContaining({enabled: true}), expect.anything());
            expect(mockWrite).toHaveBeenNthCalledWith(
                2,
                WRITE_COMMANDS.SET_POLICY_TRAVEL_MEMBER_ROLE,
                expect.objectContaining({travelRole: CONST.TRAVEL.MEMBER_ROLE.ADMIN}),
                expect.anything(),
            );
        });

        it('only turns travel off when off is chosen', () => {
            // Given a travel admin with travel on
            // When an admin picks off for them
            setPolicyTravelMemberAccessValue(buildPolicy({canUseTravel: true, travelRole: CONST.TRAVEL.MEMBER_ROLE.ADMIN}), [MEMBER], CONST.TRAVEL.MEMBER_ACCESS_OFF);

            // Then only travel access changes, so their role comes back when travel is turned on again
            expect(mockWrite).toHaveBeenCalledTimes(1);
            expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.SET_POLICY_TRAVEL_MEMBER_ACCESS, expect.objectContaining({enabled: false}), expect.anything());
        });
    });

    describe('travel member helpers', () => {
        it.each([
            [undefined, false, false],
            [true, true, false],
            [false, false, true],
        ])('reads canUseTravel %s as can use travel %s and turned off %s', (canUseTravel, expectedCanUseTravel, expectedTurnedOff) => {
            // Given a member with the stored travel access value
            const policy = buildPolicy(canUseTravel === undefined ? {} : {canUseTravel});

            // When the app reads it
            // Then only an explicit true shows them as able to book, and only an explicit false blocks booking
            expect(canMemberUseTravel(policy, MEMBER.email)).toBe(expectedCanUseTravel);
            expect(isMemberTravelAccessTurnedOff(policy, MEMBER.email)).toBe(expectedTurnedOff);
        });

        it('follows the workspace role until a travel role is stored', () => {
            // Given members with and without a stored travel role
            // When the app reads their travel role
            // Then a stored role wins, and otherwise workspace admins are travel admins and everyone else is a traveler
            expect(getTravelMemberRole(buildPolicy({}), MEMBER.email)).toBe(CONST.TRAVEL.MEMBER_ROLE.TRAVELER);
            expect(getTravelMemberRole(buildPolicy({role: CONST.POLICY.ROLE.ADMIN}), MEMBER.email)).toBe(CONST.TRAVEL.MEMBER_ROLE.ADMIN);
            expect(getTravelMemberRole(buildPolicy({role: CONST.POLICY.ROLE.ADMIN, travelRole: CONST.TRAVEL.MEMBER_ROLE.TRAVELER}), MEMBER.email)).toBe(CONST.TRAVEL.MEMBER_ROLE.TRAVELER);
        });
    });
});
