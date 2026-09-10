import UserAvatar from '@components/Avatar/UserAvatar';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {TransactionCardGroupListItemType, TransactionMemberGroupListItemType} from './SearchList/ListItem/types';
import type {ChartView, GroupedItem, SearchChartDataRow, SearchGroupBy} from './types';

import {getPercentOfTotal} from './buildChartSeries';
import InsightsDataTableSkeleton from './InsightsDataTableSkeleton';

/** Placeholder rows while loading. Matches the row count the ranking charts typically come back with. */
const SKELETON_ROW_COUNT = 5;

type InsightsDataTableProps = {
    /** The plotted groups, prepared by `SearchChartView` */
    rows: SearchChartDataRow[];

    /** The chart type the rows are plotted on */
    view: ChartView;

    /** The dimension the rows are grouped by */
    groupBy: SearchGroupBy;

    isLoading?: boolean;

    /**
     * Total spend of the whole search window, used as the denominator of each row's share.
     * Falling back to the listed rows would make the shares add up to 100% even when the search
     * returned more groups than the chart plots, so we only do that when the window total is missing.
     */
    total?: number;
};

/** Narrows a group to the member-based variants, the ones carrying the person's avatar and account ID. */
function isMemberGroup(item: GroupedItem): item is TransactionMemberGroupListItemType | TransactionCardGroupListItemType {
    return item.groupedBy === CONST.SEARCH.GROUP_BY.FROM || item.groupedBy === CONST.SEARCH.GROUP_BY.CARD;
}

/** Matches the chart tooltip's rounding, so a group reads the same on hover and in the table. */
function formatPercent(percent: number) {
    const rounded = Math.round(percent);
    return rounded < 1 ? '<1%' : `${rounded}%`;
}

/**
 * Lists the groups plotted on a chart, one row each, with the numbers the chart's shape doesn't
 * already make obvious: the expense count, the amount, and the group's share of total spend.
 *
 * It renders from the same prepared rows the chart plots, so the two always agree on the values
 * and their order. Hand it to `SearchChartView` through its `renderDetails` prop.
 */
function InsightsDataTable({rows, view, groupBy, isLoading, total}: InsightsDataTableProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (isLoading) {
        return <InsightsDataTableSkeleton fixedNumItems={SKELETON_ROW_COUNT} />;
    }

    if (rows.length === 0) {
        return null;
    }

    const windowTotal = total ?? rows.reduce((sum, row) => sum + Math.abs(row.item.total ?? 0), 0);
    const shouldShowColorDot = view === CONST.SEARCH.VIEW.PIE;
    const shouldShowAvatar = groupBy === CONST.SEARCH.GROUP_BY.FROM || groupBy === CONST.SEARCH.GROUP_BY.CARD;

    return (
        <View style={styles.chartDataTable}>
            {rows.map((row, index) => {
                const {item, point, color} = row;
                const percent = getPercentOfTotal(item.total, windowTotal);
                const details = [
                    translate('iou.expenseCount', {count: item.count}),
                    convertToDisplayString(item.total ?? 0, item.currency),
                    percent === undefined ? undefined : translate('search.percentOfSpend', {percent: formatPercent(percent)}),
                ]
                    .filter((detail): detail is string => !!detail)
                    .join(` ${CONST.DOT_SEPARATOR} `);

                return (
                    <View
                        key={item.keyForList}
                        style={[styles.chartDataTableRow, shouldUseNarrowLayout && styles.chartDataTableRowNarrow, index === rows.length - 1 && styles.chartDataTableRowLast]}
                    >
                        <View style={styles.chartDataTableGroup}>
                            {shouldShowColorDot && !!color && <View style={[styles.pieChartLegendDot, {backgroundColor: color}]} />}
                            {shouldShowAvatar && isMemberGroup(item) && (
                                <UserAvatar
                                    size={CONST.AVATAR_SIZE.XXX_SMALL}
                                    source={item.avatar}
                                    accountID={item.accountID}
                                />
                            )}
                            <Text
                                numberOfLines={1}
                                style={[styles.textNormal, styles.flexShrink1]}
                            >
                                {point.label}
                            </Text>
                        </View>
                        <Text style={styles.textLabelSupporting}>{details}</Text>
                    </View>
                );
            })}
        </View>
    );
}

InsightsDataTable.displayName = 'InsightsDataTable';

export default InsightsDataTable;
