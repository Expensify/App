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

import {formatPercentOfTotal} from './buildChartSeries';
import InsightsDataTableSkeleton from './InsightsDataTableSkeleton';

/** Placeholder rows while loading */
const SKELETON_ROW_COUNT = 5;

type InsightsDataTableProps = {
    /** The plotted groups, prepared by `SearchChartView` */
    rows: SearchChartDataRow[];

    /** The chart type the rows are plotted on */
    view: ChartView;

    /** The dimension the rows are grouped by */
    groupBy: SearchGroupBy;

    isLoading?: boolean;
};

/** Narrows a group to the member-based variants, the ones carrying the person's avatar and account ID. */
function isMemberGroup(item: GroupedItem): item is TransactionMemberGroupListItemType | TransactionCardGroupListItemType {
    return item.groupedBy === CONST.SEARCH.GROUP_BY.FROM || item.groupedBy === CONST.SEARCH.GROUP_BY.CARD;
}

function InsightsDataTable({rows, view, groupBy, isLoading}: InsightsDataTableProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

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

    const shouldShowColorDot = view === CONST.SEARCH.VIEW.PIE;

    return (
        <View style={styles.chartInlineTable}>
            {rows.map((row, index) => {
                const {item, point, color} = row;
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
                                {item.percentOfTotal !== undefined && (
                                    <Text style={styles.mutedNormalTextLabel}>
                                        {translate('search.percentOfSpend', {percent: formatPercentOfTotal(item.percentOfTotal, item.total ?? 0, preferredLocale)})}
                                    </Text>
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
