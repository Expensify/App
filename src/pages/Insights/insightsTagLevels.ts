/** Matches configured tag lists by position across the dashboard's workspace selection. */
import {getTagLists} from '@libs/PolicyUtils';
import {isPolicyEligibleForTopTags} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

type InsightsTagLevelOption = {value: number; label: string};

function getInsightsTagPolicyIDs(policies: OnyxCollection<Policy>, selectedPolicyIDs: string[]): string[] {
    const selected = new Set(selectedPolicyIDs);
    return Object.values(policies ?? {}).flatMap((policy) => (policy && isPolicyEligibleForTopTags(policy) && (selected.size === 0 || selected.has(policy.id)) ? [policy.id] : []));
}

function getInsightsTagLevelNames(policyTags: OnyxCollection<PolicyTagLists>, policyIDs: string[]): string[][] {
    return policyIDs.map((policyID) => getTagLists(policyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`]).map((tagList) => tagList.name));
}

function getInsightsTagLevelOptions(namesByPolicy: string[][], getFallbackLabel: (level: number) => string): InsightsTagLevelOption[] {
    const count = Math.max(CONST.INSIGHTS.DEFAULT_TAG_LEVEL, ...namesByPolicy.map((names) => names.length));
    return Array.from({length: count}, (_, index) => {
        const names = new Set(namesByPolicy.flatMap((policyNames) => (policyNames[index] ? [policyNames[index]] : [])));
        return {value: index + 1, label: names.size === 1 ? [...names][0] : getFallbackLabel(index + 1)};
    });
}

function getFittingTagLevel(level: number, options: InsightsTagLevelOption[]): number {
    return options.some((option) => option.value === level) ? level : CONST.INSIGHTS.DEFAULT_TAG_LEVEL;
}

export {getFittingTagLevel, getInsightsTagLevelNames, getInsightsTagLevelOptions, getInsightsTagPolicyIDs};
export type {InsightsTagLevelOption};
