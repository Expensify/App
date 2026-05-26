import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isAdminSelector} from '@src/selectors/Domain';
import type {Domain, ExpensifyCardSettings, Policy} from '@src/types/onyx';
import {
    getCardSettings,
    getFundIdFromSettingsKey,
    getLinkedPolicyIDsFromExpensifyCardSettings,
    getPreferredPolicyFromExpensifyCardSettings,
    isPolicyIDInLinkedExpensifyCardPolicyList,
} from './CardUtils';
import {getDescriptionForPolicyDomainCard, isPolicyAdmin} from './PolicyUtils';

type ExpensifyCardFeedEntry = {
    settingsKey: string;
    fundID: number;
    settings: ExpensifyCardSettings;
};

function hasLoadedExpensifyCardSettings(settings: ExpensifyCardSettings | undefined): boolean {
    return !!settings && Object.keys(settings).length > 1;
}

/**
 * Determines whether an Expensify card feed should be visible to the current user.
 *
 * The function uses a fallback chain to decide visibility:
 *  1. If the feed has `linkedPolicyIDs`, show it when the user is an admin of at least one
 *     linked policy that is not pending deletion.
 *  2. Otherwise, if the feed has a `preferredPolicy`, show it when the user is an admin of
 *     that policy and the policy is not pending deletion.
 *  3. Otherwise (orphan feed with neither linkedPolicyIDs nor preferredPolicy):
 *     a. Show it if the user is a domain admin for the domain whose ID matches the fundID.
 *     b. Show it if any non-deleted policy the user administers has a `workspaceAccountID`
 *        equal to the fundID (i.e. the fund backs that workspace).
 */
function isExpensifyCardFeedVisibleToAdmin(
    settings: ExpensifyCardSettings,
    policies: OnyxCollection<Policy> | undefined,
    fundID: number,
    domains: OnyxCollection<Domain> | undefined,
    currentUserAccountID: number | undefined,
): boolean {
    if (!hasLoadedExpensifyCardSettings(settings)) {
        return false;
    }
    const linkedPolicyIDs = getLinkedPolicyIDsFromExpensifyCardSettings(settings);
    if (linkedPolicyIDs?.length) {
        return linkedPolicyIDs.some((linkedPolicyID) => {
            const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${linkedPolicyID.toUpperCase()}`];
            return isPolicyAdmin(policy) && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        });
    }
    const preferredPolicy = getPreferredPolicyFromExpensifyCardSettings(settings);
    if (preferredPolicy) {
        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${preferredPolicy.toUpperCase()}`];
        return isPolicyAdmin(policy) && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    }

    const domain = domains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${fundID}`];
    if (isAdminSelector(currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID)(domain)) {
        return true;
    }

    return Object.values(policies ?? {}).some(
        (policy) => policy?.workspaceAccountID === fundID && isPolicyAdmin(policy) && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );
}

function isFeedLinkedToPolicy(entry: ExpensifyCardFeedEntry, policyID: string): boolean {
    return isPolicyIDInLinkedExpensifyCardPolicyList(getLinkedPolicyIDsFromExpensifyCardSettings(entry.settings), policyID);
}

function isFeedForCurrentWorkspace(entry: ExpensifyCardFeedEntry, policyID: string): boolean {
    const preferred = getPreferredPolicyFromExpensifyCardSettings(entry.settings);
    return preferred?.toUpperCase() === policyID.toUpperCase();
}

/** Primary vs other: use linkedPolicyIDs when present; otherwise preferredPolicy (legacy). */
function isFeedPrimaryForPolicy(entry: ExpensifyCardFeedEntry, policyID: string): boolean {
    const linked = getLinkedPolicyIDsFromExpensifyCardSettings(entry.settings);
    if (linked?.length) {
        return isFeedLinkedToPolicy(entry, policyID);
    }
    return isFeedForCurrentWorkspace(entry, policyID);
}

function getAdminExpensifyCardFeedEntries(
    cardSettingsCollection: OnyxCollection<ExpensifyCardSettings> | undefined,
    policies: OnyxCollection<Policy> | undefined,
    domains: OnyxCollection<Domain> | undefined,
    currentUserAccountID: number | undefined,
): ExpensifyCardFeedEntry[] {
    return Object.entries(cardSettingsCollection ?? {}).flatMap(([settingsKey, settings]) => {
        if (!settings) {
            return [];
        }
        const fundID = getFundIdFromSettingsKey(settingsKey);
        if (!isExpensifyCardFeedVisibleToAdmin(settings, policies, fundID, domains, currentUserAccountID)) {
            return [];
        }
        return [{settingsKey, fundID, settings}];
    });
}

function partitionExpensifyCardFeedsForSelector(entries: ExpensifyCardFeedEntry[], policyID: string): {primary: ExpensifyCardFeedEntry[]; other: ExpensifyCardFeedEntry[]} {
    if (entries.length === 0) {
        return {primary: [], other: []};
    }
    const primary = entries.filter((e) => isFeedPrimaryForPolicy(e, policyID));
    const other = entries.filter((e) => !isFeedPrimaryForPolicy(e, policyID));
    return {primary, other};
}

function getExpensifyCardFeedDescription(cardSettings: OnyxEntry<ExpensifyCardSettings>, policies: OnyxCollection<Policy>): string {
    const domainName = getCardSettings(cardSettings)?.domainName ?? '';
    if (domainName) {
        return getDescriptionForPolicyDomainCard(domainName, policies);
    }
    const linkedPolicyIDs = getLinkedPolicyIDsFromExpensifyCardSettings(cardSettings);
    const preferredPolicyID = getPreferredPolicyFromExpensifyCardSettings(cardSettings);
    const policyIDForName = linkedPolicyIDs?.length ? linkedPolicyIDs.at(0) : preferredPolicyID;
    return (policyIDForName && policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDForName.toUpperCase()}`]?.name) ?? '';
}

export {getAdminExpensifyCardFeedEntries, getExpensifyCardFeedDescription, partitionExpensifyCardFeedsForSelector, type ExpensifyCardFeedEntry};
