import VictoryTheme from '@components/Charts/VictoryTheme';
import type {SearchGroupBy, SearchView} from '@components/Search/types';

import {isShareWorthDrawing} from '@libs/PercentageUtils';

import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

import type {RankingGroup} from './insightsDetailsItem';

import {getRankingItemKey} from './insightsDetailsItem';

type ChartGroup = RankingGroup & {
    total?: number;
};

function isChartGroup(value: unknown): value is ChartGroup {
    return typeof value === 'object' && value !== null && 'total' in value;
}

/**
 * Returns the color a ranking graph draws the item in, which follows the item's rank, like the chart's own coloring.
 * Like the chart, it keeps only the top groups by total, then ranks bars by total and donut slices by size, leaving slices too small to draw without a color.
 * Falls back to the default chart color when the chart doesn't draw the item.
 */
function getInsightsItemColor(data: SearchResults['data'] | undefined, groupBy: SearchGroupBy | undefined, view: SearchView | undefined, limit: number | undefined, itemKey: string): string {
    if (!data || !groupBy) {
        return VictoryTheme.colors.default;
    }
    const isPie = view === CONST.SEARCH.VIEW.PIE;
    const getRankValue = (group: ChartGroup) => (isPie ? Math.abs(group.total ?? 0) : (group.total ?? 0));
    const groups = Object.entries(data)
        .flatMap(([key, group]) => (key.startsWith(CONST.SEARCH.GROUP_PREFIX) && isChartGroup(group) ? [group] : []))
        .sort((first, second) => (second.total ?? 0) - (first.total ?? 0))
        .slice(0, limit);
    const pieTotal = groups.reduce((sum, group) => sum + Math.abs(group.total ?? 0), 0);
    const rankedGroups = groups
        .filter((group) => !isPie || (pieTotal > 0 && isShareWorthDrawing((Math.abs(group.total ?? 0) / pieTotal) * 100)))
        .sort((first, second) => getRankValue(second) - getRankValue(first));
    const rank = rankedGroups.findIndex((group) => getRankingItemKey(groupBy, group) === itemKey);
    return rank < 0 ? VictoryTheme.colors.default : VictoryTheme.colors.getColor(rank);
}

export default getInsightsItemColor;
