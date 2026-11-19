/** Table splitting the reports that finished a workflow stage between people, each AI agent and rules, with setup rows for a workspace admin under them. */
import {COUNT_COLUMN_TITLE_KEYS} from '@components/Charts/utils/formatChartCount';
import type {ChartComparison} from '@components/Search/buildChartSeries';
import ChartEmptyState from '@components/Search/ChartEmptyState';
import {SortableHeaderLabel} from '@components/Search/SortableHeaderText';
import type {GroupedItem} from '@components/Search/types';
import {
    getColumnHeaderAccessibilityProps,
    getRowAccessibilityProps,
    getRowGroupAccessibilityProps,
    getTableContainerAccessibilityProps,
    shouldUseTableSemantics,
} from '@components/Table/tableAccessibility';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsHandledByStage} from '@pages/Insights/dashboardSpecs';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import buildHandledByRows from './buildHandledByRows';
import getHandledBySetupRows from './getHandledBySetupRows';
import InsightsDataTableSkeleton from './InsightsDataTableSkeleton';
import InsightsHandledBySetupRow from './InsightsHandledBySetupRow';
import InsightsHandledByTableRow, {getHandledByAverageTimeColumn, HANDLED_BY_TABLE_COLUMN} from './InsightsHandledByTableRow';

/** Rows the loading skeleton shows: people, an agent and rules */
const SKELETON_ROW_COUNT = 3;

type InsightsHandledByTableProps = {
    /** Names the table to screen readers */
    title: string;

    /** The sources, sorted by count, most first */
    data: GroupedItem[];

    comparison: ChartComparison | undefined;

    /** Whether the page compares against the previous period, which adds the change column */
    isComparingPreviousPeriod: boolean;

    stage: InsightsHandledByStage;

    /** The workspaces the page's Workspace filter picked, which decide whether setup rows show */
    policyIDs: string[];

    /** Locates the empty state, shown when the stage has no reports and no setup rows */
    emptyStateTestID: string;

    isLoading?: boolean;
};

function InsightsHandledByTable({title, data, comparison, isComparingPreviousPeriod, stage, policyIDs, emptyStateTestID, isLoading}: InsightsHandledByTableProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {cardPaddingHorizontal, cardPaddingBottom} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {login} = useCurrentUserPersonalDetails();
    // Setup rows change one workspace, so only the workspace picked alone is read
    const setupPolicyID = policyIDs.length === 1 ? policyIDs.at(0) : undefined;
    const setupPolicy = usePolicy(setupPolicyID);

    if (isLoading) {
        // The column headers: a label line, its padding and the divider below
        const headerHeight = variables.tableHeaderContentHeight + 2 * styles.pv2.paddingVertical + variables.borderTopWidth;
        // A narrow row: its padding, the name, description and count lines with the gaps between, the gap above the bar, the bar and the divider
        const narrowRowHeight =
            2 * variables.tableRowPaddingVerticalCompact +
            variables.fontSizeNormalHeight +
            2 * (styles.gap1.gap + variables.lineHeightNormal) +
            styles.gap3.gap +
            variables.insightsRankingTableBarHeight +
            variables.borderTopWidth;

        return (
            <View style={!shouldUseNarrowLayout && cardPaddingBottom}>
                <InsightsDataTableSkeleton
                    fixedNumItems={SKELETON_ROW_COUNT}
                    shouldShowIndicator={false}
                    rowHeight={shouldUseNarrowLayout ? narrowRowHeight : variables.tableRowHeight}
                    topOffset={shouldUseNarrowLayout ? variables.borderTopWidth : headerHeight}
                />
            </View>
        );
    }

    const rows = buildHandledByRows({data, comparison, isComparingPreviousPeriod});
    const setupRows = getHandledBySetupRows({policyIDs, policy: setupPolicy, login, stage});
    if (rows.length === 0 && setupRows.length === 0) {
        return <ChartEmptyState testID={emptyStateTestID} />;
    }

    const renderRows = () => (
        <>
            {rows.map((row, index) => (
                <InsightsHandledByTableRow
                    key={row.item.keyForList}
                    row={row}
                    stage={stage}
                    rowIndex={index}
                    isComparingPreviousPeriod={isComparingPreviousPeriod}
                />
            ))}
            {!!setupPolicyID &&
                setupRows.map((setupRow, index) => (
                    <InsightsHandledBySetupRow
                        key={setupRow}
                        type={setupRow}
                        stage={stage}
                        policyID={setupPolicyID}
                        rowIndex={rows.length + index}
                        isComparingPreviousPeriod={isComparingPreviousPeriod}
                    />
                ))}
        </>
    );

    if (shouldUseNarrowLayout) {
        return <View style={styles.borderTop}>{renderRows()}</View>;
    }

    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowLayout);
    const headerLabelStyle = [styles.tableHeaderContentHeight, styles.pv2];
    const averageTimeColumn = getHandledByAverageTimeColumn(isComparingPreviousPeriod);

    return (
        <View style={cardPaddingBottom}>
            <View {...getTableContainerAccessibilityProps(isTableSemanticsEnabled, title, rows.length + setupRows.length, averageTimeColumn)}>
                <View
                    style={[styles.flexRow, styles.gap5, cardPaddingHorizontal, styles.borderBottom]}
                    {...getRowAccessibilityProps(isTableSemanticsEnabled, 0, true)}
                >
                    <View
                        style={[styles.flex1, styles.mnw0]}
                        {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, false, false, undefined, HANDLED_BY_TABLE_COLUMN.SOURCE)}
                    >
                        <SortableHeaderLabel
                            text={translate('insightsPage.handledBy.sourceColumn')}
                            isActive={false}
                            sortOrder={CONST.SEARCH.SORT_ORDER.DESC}
                            innerContainerStyle={headerLabelStyle}
                        />
                    </View>
                    <View
                        style={styles.insightsRankingTableShareColumn}
                        {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, false, false, undefined, HANDLED_BY_TABLE_COLUMN.SHARE)}
                    >
                        <View style={styles.flex1}>
                            <SortableHeaderLabel
                                text={translate('insightsPage.share')}
                                isActive={false}
                                sortOrder={CONST.SEARCH.SORT_ORDER.DESC}
                                innerContainerStyle={headerLabelStyle}
                            />
                        </View>
                    </View>
                    <View
                        style={styles.insightsRankingTableNumberColumn}
                        {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, true, true, CONST.SEARCH.SORT_ORDER.DESC, HANDLED_BY_TABLE_COLUMN.REPORTS)}
                    >
                        <SortableHeaderLabel
                            text={translate(COUNT_COLUMN_TITLE_KEYS[CONST.SEARCH.CHART_COUNT_DIMENSION.REPORT])}
                            isActive
                            sortOrder={CONST.SEARCH.SORT_ORDER.DESC}
                            innerContainerStyle={headerLabelStyle}
                        />
                    </View>
                    {isComparingPreviousPeriod && (
                        <View
                            style={styles.insightsRankingTableChangeColumn}
                            {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, false, false, undefined, HANDLED_BY_TABLE_COLUMN.CHANGE)}
                        >
                            <SortableHeaderLabel
                                text={translate('insightsPage.compare.percentChange')}
                                isActive={false}
                                sortOrder={CONST.SEARCH.SORT_ORDER.DESC}
                                innerContainerStyle={headerLabelStyle}
                            />
                        </View>
                    )}
                    <View
                        style={[styles.insightsRankingTableNumberColumn, styles.alignItemsEnd]}
                        {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, false, false, undefined, averageTimeColumn)}
                    >
                        <SortableHeaderLabel
                            text={translate('insightsPage.handledBy.averageTimeColumn')}
                            isActive={false}
                            sortOrder={CONST.SEARCH.SORT_ORDER.DESC}
                            innerContainerStyle={headerLabelStyle}
                        />
                    </View>
                </View>
                <View {...getRowGroupAccessibilityProps(isTableSemanticsEnabled)}>{renderRows()}</View>
            </View>
        </View>
    );
}

export default InsightsHandledByTable;
