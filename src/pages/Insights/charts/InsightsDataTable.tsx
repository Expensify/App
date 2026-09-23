import UserAvatar from '@components/Avatar/UserAvatar';
import type {TransactionCardGroupListItemType, TransactionMemberGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {ChartView, GroupedItem, SearchChartDataRow, SearchGroupBy} from '@components/Search/types';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {formatPercentOfTotal} from '@libs/PercentageUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

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
function isMemberGroupBy(groupBy: SearchGroupBy) {
    return groupBy === CONST.SEARCH.GROUP_BY.FROM || groupBy === CONST.SEARCH.GROUP_BY.CARD;
}

function isMemberGroup(item: GroupedItem): item is TransactionMemberGroupListItemType | TransactionCardGroupListItemType {
    return isMemberGroupBy(item.groupedBy);
}

function InsightsDataTable({rows, view, groupBy, isLoading}: InsightsDataTableProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, preferredLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const shouldShowAvatar = isMemberGroupBy(groupBy);

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
                        style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pv4, styles.ph4, !isLastRow && styles.borderBottom]}
                    >
                        {shouldShowColorDot && <View style={[styles.pieChartLegendDot, !!color && StyleUtils.getBackgroundColorStyle(color)]} />}
                        {isMemberGroup(item) && (
                            <UserAvatar
                                size={CONST.AVATAR_SIZE.DEFAULT}
                                source={item.avatar}
                                accountID={item.accountID}
                            />
                        )}
                        <View style={[styles.flex1, styles.flexColumn, styles.gap1, styles.alignSelfStretch]}>
                            <Text numberOfLines={1}>{point.label}</Text>
                            <Text
                                numberOfLines={1}
                                style={styles.mutedNormalTextLabel}
                            >
                                {translate('iou.expenseCount', {count: item.count})}
                            </Text>
                        </View>
                        <View style={[styles.flexColumn, styles.alignItemsEnd, styles.gap1, styles.alignSelfStretch]}>
                            <Text>{convertToDisplayString(item.total ?? 0, item.currency)}</Text>
                            {point.percentOfTotal !== undefined && (
                                <Text style={styles.mutedNormalTextLabel}>
                                    {translate('search.percentOfSpend', {percent: formatPercentOfTotal(point.percentOfTotal, item.total ?? 0, preferredLocale)})}
                                </Text>
                            )}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

export default InsightsDataTable;
