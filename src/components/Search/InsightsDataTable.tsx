import UserAvatar from '@components/Avatar/UserAvatar';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {TransactionCardGroupListItemType, TransactionMemberGroupListItemType} from './SearchList/ListItem/types';
import type {ChartView, GroupedItem, SearchChartDataRow, SearchGroupBy} from './types';

import {formatPercentOfTotal, getPercentOfTotal} from './buildChartSeries';
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

/**
 * Lists the groups plotted on a chart, one row each, with the numbers the chart's shape doesn't
 * already make obvious: the expense count, the amount, and the group's share of total spend.
 *
 * A row reads as two columns of two lines: the group and its expense count on the left, the amount
 * and its share on the right. It renders from the same prepared rows the chart plots, so the two
 * always agree on the values and their order. Hand it to `SearchChartView` through `renderDetails`.
 */
function InsightsDataTable({rows, view, groupBy, isLoading, total}: InsightsDataTableProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    // Only people get an avatar, so the skeleton has to know before any row exists.
    const shouldShowAvatar = groupBy === CONST.SEARCH.GROUP_BY.FROM || groupBy === CONST.SEARCH.GROUP_BY.CARD;

    if (isLoading) {
        return (
            <InsightsDataTableSkeleton
                fixedNumItems={SKELETON_ROW_COUNT}
                shouldShowAvatar={shouldShowAvatar}
            />
        );
    }

    if (rows.length === 0) {
        return null;
    }

    const windowTotal = total ?? rows.reduce((sum, row) => sum + Math.abs(row.item.total ?? 0), 0);
    const shouldShowColorDot = view === CONST.SEARCH.VIEW.PIE;

    return (
        <View style={styles.chartDataTable}>
            {rows.map((row, index) => {
                const {item, point, color} = row;
                const percent = getPercentOfTotal(item.total, windowTotal);
                const isLastRow = index === rows.length - 1;

                return (
                    <View
                        key={item.keyForList}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pv3, !isLastRow && styles.borderBottom]}
                    >
                        {shouldShowColorDot && !!color && <View style={[styles.pieChartLegendDot, {backgroundColor: color}]} />}
                        {shouldShowAvatar && isMemberGroup(item) && (
                            <UserAvatar
                                size={CONST.AVATAR_SIZE.DEFAULT}
                                source={item.avatar}
                                accountID={item.accountID}
                            />
                        )}
                        <View style={[styles.flex1, styles.flexColumn, styles.gap1]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                                <Text
                                    numberOfLines={1}
                                    style={styles.flexShrink1}
                                >
                                    {point.label}
                                </Text>
                                <Text>{convertToDisplayString(item.total ?? 0, item.currency)}</Text>
                            </View>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                                <Text
                                    numberOfLines={1}
                                    style={styles.mutedNormalTextLabel}
                                >
                                    {translate('iou.expenseCount', {count: item.count})}
                                </Text>
                                {percent !== undefined && (
                                    <Text style={styles.mutedNormalTextLabel}>{translate('search.percentOfSpend', {percent: formatPercentOfTotal(percent, preferredLocale)})}</Text>
                                )}
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

InsightsDataTable.displayName = 'InsightsDataTable';

export default InsightsDataTable;
