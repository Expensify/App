import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExpensifyCardSettings, Policy} from '@src/types/onyx';
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

function isExpensifyCardFeedVisibleToAdmin(settings: ExpensifyCardSettings, policies: OnyxCollection<Policy> | undefined): boolean {
    if (!hasLoadedExpensifyCardSettings(settings)) {
        return false;
    }
    const linkedPolicyIDs = getLinkedPolicyIDsFromExpensifyCardSettings(settings);
    if (linkedPolicyIDs?.length) {
        return linkedPolicyIDs.some((linkedPolicyID) => isPolicyAdmin(policies?.[`${ONYXKEYS.COLLECTION.POLICY}${linkedPolicyID.toUpperCase()}`]));
    }
    const preferredPolicy = getPreferredPolicyFromExpensifyCardSettings(settings);
    if (!preferredPolicy) {
        return false;
    }
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${preferredPolicy.toUpperCase()}`];
    return isPolicyAdmin(policy);
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

function getAdminExpensifyCardFeedEntries(cardSettingsCollection: OnyxCollection<ExpensifyCardSettings> | undefined, policies: OnyxCollection<Policy> | undefined): ExpensifyCardFeedEntry[] {
    return Object.entries(cardSettingsCollection ?? {}).flatMap(([settingsKey, settings]) => {
        if (!settings) {
            return [];
        }
        const fundID = getFundIdFromSettingsKey(settingsKey);
        if (!isExpensifyCardFeedVisibleToAdmin(settings, policies)) {
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
