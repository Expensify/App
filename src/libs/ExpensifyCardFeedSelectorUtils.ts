import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExpensifyCardSettings, Policy} from '@src/types/onyx';
import {getFundIdFromSettingsKey} from './CardUtils';
import {isPolicyAdmin} from './PolicyUtils';

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
    if (!settings.preferredPolicy) {
        return false;
    }
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${settings.preferredPolicy}`];
    return isPolicyAdmin(policy);
}

function isExpensifyLinkedPolicyIdsFeatureReady(entries: ExpensifyCardFeedEntry[]): boolean {
    return entries.some((entry) => entry.settings.linkedPolicyIds !== undefined);
}

function isFeedLinkedToPolicy(entry: ExpensifyCardFeedEntry, policyID: string): boolean {
    return entry.settings.linkedPolicyIds?.includes(policyID) ?? false;
}

function isFeedForCurrentWorkspace(entry: ExpensifyCardFeedEntry, policyID: string): boolean {
    return entry.settings.preferredPolicy === policyID;
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
    if (isExpensifyLinkedPolicyIdsFeatureReady(entries)) {
        const primary = entries.filter((e) => isFeedLinkedToPolicy(e, policyID));
        const other = entries.filter((e) => !isFeedLinkedToPolicy(e, policyID));
        return {primary, other};
    }
    const primary = entries.filter((e) => isFeedForCurrentWorkspace(e, policyID));
    const other = entries.filter((e) => !isFeedForCurrentWorkspace(e, policyID));
    return {primary, other};
}

export {getAdminExpensifyCardFeedEntries, partitionExpensifyCardFeedsForSelector, type ExpensifyCardFeedEntry};
