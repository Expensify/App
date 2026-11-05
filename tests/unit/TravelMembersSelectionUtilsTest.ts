import {getSavedTravelMembersSelection, getTravelMemberAccountIDsToSave, getTravelMembersSelectionToSend, isTravelMemberChoiceLocked} from '@libs/TravelMembersSelectionUtils';

import CONST from '@src/CONST';
import type {TravelProvisioning} from '@src/types/onyx';

const WORKSPACE_A = 'workspace-a';
const WORKSPACE_B = 'workspace-b';

const CHOICE_FOR_WORKSPACE_A: TravelProvisioning = {
    enabledSteps: [CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.TRAVEL_MEMBERS, CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.TERMS],
    shouldEnableAllTravelMembers: false,
    travelMemberAccountIDs: [2, 3],
    travelMembersPolicyID: WORKSPACE_A,
};

const LOADED_MEMBER = {accountID: 2, email: 'loaded@example.com', isAccountIDGenerated: false};
const PLACEHOLDER_MEMBER = {accountID: 999, email: 'placeholder@example.com', isAccountIDGenerated: true};

describe('TravelMembersSelectionUtils', () => {
    describe('getTravelMembersSelectionToSend', () => {
        it('sends the choice made for the workspace being set up', () => {
            // Given a member choice made while setting up travel on workspace A
            // When workspace A accepts the travel terms
            const selection = getTravelMembersSelectionToSend(CHOICE_FOR_WORKSPACE_A, WORKSPACE_A);

            // Then the choice is sent
            expect(selection).toEqual({shouldEnableAllTravelMembers: false, travelMemberAccountIDs: [2, 3]});
        });

        it("doesn't send a choice made for another workspace", () => {
            // Given a member choice made while setting up travel on workspace A
            // When workspace B accepts the travel terms
            const selection = getTravelMembersSelectionToSend(CHOICE_FOR_WORKSPACE_A, WORKSPACE_B);

            // Then nothing is sent, so the server lets every member of workspace B use travel
            expect(selection).toBeUndefined();
        });

        it("doesn't send a choice when this session skipped the member step", () => {
            // Given a choice left for workspace A by a session that asked about members, and a new session that didn't
            const travelProvisioning: TravelProvisioning = {...CHOICE_FOR_WORKSPACE_A, enabledSteps: [CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.TERMS]};

            // When workspace A accepts the travel terms
            const selection = getTravelMembersSelectionToSend(travelProvisioning, WORKSPACE_A);

            // Then the old choice isn't sent
            expect(selection).toBeUndefined();
        });
    });

    describe('getSavedTravelMembersSelection', () => {
        it('only restores a choice made for the same workspace', () => {
            // Given a member choice made while setting up travel on workspace A
            // When the member step opens on workspace A and then on workspace B
            // Then only workspace A gets the earlier choice back
            expect(getSavedTravelMembersSelection(CHOICE_FOR_WORKSPACE_A, WORKSPACE_A)).toEqual({shouldEnableAllTravelMembers: false, travelMemberAccountIDs: [2, 3]});
            expect(getSavedTravelMembersSelection(CHOICE_FOR_WORKSPACE_A, WORKSPACE_B)).toEqual({});
        });
    });

    describe('isTravelMemberChoiceLocked', () => {
        it('locks members whose accountID has not loaded', () => {
            // Given one member with a loaded accountID and one with a placeholder
            // When the admin is choosing members one by one
            // Then only the member with a placeholder accountID can't be chosen
            expect(isTravelMemberChoiceLocked(LOADED_MEMBER, false, 'admin@example.com')).toBe(false);
            expect(isTravelMemberChoiceLocked(PLACEHOLDER_MEMBER, false, 'admin@example.com')).toBe(true);
        });

        it('locks every member when everyone is chosen and the admin always', () => {
            // Given the admin enabling travel and another member
            // When everyone is chosen, or the admin looks at their own row
            // Then the choice can't be changed
            expect(isTravelMemberChoiceLocked(LOADED_MEMBER, true, 'admin@example.com')).toBe(true);
            expect(isTravelMemberChoiceLocked(LOADED_MEMBER, false, LOADED_MEMBER.email)).toBe(true);
        });
    });

    describe('getTravelMemberAccountIDsToSave', () => {
        it('leaves out placeholder accountIDs', () => {
            // Given a selection that includes a member whose accountID is a placeholder
            // When the admin confirms the member step
            const accountIDs = getTravelMemberAccountIDsToSave([LOADED_MEMBER, PLACEHOLDER_MEMBER], [LOADED_MEMBER.accountID, PLACEHOLDER_MEMBER.accountID], false);

            // Then only the real accountID is saved, since the server wouldn't match the placeholder
            expect(accountIDs).toEqual([LOADED_MEMBER.accountID]);
        });

        it('saves no accountIDs when everyone is chosen', () => {
            // Given an earlier selection of one member
            // When the admin confirms with everyone chosen
            const accountIDs = getTravelMemberAccountIDsToSave([LOADED_MEMBER], [LOADED_MEMBER.accountID], true);

            // Then no accountIDs are saved
            expect(accountIDs).toEqual([]);
        });
    });
});
