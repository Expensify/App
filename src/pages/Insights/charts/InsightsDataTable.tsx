import UserAvatar from '@components/Avatar/UserAvatar';
import type {ChartValueFormatter} from '@components/Charts/types';
import {formatChangePercentage} from '@components/Charts/utils/formatTooltipComparison';
import Icon from '@components/Icon';
import {CHART_SERIES_KEY} from '@components/Search/buildChartSeries';
import type {TransactionCardGroupListItemType, TransactionMemberGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {GroupedItem, SearchChartDataRow, SearchChartMetric} from '@components/Search/types';
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

    /** The metric the chart plotted, which the table lists the same way */
    metric: SearchChartMetric;

    /** Formats a plotted value the way the chart labelled it, left out while the chart labels amounts */
    formatValue?: ChartValueFormatter;

    isLoading?: boolean;
};

/** Narrows a group to the member-based variants, the ones carrying the person's avatar and account ID. */
function isMemberGroup(item: GroupedItem): item is TransactionMemberGroupListItemType | TransactionCardGroupListItemType {
    return item.groupedBy === CONST.SEARCH.GROUP_BY.FROM || item.groupedBy === CONST.SEARCH.GROUP_BY.CARD;
}

function InsightsDataTable({rows, metric, formatValue, isLoading}: InsightsDataTableProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong']);
    const {preferredLocale, translate, numberFormat} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {cardPaddingHorizontal} = useLayoutSpacing();

    /** Writes a group's value the way the chart labelled it */
    const formatGroupValue = (item: GroupedItem, value: number) => {
        if (metric !== CONST.SEARCH.CHART_METRIC.COUNT) {
            // An amount is written in its own group's currency, which the chart's single unit cannot carry.
            return convertToDisplayString(item.total ?? 0, item.currency);
        }
        return formatValue?.(value) ?? numberFormat(value);
    };

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
                            <Text style={styles.textAlignRight}>{formatGroupValue(item, primaryValue ?? 0)}</Text>
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
