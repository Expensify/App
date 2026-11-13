import {getCardSettings, getFundIdFromSettingsKey, isPolicyIDInLinkedExpensifyCardPolicyList} from '@libs/CardUtils';
import {getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExpensifyCardSettings} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useDefaultFundID from './useDefaultFundID';
import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

/** True when the settings' TRAVEL_US program lists the policy and isn't being deleted. */
function isTravelBillingLinkedToPolicy(settings: OnyxEntry<ExpensifyCardSettings>, policyID: string): boolean {
    if (!settings || settings.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        return false;
    }
    return isPolicyIDInLinkedExpensifyCardPolicyList(settings[CONST.TRAVEL.PROGRAM_TRAVEL_US]?.linkedPolicyIDs, policyID);
}

/** Finds the non-workspace fund whose TRAVEL_US program lists the policy. */
function findLinkedTravelBillingFundID(cardSettings: OnyxCollection<ExpensifyCardSettings>, policyID: string | undefined, workspaceAccountID: number): number | undefined {
    if (!policyID) {
        return undefined;
    }
    const linkedEntry = Object.entries(cardSettings ?? {}).find(
        ([key, settings]) => getFundIdFromSettingsKey(key) !== workspaceAccountID && isTravelBillingLinkedToPolicy(settings, policyID),
    );
    return linkedEntry ? getFundIdFromSettingsKey(linkedEntry[0]) : undefined;
}

/** True when the settings have a TRAVEL_US program whose linkedPolicyIDs leaves out the policy, or that has no list at all. */
function isTravelBillingUnlinkedFromPolicy(settings: OnyxEntry<ExpensifyCardSettings>, policyID: string | undefined): boolean {
    const travelSettings = settings?.[CONST.TRAVEL.PROGRAM_TRAVEL_US];
    if (!policyID || !travelSettings) {
        return false;
    }
    // A pending first settlement account save writes the program without linkedPolicyIDs until the server links the policy.
    if (!travelSettings.linkedPolicyIDs && settings?.pendingFields?.paymentBankAccountID) {
        return false;
    }
    return !isPolicyIDInLinkedExpensifyCardPolicyList(travelSettings.linkedPolicyIDs, policyID);
}

/**
 * Hook to get the fundID that holds Consolidated Travel Billing for a given policyID.
 * Like the backend, it prefers a domain whose TRAVEL_US program lists the policy, then the workspace account's TRAVEL_US program,
 * independently of the last selected Expensify Card feed. Without either it returns the default fundID, or the workspace account
 * when the default fund has a TRAVEL_US program that doesn't list the policy.
 */
function useTravelBillingFundID(policyID: string | undefined) {
    const defaultFundID = useDefaultFundID(policyID);
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [workspaceCardSettings] = useOnyx(getTravelBillingCardSettingsKey(workspaceAccountID));
    const unlinkedTravelBillingSelector = (settings: OnyxEntry<ExpensifyCardSettings>) => isTravelBillingUnlinkedFromPolicy(settings, policyID);
    const [isDefaultFundTravelBillingUnlinked] = useOnyx(getTravelBillingCardSettingsKey(defaultFundID), {selector: unlinkedTravelBillingSelector});

    const linkedFundSelector = (cardSettings: OnyxCollection<ExpensifyCardSettings>) => findLinkedTravelBillingFundID(cardSettings, policyID, workspaceAccountID);
    const [linkedFundID] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {selector: linkedFundSelector});

    if (linkedFundID) {
        return linkedFundID;
    }

    // Setup falls back to the workspace account when the domain already has a card program.
    if (getCardSettings(workspaceCardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US)) {
        return workspaceAccountID;
    }

    // The default fund can be a domain linked to this policy only through its card program, with a travel feed that doesn't list this policy.
    // The backend resolves this policy to its workspace account in that case, and reading that feed here would show another feed's spend and settings as this policy's.
    if (isDefaultFundTravelBillingUnlinked) {
        return workspaceAccountID;
    }

    return defaultFundID;
}

export default useTravelBillingFundID;
