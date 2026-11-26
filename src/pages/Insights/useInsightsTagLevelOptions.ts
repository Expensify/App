/** Builds the Top tags level options from GetInsights' tag levels, and resets a selected level that no workspace in scope has. */
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsTagLevel} from '@src/types/onyx/InsightsDashboard';

import {useEffect, useEffectEvent} from 'react';

import type {InsightsFilters} from './insightsFilters';
import type {InsightsTagLevelOption} from './insightsTagLevels';

import {getFittingTagLevel, getInsightsTagLevelOptions, getStoredTagLevels} from './insightsTagLevels';

type UseInsightsTagLevelOptionsParams = {
    /** Levels from the response for the current filters, undefined until GetInsights responds */
    tagLevels: InsightsTagLevel[] | undefined;

    /** Workspaces the dashboard is scoped to, which are what the levels depend on */
    policyIDs: string[];

    /** Level the dashboard filters by, undefined outside Spend */
    selectedTagLevel: number | undefined;

    /** Whether filters can change now, so a reset that arrives while they can't waits until they can */
    canChangeFilters: boolean;
    setFilters: (update: Partial<InsightsFilters>) => void;
};

function useInsightsTagLevelOptions({tagLevels, policyIDs, selectedTagLevel, canChangeFilters, setFilters}: UseInsightsTagLevelOptionsParams): InsightsTagLevelOption[] {
    const {translate, numberFormat} = useLocalize();
    // Each filter change reads a new response, so levels stored for the same workspaces keep the menu up until it arrives, including offline and after a reload.
    const [storedTagLevels] = useOnyx(ONYXKEYS.COLLECTION.INSIGHTS, {selector: (dashboards) => getStoredTagLevels(dashboards, policyIDs)});
    const shownTagLevels = tagLevels ?? storedTagLevels;
    const options = getInsightsTagLevelOptions(shownTagLevels, (level) => translate('insightsPage.tagLevel', numberFormat(level)));

    const resetUnavailableTagLevel = useEffectEvent((loadedTagLevels: InsightsTagLevel[]) => {
        const tagLevel = selectedTagLevel ?? CONST.INSIGHTS.DEFAULT_TAG_LEVEL;
        const fittingTagLevel = getFittingTagLevel(tagLevel, loadedTagLevels);
        if (fittingTagLevel === tagLevel) {
            return;
        }
        setFilters({tagLevel: fittingTagLevel});
    });

    // Only the response for the selected level can show that no workspace in scope has it anymore, so the reset waits for that response.
    useEffect(() => {
        if (!tagLevels || !canChangeFilters) {
            return;
        }
        resetUnavailableTagLevel(tagLevels);
    }, [tagLevels, canChangeFilters]);

    return options;
}

export default useInsightsTagLevelOptions;
