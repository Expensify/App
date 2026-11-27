import formatChartCount from '@components/Charts/utils/formatChartCount';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import {buildChartDrillDownQuery} from '@components/Search/chartDrillDown';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import type {GroupedItem, SearchChartCountDimension, SearchGroupBy, SearchQueryJSON} from '@components/Search/types';
import {getCellAccessibilityProps, getRowAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import Text from '@components/Text';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

import type {RankingTableRow} from './buildRankingTableRows';

import InsightsRankingTableAverageMarker from './InsightsRankingTableAverageMarker';
import InsightsRankingTableChange, {formatRankingTableChange} from './InsightsRankingTableChange';

/** Smaller shares would otherwise be displayed as zero. In percentage points. */
const MIN_WRITTEN_SHARE = 0.1;

/** One-based column positions, as the table's accessibility tree numbers them */
const RANKING_TABLE_COLUMN = {
    GROUP: 1,
    SHARE: 2,
    COUNT: 3,
    VALUE: 4,
    CHANGE: 5,
} as const;

/** The column after the count, which the table fills with each group's amount unless it's given another value to show */
type InsightsRankingTableColumn = {
    title: string;
    renderCell: (item: GroupedItem) => React.ReactNode;

    /** What a screen reader announces for the cell */
    getAccessibilityText: (item: GroupedItem) => string;
};

/** Each column's position, as the table's accessibility tree numbers them. Change is undefined when the table doesn't show it. */
type RankingTableColumnIndexes = {
    group: number;
    share: number;
    count: number;
    value: number;
    change: number | undefined;

    /** How many columns the table has */
    total: number;
};

/** Numbers the columns, which depend on whether the change column shows */
function getRankingTableColumnIndexes(isComparingPreviousPeriod: boolean): RankingTableColumnIndexes {
    const lastColumn = isComparingPreviousPeriod ? RANKING_TABLE_COLUMN.CHANGE : RANKING_TABLE_COLUMN.VALUE;
    return {
        group: RANKING_TABLE_COLUMN.GROUP,
        share: RANKING_TABLE_COLUMN.SHARE,
        count: RANKING_TABLE_COLUMN.COUNT,
        value: RANKING_TABLE_COLUMN.VALUE,
        change: isComparingPreviousPeriod ? RANKING_TABLE_COLUMN.CHANGE : undefined,
        total: lastColumn,
    };
}

/** Writes a share to one decimal place, e.g. "40.8%", and a tiny one as "<0.1%" so it never reads as zero */
function formatRankingTableShare(share: number, numberFormat: LocaleContextProps['numberFormat']): string {
    const percentOptions = {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    } as const;
    return share > 0 && share < MIN_WRITTEN_SHARE ? `<${numberFormat(MIN_WRITTEN_SHARE / 100, percentOptions)}` : numberFormat(share / 100, percentOptions);
}

type InsightsRankingTableRowProps = {
    row: RankingTableRow;
    groupBy: SearchGroupBy;
    countDimension: SearchChartCountDimension;

    /** The chart's query, which a pressed row opens on Spend */
    queryJSON: Readonly<SearchQueryJSON> | undefined;

    /** Called with the row's group when pressed. Without it, the row opens on Spend, and without either the row can't be pressed. */
    onPress?: (item: GroupedItem) => void;

    /** Group cell content, the group's label text unless given */
    label?: React.ReactNode;

    valueColumn: InsightsRankingTableColumn;
    columnIndexes: RankingTableColumnIndexes;

    /** Draws the change gray in both directions */
    isChangeNeutral?: boolean;

    /** Position on the same scale as the bars, omitted outside average comparison mode */
    averageWidthPercent?: number;

    /** Zero-based data row position, excluding the header */
    rowIndex: number;
};

function InsightsRankingTableRow({
    row,
    groupBy,
    countDimension,
    queryJSON,
    onPress,
    label,
    valueColumn,
    columnIndexes,
    isChangeNeutral,
    averageWidthPercent,
    rowIndex,
}: InsightsRankingTableRowProps) {
    const {item, share, barWidthPercent, change} = row;
    const styles = useThemeStyles();
    const {translate, numberFormat} = useLocalize();
    const {cardPaddingHorizontal} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {getLabel, getFilterQuery} = CHART_GROUP_BY_CONFIG[groupBy];
    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowLayout);
    const labelText = getLabel(item);
    const formattedCount = formatChartCount(item.count, countDimension, translate, numberFormat);
    const formattedShare = formatRankingTableShare(share, numberFormat);
    const changeLabel = change ? formatRankingTableChange(change, translate, numberFormat).accessibilityLabel : undefined;
    const accessibilityLabel = [labelText, formattedCount, formattedShare, valueColumn.getAccessibilityText(item), changeLabel].filter(Boolean).join(', ');
    const labelContent = label ?? <Text style={styles.breakWord}>{labelText}</Text>;
    const changeContent = !!change && (
        <InsightsRankingTableChange
            change={change}
            isNeutral={isChangeNeutral}
        />
    );
    const cellStyle = [styles.tableRowVerticalPadding, styles.justifyContentCenter];

    const isPressable = !!onPress || !!queryJSON;
    const openRow = () => {
        if (onPress) {
            onPress(item);
            return;
        }
        if (!queryJSON) {
            return;
        }
        const query = buildChartDrillDownQuery(queryJSON, getFilterQuery(item));
        if (query) {
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
        }
    };

    if (shouldUseNarrowLayout) {
        const narrowStyle = [cardPaddingHorizontal, styles.tableRowVerticalPaddingCompact, styles.gap3, rowIndex > 0 && styles.borderTop];
        const narrowContent = (
            <>
                <View style={[styles.flexRow, styles.alignItemsStart, styles.gap3]}>
                    <View style={[styles.flex1, styles.mnw0, styles.gap1]}>
                        {labelContent}
                        <Text
                            variant="label"
                            style={styles.textSupporting}
                        >
                            {[formattedCount, formattedShare].join(` ${CONST.DOT_SEPARATOR} `)}
                        </Text>
                    </View>
                    <View style={[styles.flexShrink0, styles.alignItemsEnd, styles.gap1]}>
                        {valueColumn.renderCell(item)}
                        {changeContent}
                    </View>
                </View>
                <View style={styles.insightsRankingTableBarTrack}>
                    <View style={styles.insightsRankingTableBar(barWidthPercent)} />
                    {averageWidthPercent !== undefined && (
                        <View style={styles.insightsRankingTableAverageLineAnchor(averageWidthPercent, variables.insightsRankingTableAverageMarkerOverhang)}>
                            <InsightsRankingTableAverageMarker style={styles.flex1} />
                        </View>
                    )}
                </View>
            </>
        );

        if (!isPressable) {
            return (
                <View
                    accessible
                    accessibilityLabel={accessibilityLabel}
                    style={narrowStyle}
                >
                    {narrowContent}
                </View>
            );
        }

        return (
            <PressableWithFeedback
                onPress={openRow}
                accessibilityRole={CONST.ROLE.BUTTON}
                accessibilityLabel={accessibilityLabel}
                sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.TABLE_ROW}
                style={narrowStyle}
                hoverStyle={styles.hoveredComponentBG}
            >
                {narrowContent}
            </PressableWithFeedback>
        );
    }

    const valueCell = (
        <View
            style={[styles.insightsRankingTableNumberColumn, styles.alignItemsEnd, cellStyle]}
            {...getCellAccessibilityProps(isTableSemanticsEnabled, columnIndexes.value)}
        >
            {valueColumn.renderCell(item)}
        </View>
    );
    const changeCell = columnIndexes.change !== undefined && (
        <View
            style={[styles.insightsRankingTableChangeColumn, cellStyle]}
            {...getCellAccessibilityProps(isTableSemanticsEnabled, columnIndexes.change)}
        >
            {changeContent}
        </View>
    );
    const desktopStyle = [styles.flexRow, styles.gap5, styles.tableRowHeight, cardPaddingHorizontal, rowIndex > 0 && styles.borderTop];
    const desktopContent = (
        <>
            <View
                style={[styles.flex1, styles.mnw0, cellStyle]}
                {...getCellAccessibilityProps(isTableSemanticsEnabled, columnIndexes.group)}
            >
                {labelContent}
            </View>
            <View
                style={styles.insightsRankingTableShareColumn}
                {...getCellAccessibilityProps(isTableSemanticsEnabled, columnIndexes.share)}
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
                {...getCellAccessibilityProps(isTableSemanticsEnabled, columnIndexes.count)}
            >
                <Text>{numberFormat(item.count)}</Text>
            </View>
            {valueCell}
            {changeCell}
        </>
    );

    if (!isPressable) {
        return (
            <View
                style={desktopStyle}
                // Without table semantics the row is one element, like the pressable row, so a screen reader reads it as a whole
                accessible={!isTableSemanticsEnabled}
                accessibilityLabel={isTableSemanticsEnabled ? undefined : accessibilityLabel}
                {...getRowAccessibilityProps(isTableSemanticsEnabled, rowIndex)}
            >
                {desktopContent}
            </View>
        );
    }

    return (
        <PressableWithFeedback
            onPress={openRow}
            role={isTableSemanticsEnabled ? CONST.ROLE.ROW : CONST.ROLE.BUTTON}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.TABLE_ROW}
            style={desktopStyle}
            hoverStyle={styles.hoveredComponentBG}
            {...getRowAccessibilityProps(isTableSemanticsEnabled, rowIndex)}
        >
            {desktopContent}
        </PressableWithFeedback>
    );
}

export default InsightsRankingTableRow;
export {getRankingTableColumnIndexes};
export type {InsightsRankingTableColumn, RankingTableColumnIndexes};
