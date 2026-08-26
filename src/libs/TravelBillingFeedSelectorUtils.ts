import CONST from '@src/CONST';
import {isAdminSelector} from '@src/selectors/Domain';
import type {Domain, ExpensifyCardSettings, Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {getDomainByFundID, getFundIdFromSettingsKey, getLinkedPolicyIDsFromExpensifyCardSettings, isPolicyIDInLinkedExpensifyCardPolicyList} from './CardUtils';
import {isPolicyAdmin} from './PolicyUtils';

type TravelBillingFeedEntry = {
    settingsKey: string;
    fundID: number;
    settings: ExpensifyCardSettings;
};

/** A travel feed qualifies only when its settings NVP has a TRAVEL_US program block with a configured settlement bank account. */
function hasConfiguredTravelBillingFeed(settings: ExpensifyCardSettings | undefined): boolean {
    const nested = settings?.[CONST.TRAVEL.PROGRAM_TRAVEL_US];
    return !!nested && typeof nested === 'object' && !Array.isArray(nested) && nested.paymentBankAccountID != null;
}

/**
 * A travel feed is visible to the current user when they administer the domain that owns the feed, or a workspace whose
 * account backs it. Mirrors the Expensify Card rule, so travel lists the same feeds a card admin would see.
 */
function isTravelBillingFeedVisibleToAdmin(
    settings: ExpensifyCardSettings,
    policies: OnyxCollection<Policy>,
    fundID: number,
    domains: OnyxCollection<Domain>,
    currentUserAccountID: number,
): boolean {
    if (!hasConfiguredTravelBillingFeed(settings)) {
        return false;
    }
    const domain = getDomainByFundID(domains, fundID);
    if (isAdminSelector(currentUserAccountID)(domain)) {
        return true;
    }
    return Object.values(policies ?? {}).some(
        (policy) => policy?.policyAccountID === fundID && isPolicyAdmin(policy) && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );
}

/** A feed shows as available for a policy when that policy is in the feed's linkedPolicyIDs; otherwise it shows under "From other workspaces". */
function isFeedPrimaryForPolicy(entry: TravelBillingFeedEntry, policyID: string): boolean {
    return isPolicyIDInLinkedExpensifyCardPolicyList(getLinkedPolicyIDsFromExpensifyCardSettings(entry.settings), policyID);
}

function getAdminTravelBillingFeedEntries(
    cardSettingsCollection: OnyxCollection<ExpensifyCardSettings>,
    policies: OnyxCollection<Policy>,
    domains: OnyxCollection<Domain>,
    currentUserAccountID: number,
): TravelBillingFeedEntry[] {
    return Object.entries(cardSettingsCollection ?? {}).flatMap(([settingsKey, settings]) => {
        if (!settings) {
            return [];
        }
        const fundID = getFundIdFromSettingsKey(settingsKey);
        if (!isTravelBillingFeedVisibleToAdmin(settings, policies, fundID, domains, currentUserAccountID)) {
            return [];
        }
        return [{settingsKey, fundID, settings}];
    });
}

function partitionTravelBillingFeedsForSelector(entries: TravelBillingFeedEntry[], policyID: string): {primary: TravelBillingFeedEntry[]; other: TravelBillingFeedEntry[]} {
    if (entries.length === 0) {
        return {primary: [], other: []};
    }
    const primary = entries.filter((entry) => isFeedPrimaryForPolicy(entry, policyID));
    const other = entries.filter((entry) => !isFeedPrimaryForPolicy(entry, policyID));
    return {primary, other};
}

export {getAdminTravelBillingFeedEntries, partitionTravelBillingFeedsForSelector, type TravelBillingFeedEntry};
