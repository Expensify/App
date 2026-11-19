/** A Handled by table row for one source with reports: its share drawn as a bar, its report count, how the count changed, and its average time. */
import formatChartCount from '@components/Charts/utils/formatChartCount';
import {getCellAccessibilityProps, getRowAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import Text from '@components/Text';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import type {InsightsHandledByStage} from '@pages/Insights/dashboardSpecs';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

import type {RankingTableRow} from './buildRankingTableRows';
import type {InsightsHandledBySourceIcon} from './InsightsHandledBySource';

import InsightsHandledBySource from './InsightsHandledBySource';
import InsightsRankingTableChange, {formatRankingTableChange} from './InsightsRankingTableChange';
import {formatRankingTableShare} from './InsightsRankingTableRow';

/** Each column's position, as the table's accessibility tree numbers them. Average time moves up one when there's no change column. */
const HANDLED_BY_TABLE_COLUMN = {
    SOURCE: 1,
    SHARE: 2,
    REPORTS: 3,
    CHANGE: 4,
} as const;

/** Returns the average time column's position, which follows the change column when the table shows one */
function getHandledByAverageTimeColumn(isComparingPreviousPeriod: boolean): number {
    return isComparingPreviousPeriod ? HANDLED_BY_TABLE_COLUMN.CHANGE + 1 : HANDLED_BY_TABLE_COLUMN.CHANGE;
}

const SOURCE_ICONS: Partial<Record<ValueOf<typeof CONST.INSIGHTS.HANDLED_BY_SOURCE>, InsightsHandledBySourceIcon>> = {
    [CONST.INSIGHTS.HANDLED_BY_SOURCE.PEOPLE]: 'Users',
    [CONST.INSIGHTS.HANDLED_BY_SOURCE.RULES]: 'Bolt',
};

type InsightsHandledByTableRowProps = {
    row: RankingTableRow;
    stage: InsightsHandledByStage;

    /** Zero-based data row position, excluding the header */
    rowIndex: number;

    /** Whether the page compares against the previous period, which adds the change column */
    isComparingPreviousPeriod: boolean;
};

function InsightsHandledByTableRow({row, stage, rowIndex, isComparingPreviousPeriod}: InsightsHandledByTableRowProps) {
    const {item, share, barWidthPercent, change} = row;
    const styles = useThemeStyles();
    const {translate, numberFormat} = useLocalize();
    const {cardPaddingHorizontal} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowLayout);

    if (item.groupedBy !== CONST.SEARCH.GROUP_BY.HANDLED_BY) {
        return null;
    }

    const isAgent = item.handledBy === CONST.INSIGHTS.HANDLED_BY_SOURCE.AGENT;
    let description: string | undefined;
    if (isAgent) {
        description = translate('insightsPage.handledBy.source.agent');
    } else if (item.handledBy === CONST.INSIGHTS.HANDLED_BY_SOURCE.RULES) {
        description = translate(`insightsPage.handledBy.ruleSetting.${stage}`);
    }
    const formattedShare = formatRankingTableShare(share, numberFormat);
    const formattedCount = formatChartCount(item.count, CONST.SEARCH.CHART_COUNT_DIMENSION.REPORT, translate, numberFormat);
    const formattedTime = item.averageDuration === null ? CONST.INSIGHTS.NO_CHANGE_PLACEHOLDER : DateUtils.formatHandlingTime(item.averageDuration, translate, numberFormat);
    const changeLabel = change ? formatRankingTableChange(change, translate, numberFormat).accessibilityLabel : undefined;
    const accessibilityLabel = [item.formattedHandledBy, description, formattedCount, formattedShare, changeLabel, formattedTime].filter(Boolean).join(', ');
    const source = (
        <InsightsHandledBySource
            label={item.formattedHandledBy}
            description={description}
            iconName={SOURCE_ICONS[item.handledBy]}
            agentAccountID={isAgent ? item.accountID : undefined}
            agentAvatar={item.avatar}
        />
    );

    if (shouldUseNarrowLayout) {
        return (
            <View
                accessible
                accessibilityLabel={accessibilityLabel}
                style={[cardPaddingHorizontal, styles.tableRowVerticalPaddingCompact, styles.gap3, rowIndex > 0 && styles.borderTop]}
            >
                <View style={[styles.flexRow, styles.alignItemsStart, styles.gap3]}>
                    <View style={[styles.flex1, styles.mnw0, styles.gap1]}>
                        {source}
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.flexWrap, styles.gap1]}>
                            <Text
                                variant="label"
                                style={styles.textSupporting}
                            >
                                {formattedCount}
                            </Text>
                            {!!change && (
                                <InsightsRankingTableChange
                                    change={change}
                                    isNeutral
                                />
                            )}
                            <Text
                                variant="label"
                                style={styles.textSupporting}
                            >
                                {`${CONST.DOT_SEPARATOR} ${formattedShare}`}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.flexShrink0}>{formattedTime}</Text>
                </View>
                <View style={styles.insightsRankingTableBarTrack}>
                    <View style={styles.insightsRankingTableBar(barWidthPercent)} />
                </View>
            </View>
        );
    }

    const cellStyle = [styles.tableRowVerticalPadding, styles.justifyContentCenter];
    const averageTimeColumn = getHandledByAverageTimeColumn(isComparingPreviousPeriod);

    return (
        <View
            style={[styles.flexRow, styles.gap5, styles.tableRowHeight, cardPaddingHorizontal, rowIndex > 0 && styles.borderTop]}
            {...getRowAccessibilityProps(isTableSemanticsEnabled, rowIndex)}
        >
            <View
                style={[styles.flex1, styles.mnw0, cellStyle]}
                {...getCellAccessibilityProps(isTableSemanticsEnabled, HANDLED_BY_TABLE_COLUMN.SOURCE)}
            >
                {source}
            </View>
            <View
                style={styles.insightsRankingTableShareColumn}
                {...getCellAccessibilityProps(isTableSemanticsEnabled, HANDLED_BY_TABLE_COLUMN.SHARE)}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                    <View style={styles.insightsRankingTableBar(barWidthPercent)} />
                    <Text
                        variant="micro"
                        style={[styles.textSupporting, styles.noWrap, styles.ph2]}
                    >
                        {formattedShare}
                    </Text>
                </View>
            </View>
            <View
                style={[styles.insightsRankingTableNumberColumn, cellStyle]}
                {...getCellAccessibilityProps(isTableSemanticsEnabled, HANDLED_BY_TABLE_COLUMN.REPORTS)}
            >
                <Text>{numberFormat(item.count)}</Text>
            </View>
            {isComparingPreviousPeriod && (
                <View
                    style={[styles.insightsRankingTableChangeColumn, cellStyle]}
                    {...getCellAccessibilityProps(isTableSemanticsEnabled, HANDLED_BY_TABLE_COLUMN.CHANGE)}
                >
                    {!!change && (
                        <InsightsRankingTableChange
                            change={change}
                            isNeutral
                        />
                    )}
                </View>
            )}
            <View
                style={[styles.insightsRankingTableNumberColumn, styles.alignItemsEnd, cellStyle]}
                {...getCellAccessibilityProps(isTableSemanticsEnabled, averageTimeColumn)}
            >
                <Text>{formattedTime}</Text>
            </View>
        </View>
    );
}

export default InsightsHandledByTableRow;
export {getHandledByAverageTimeColumn, HANDLED_BY_TABLE_COLUMN};
