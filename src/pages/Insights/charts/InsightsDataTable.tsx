import UserAvatar from '@components/Avatar/UserAvatar';
import type {ChartSeries} from '@components/Charts';
import Icon from '@components/Icon';
import type {TransactionCardGroupListItemType, TransactionMemberGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {GroupedItem, SearchChartDataRow} from '@components/Search/types';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {format} from '@libs/NumberFormatUtils';

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

    /** Plotted series, primary first */
    series: ChartSeries[];

    isLoading?: boolean;
};

/** Narrows a group to the member-based variants, the ones carrying the person's avatar and account ID. */
function isMemberGroup(item: GroupedItem): item is TransactionMemberGroupListItemType | TransactionCardGroupListItemType {
    return item.groupedBy === CONST.SEARCH.GROUP_BY.FROM || item.groupedBy === CONST.SEARCH.GROUP_BY.CARD;
}

/** Change relative to the previous period. A group the previous period didn't have counts as an infinite change. */
function getRelativeChange(current: number, previous: number): number {
    if (previous === 0) {
        return current === 0 ? 0 : Math.sign(current) * Infinity;
    }

    return (current - previous) / Math.abs(previous);
}

function InsightsDataTable({rows, series, isLoading}: InsightsDataTableProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong']);
    const {preferredLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (isLoading) {
        return <InsightsDataTableSkeleton fixedNumItems={SKELETON_ROW_COUNT} />;
    }

    if (rows.length === 0) {
        return null;
    }

    const isComparing = series.length > 1;

    const getChangeColor = (relativeChange: number) => {
        if (relativeChange === 0) {
            return theme.textSupporting;
        }
        return relativeChange > 0 ? theme.danger : theme.successHover;
    };

    return (
        <View style={[styles.chartInlineTable, shouldUseNarrowLayout ? styles.ph5 : styles.ph8]}>
            {rows.map(({item, comparisonItem, point, color}) => {
                const indicatorColor = color ?? series.at(0)?.color;
                const relativeChange = isComparing ? getRelativeChange(item.total ?? 0, comparisonItem?.total ?? 0) : undefined;

                return (
                    <View
                        key={item.keyForList}
                        style={[styles.flexRow, styles.alignItemsStart, styles.gap5]}
                    >
                        <View style={[styles.flex1, styles.mnw0, styles.flexRow, styles.alignItemsStart, styles.gap5]}>
                            {isMemberGroup(item) ? (
                                <View style={[styles.chartInlineTableAvatarBorder, !!indicatorColor && StyleUtils.getBorderColorStyle(indicatorColor)]}>
                                    <UserAvatar
                                        size={CONST.AVATAR_SIZE.XXX_SMALL}
                                        source={item.avatar}
                                        accountID={item.accountID}
                                    />
                                </View>
                            ) : (
                                <View style={[styles.chartInlineTableDot, !!indicatorColor && StyleUtils.getBackgroundColorStyle(indicatorColor)]} />
                            )}
                            <Text style={[styles.flex1, styles.mnw0, styles.breakWord]}>{point.label}</Text>
                        </View>
                        <View style={[styles.flexShrink0, styles.alignItemsEnd]}>
                            <Text style={styles.textAlignRight}>{convertToDisplayString(item.total ?? 0, item.currency)}</Text>
                            {relativeChange !== undefined && (
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gapHalf]}>
                                    {relativeChange !== 0 && (
                                        <Icon
                                            src={relativeChange > 0 ? icons.ArrowUpLong : icons.ArrowDownLong}
                                            fill={getChangeColor(relativeChange)}
                                            width={variables.iconSizeXXSmall}
                                            height={variables.iconSizeXXSmall}
                                        />
                                    )}
                                    <Text style={[styles.textLabel, StyleUtils.getColorStyle(getChangeColor(relativeChange))]}>
                                        {format(preferredLocale, relativeChange, {style: 'percent', maximumFractionDigits: 1, signDisplay: 'never'})}
                                    </Text>
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
