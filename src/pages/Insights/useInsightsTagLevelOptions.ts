/** Builds the Top tags level options from GetInsights' tag levels, and resets a selected level that no workspace in scope has. */
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsTagLevel} from '@src/types/onyx/InsightsDashboard';

import {useEffect, useEffectEvent} from 'react';

import type {InsightsFilters} from './insightsFilters';
import type {InsightsTagLevelOption} from './insightsTagLevels';

import {getCachedTagLevels, getFittingTagLevel, getInsightsTagLevelOptions, getStoredTagLevels} from './insightsTagLevels';

type UseInsightsTagLevelOptionsParams = {
    /** Levels from a response for the current filters that arrived while the dashboard is open, the only ones a reset can trust */
    respondedTagLevels: InsightsTagLevel[] | undefined;

    /** Workspaces the dashboard is scoped to, which are what the levels depend on */
    policyIDs: string[];

    /** Workspaces in scope whose tags Top tags groups by, whose tag lists on the device stand in until a GetInsights response lists the levels */
    tagPolicyIDs: string[];

    /** Level the dashboard filters by, undefined outside Spend */
    selectedTagLevel: number | undefined;

    /** Whether filters can change now, so a reset that arrives while they can't waits until they can */
    canChangeFilters: boolean;
    setFilters: (update: Partial<InsightsFilters>) => void;
};

type InsightsTagLevelOptionsResult = {
    options: InsightsTagLevelOption[];

    /** The levels the options were built from, known for the workspaces in scope before the response for the current filters arrives */
    knownTagLevels: InsightsTagLevel[] | undefined;
};

function useInsightsTagLevelOptions({
    respondedTagLevels,
    policyIDs,
    tagPolicyIDs,
    selectedTagLevel,
    canChangeFilters,
    setFilters,
}: UseInsightsTagLevelOptionsParams): InsightsTagLevelOptionsResult {
    const {translate, numberFormat} = useLocalize();
    // Each filter change reads a new response, so the newest levels stored for the same workspaces keep the menu up until it arrives, including offline and after a reload.
    const [storedTagLevels] = useOnyx(ONYXKEYS.COLLECTION.INSIGHTS_TAG_LEVELS, {selector: (tagLevelsByRequest) => getStoredTagLevels(tagLevelsByRequest, policyIDs)});
    // Until a successful request stores levels for these workspaces, such as right after an update, the tag lists on the device stand in
    const [cachedTagLevels] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: (policyTags) => (storedTagLevels ? undefined : getCachedTagLevels(policyTags, tagPolicyIDs))});
    const knownTagLevels = storedTagLevels ?? cachedTagLevels;
    const options = getInsightsTagLevelOptions(knownTagLevels, selectedTagLevel, (level) => translate('insightsPage.tagLevel', numberFormat(level)));

    const resetUnavailableTagLevel = useEffectEvent((loadedTagLevels: InsightsTagLevel[]) => {
        const tagLevel = selectedTagLevel ?? CONST.INSIGHTS.DEFAULT_TAG_LEVEL;
        const fittingTagLevel = getFittingTagLevel(tagLevel, loadedTagLevels);
        if (fittingTagLevel === tagLevel) {
            return;
        }
        setFilters({tagLevel: fittingTagLevel});
    });

    useEffect(() => {
        if (!respondedTagLevels || !canChangeFilters) {
            return;
        }
        resetUnavailableTagLevel(respondedTagLevels);
    }, [respondedTagLevels, canChangeFilters]);

    return {options, knownTagLevels};
}

export default useInsightsTagLevelOptions;
