import type {TravelMembersSelection} from '@libs/actions/Travel';

import CONST from '@src/CONST';
import type {TravelProvisioning} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type TravelMemberCandidate = {
    accountID: number;
    email: string;

    /** Whether the accountID is a placeholder because the member's personal details haven't loaded */
    isAccountIDGenerated: boolean;
};

/** The member choice saved for this workspace, ignoring one made while enabling travel on another workspace. */
function getSavedTravelMembersSelection(travelProvisioning: OnyxEntry<TravelProvisioning>, policyID: string): Partial<TravelMembersSelection> {
    if (travelProvisioning?.travelMembersPolicyID !== policyID) {
        return {};
    }
    return {shouldEnableAllTravelMembers: travelProvisioning.shouldEnableAllTravelMembers, travelMemberAccountIDs: travelProvisioning.travelMemberAccountIDs};
}

/**
 * The member choice to send when accepting the travel terms. It is only sent when this session asked for it on this
 * workspace, so a choice left by an abandoned session or made for another workspace isn't sent.
 */
function getTravelMembersSelectionToSend(travelProvisioning: OnyxEntry<TravelProvisioning>, policyID: string): TravelMembersSelection | undefined {
    if (
        !travelProvisioning?.enabledSteps?.includes(CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.TRAVEL_MEMBERS) ||
        travelProvisioning.travelMembersPolicyID !== policyID ||
        travelProvisioning.shouldEnableAllTravelMembers === undefined
    ) {
        return undefined;
    }
    return {shouldEnableAllTravelMembers: !!travelProvisioning.shouldEnableAllTravelMembers, travelMemberAccountIDs: travelProvisioning.travelMemberAccountIDs ?? []};
}

/**
 * Whether a member's choice can't be changed: everyone is chosen, they are the admin enabling travel, or their accountID
 * hasn't loaded and the server would not match it.
 */
function isTravelMemberChoiceLocked(member: TravelMemberCandidate, shouldEnableAllTravelMembers: boolean, currentUserLogin: string | undefined): boolean {
    return shouldEnableAllTravelMembers || member.email === currentUserLogin || member.isAccountIDGenerated;
}

/** The chosen accountIDs to save, leaving out members whose accountID is a placeholder. Choosing everyone sends none. */
function getTravelMemberAccountIDsToSave(members: TravelMemberCandidate[], selectedAccountIDs: number[], shouldEnableAllTravelMembers: boolean): number[] {
    if (shouldEnableAllTravelMembers) {
        return [];
    }
    const realAccountIDs = new Set(members.filter((member) => !member.isAccountIDGenerated).map((member) => member.accountID));
    return selectedAccountIDs.filter((accountID) => realAccountIDs.has(accountID));
}

export {getSavedTravelMembersSelection, getTravelMembersSelectionToSend, isTravelMemberChoiceLocked, getTravelMemberAccountIDsToSave};
export type {TravelMemberCandidate};
