import UserAvatar from '@components/Avatar/UserAvatar';
import type {ChartDataPoint, ChartValueFormatter} from '@components/Charts/types';
import {formatChangePercentage} from '@components/Charts/utils/formatTooltipComparison';
import formatValueWithNote from '@components/Charts/utils/formatValueWithNote';
import Icon from '@components/Icon';
import {CHART_SERIES_KEY} from '@components/Search/buildChartSeries';
import type {TransactionCardGroupListItemType, TransactionMemberGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {GroupedItem, SearchChartDataRow} from '@components/Search/types';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import InsightsDataTableSkeleton from './InsightsDataTableSkeleton';

/** Placeholder rows while loading */
const SKELETON_ROW_COUNT = 5;

type InsightsDataTableProps = {
    /** The plotted groups, prepared by `SearchChartView` */
    rows: SearchChartDataRow[];

    /** Formats a plotted value the way the chart labelled it. Absent when values are amounts, which the table writes in each group's own currency instead. */
    formatValue?: ChartValueFormatter;

    isLoading?: boolean;
};

/** Narrows a group to the member-based variants, the ones carrying the person's avatar and account ID. */
function isMemberGroup(item: GroupedItem): item is TransactionMemberGroupListItemType | TransactionCardGroupListItemType {
    return item.groupedBy === CONST.SEARCH.GROUP_BY.FROM || item.groupedBy === CONST.SEARCH.GROUP_BY.CARD;
}

function InsightsDataTable({rows, formatValue, isLoading}: InsightsDataTableProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong']);
    const {preferredLocale, translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {cardPaddingHorizontal} = useLayoutSpacing();

    /** Writes a group's value the way the chart labelled it, followed by the money behind it when the value isn't money */
    const formatGroupValue = (point: ChartDataPoint, item: GroupedItem, value: number) =>
        formatValue ? formatValueWithNote(formatValue(value), point.seriesTotals?.[CHART_SERIES_KEY.PRIMARY]) : convertToDisplayString(item.total ?? 0, item.currency);

    if (isLoading) {
        return <InsightsDataTableSkeleton fixedNumItems={SKELETON_ROW_COUNT} />;
    }

    if (rows.length === 0) {
        return null;
    }

    return (
        <View style={[styles.chartInlineTable, cardPaddingHorizontal]}>
            {rows.map(({item, point}) => {
                // Only time buckets have points without a group, and the table lists ranked groups
                if (!item) {
                    return null;
                }
                const primaryValue = point.values[CHART_SERIES_KEY.PRIMARY];
                const comparedValue = point.values[CHART_SERIES_KEY.COMPARISON];
                const hasChange = primaryValue !== undefined && comparedValue !== undefined && primaryValue !== comparedValue;
                const changePercentage = hasChange ? formatChangePercentage(primaryValue, comparedValue, preferredLocale) : undefined;
                const isIncrease = hasChange && primaryValue > comparedValue;
                const isNewSpend = comparedValue === 0;
                const changeColor = StyleUtils.getSpendChangeColor(isIncrease);

                return (
                    <View
                        key={item.keyForList}
                        style={[styles.flexRow, styles.alignItemsStart, styles.gap5]}
                    >
                        <View style={[styles.flex1, styles.mnw0, styles.flexRow, styles.alignItemsStart, styles.gap5]}>
                            {isMemberGroup(item) ? (
                                <View style={[styles.chartInlineTableAvatarBorder, !!point.color && StyleUtils.getBorderColorStyle(point.color)]}>
                                    <UserAvatar
                                        size={CONST.AVATAR_SIZE.XXX_SMALL}
                                        source={item.avatar}
                                        accountID={item.accountID}
                                    />
                                </View>
                            ) : (
                                <View style={[styles.chartInlineTableDot, !!point.color && StyleUtils.getBackgroundColorStyle(point.color)]} />
                            )}
                            <Text style={[styles.flex1, styles.mnw0, styles.breakWord]}>{point.label}</Text>
                        </View>
                        <View style={[styles.flexShrink0, styles.alignItemsEnd]}>
                            <Text style={styles.textAlignRight}>{formatGroupValue(point, item, primaryValue ?? 0)}</Text>
                            {!!changePercentage && isNewSpend && (
                                <Text
                                    style={[styles.textLabel, StyleUtils.getColorStyle(theme.icon)]}
                                    accessibilityLabel={translate('common.new')}
                                >
                                    {changePercentage}
                                </Text>
                            )}
                            {!!changePercentage && !isNewSpend && (
                                <View
                                    style={[styles.flexRow, styles.alignItemsCenter, styles.gapHalf]}
                                    accessible
                                    accessibilityLabel={translate(isIncrease ? 'insightsPage.compare.increase' : 'insightsPage.compare.decrease', changePercentage)}
                                >
                                    <Icon
                                        src={isIncrease ? icons.ArrowUpLong : icons.ArrowDownLong}
                                        fill={changeColor}
                                        width={variables.iconSizeXXSmall}
                                        height={variables.iconSizeXXSmall}
                                    />
                                    <Text style={[styles.textLabel, StyleUtils.getColorStyle(changeColor)]}>{changePercentage}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

export default InsightsDataTable;
