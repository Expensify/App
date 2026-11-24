/**
 * Builds the rows of the Exclude panel: every item of a ranking chart with data for the dashboard's filters, ranked and valued the way the chart ranks them,
 * plus the saved exclusions with no data for the filters, so they can still be removed. Excluded items open at the top.
 */
import formatChartCount from '@components/Charts/utils/formatChartCount';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import {getAverageDuration, hasChartedValue} from '@components/Search/chartMetricValue';
import useGroupedItems from '@components/Search/hooks/useGroupedItems';
import type {GroupedItem} from '@components/Search/types';
import type {ListItem} from '@components/SelectionList/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';

import {getDecodedCategoryName} from '@libs/CategoryUtils';
import DateUtils from '@libs/DateUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';

import type {InsightsChartSpec, InsightsRankedItems} from '@pages/Insights/dashboardSpecs';
import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import {getExclusionItemKey} from '@pages/Insights/insightsExclusions';
import {applyInsightsFilters, buildDashboardQuery} from '@pages/Insights/insightsQueries';
import normalizeInsightsSnapshot from '@pages/Insights/normalizeInsightsSnapshot';
import useInsightsFilters from '@pages/Insights/useInsightsFilters';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';

type InsightsExcludeListItem = ListItem & {
    /** Key the item is excluded by */
    value: string;
};

/** A ranking chart that offers Exclude */
type InsightsExcludeChart = InsightsChartSpec & {rankedItems: InsightsRankedItems};

type UseInsightsExcludeItemsParams = {
    dashboardID: InsightsDashboardID;
    chart: InsightsExcludeChart;

    /** Keys of the items checked in the panel */
    selectedItemKeys: string[];

    /** Keys excluded when the panel opened, which stay at the top while the user checks and unchecks rows */
    initialSelectedItemKeys: string[];
};

/** Whether the chart ranks people, whose rows show an avatar and whose keys are account IDs */
function isPeopleChart(rankedItems: InsightsRankedItems): boolean {
    return rankedItems !== CONST.INSIGHTS.RANKED_ITEMS.MERCHANTS && rankedItems !== CONST.INSIGHTS.RANKED_ITEMS.CATEGORIES && rankedItems !== CONST.INSIGHTS.RANKED_ITEMS.TAGS;
}

function useInsightsExcludeItems({dashboardID, chart, selectedItemKeys, initialSelectedItemKeys}: UseInsightsExcludeItemsParams): InsightsExcludeListItem[] {
    const {translate, numberFormat} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {filters, isResolved} = useInsightsFilters(dashboardID);
    const queryJSON = isResolved && chart.groupBy ? buildDashboardQuery(applyInsightsFilters(chart, filters), dashboardID) : undefined;
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash}`);
    // Every ranked item, not only the ones the chart shows, so an item can be excluded before it moves up
    const rankedItems = useGroupedItems(normalizeInsightsSnapshot(snapshot, queryJSON?.groupBy), queryJSON && {...queryJSON, limit: undefined});
    const isPeople = isPeopleChart(chart.rankedItems);
    const itemsWithData = (rankedItems ?? []).filter((item) => item.count > 0 && hasChartedValue(item, chart.metric));
    const keysWithData = new Set(itemsWithData.map(getExclusionItemKey));
    // An exclusion with no data stays listed after the user unchecks it, so it can be checked again before saving
    const excludedKeysWithoutData = [...new Set([...initialSelectedItemKeys, ...selectedItemKeys])].filter((key) => !keysWithData.has(key));
    const [personalDetails] = usePersonalDetailsByIDs(isPeople ? excludedKeysWithoutData.map(Number) : undefined);
    const countDimension = INSIGHTS_DASHBOARD_SPECS[dashboardID].countDimension ?? CONST.SEARCH.CHART_COUNT_DIMENSION.EXPENSE;
    const groupBy = chart.groupBy;

    const formatValue = (item: GroupedItem): string => {
        if (chart.metric === CONST.SEARCH.CHART_METRIC.COUNT) {
            return formatChartCount(item.count, countDimension, translate, numberFormat);
        }
        if (chart.metric === CONST.SEARCH.CHART_METRIC.DURATION) {
            return DateUtils.formatAverageDuration(getAverageDuration(item) ?? 0, translate, numberFormat);
        }
        return convertToDisplayString(item.total ?? 0, item.currency);
    };

    const rowsWithData: InsightsExcludeListItem[] = itemsWithData.flatMap((item) => {
        const key = getExclusionItemKey(item);
        if (key === undefined || !groupBy) {
            return [];
        }
        const text = CHART_GROUP_BY_CONFIG[groupBy].getLabel(item);
        const avatar = 'avatar' in item && 'accountID' in item ? {source: item.avatar, accountID: item.accountID} : undefined;
        return [
            {
                keyForList: key,
                value: key,
                text,
                alternateText: formatValue(item),
                isSelected: selectedItemKeys.includes(key),
                icons: avatar ? [{source: avatar.source ?? '', type: CONST.ICON_TYPE_AVATAR, name: text, id: avatar.accountID}] : undefined,
            },
        ];
    });

    const rowsWithoutData: InsightsExcludeListItem[] = excludedKeysWithoutData.map((key) => {
        const member = isPeople ? personalDetails?.[Number(key)] : undefined;
        let text = key;
        if (isPeople) {
            text = member?.displayName ?? member?.login ?? key;
        } else if (chart.rankedItems === CONST.INSIGHTS.RANKED_ITEMS.CATEGORIES) {
            text = getDecodedCategoryName(key);
        }
        return {
            keyForList: key,
            value: key,
            text,
            isSelected: selectedItemKeys.includes(key),
            icons: isPeople ? [{source: member?.avatar ?? '', type: CONST.ICON_TYPE_AVATAR, name: text, id: Number(key)}] : undefined,
        };
    });

    // Every list pins the excluded items, however short, so they're easy to find and remove
    return moveInitialSelectionToTop([...rowsWithData, ...rowsWithoutData], initialSelectedItemKeys, 0);
}

export default useInsightsExcludeItems;
export type {InsightsExcludeChart, InsightsExcludeListItem};
