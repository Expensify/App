/** The ranking table set up for Handled by: who finished a workflow stage, with each source's average time, and setup rows for a workspace admin under them. */
import type {ChartComparison} from '@components/Search/buildChartSeries';
import type {GroupedItem} from '@components/Search/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import type {InsightsHandledByStage} from '@pages/Insights/dashboardSpecs';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

import type {InsightsHandledBySourceIcon} from './InsightsHandledBySource';
import type {InsightsRankingTableColumn} from './InsightsRankingTableRow';

import InsightsHandledBySetupRow from './InsightsHandledBySetupRow';
import InsightsHandledBySource from './InsightsHandledBySource';
import InsightsRankingTable from './InsightsRankingTable';
import useHandledBySetupRows from './useHandledBySetupRows';

/** Rows the loading skeleton shows: people, an agent and rules */
const SKELETON_ROW_COUNT = 3;

const SOURCE_ICONS: Record<ValueOf<typeof CONST.INSIGHTS.HANDLED_BY_SOURCE>, InsightsHandledBySourceIcon> = {
    [CONST.INSIGHTS.HANDLED_BY_SOURCE.PEOPLE]: 'Users',
    [CONST.INSIGHTS.HANDLED_BY_SOURCE.AGENT]: 'Bot',
    [CONST.INSIGHTS.HANDLED_BY_SOURCE.RULES]: 'Bolt',
};

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

    isLoading?: boolean;
};

function InsightsHandledByTable({title, data, comparison, isComparingPreviousPeriod, stage, policyIDs, isLoading}: InsightsHandledByTableProps) {
    const styles = useThemeStyles();
    const {translate, numberFormat} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {setupRows, setupPolicyID} = useHandledBySetupRows(policyIDs, stage);
    // A row of zeros says nothing, so sources that finished no reports are left out
    const sources = data.filter((item) => item.count > 0);

    const formatAverageTime = (item: GroupedItem) => {
        if (item.groupedBy !== CONST.SEARCH.GROUP_BY.HANDLED_BY || item.averageDuration === null) {
            return CONST.INSIGHTS.NO_CHANGE_PLACEHOLDER;
        }
        return DateUtils.formatHandlingTime(item.averageDuration, translate, numberFormat);
    };
    const averageTimeColumn: InsightsRankingTableColumn = {
        title: translate('insightsPage.handledBy.averageTimeColumn'),
        renderCell: (item) => <Text>{formatAverageTime(item)}</Text>,
        getAccessibilityText: formatAverageTime,
    };

    const renderSource = (item: GroupedItem) =>
        item.groupedBy === CONST.SEARCH.GROUP_BY.HANDLED_BY ? (
            <InsightsHandledBySource
                label={item.formattedHandledBy}
                iconName={SOURCE_ICONS[item.handledBy]}
            />
        ) : null;

    return (
        <View style={!shouldUseNarrowLayout && styles.pt1}>
            <InsightsRankingTable
                title={title}
                data={sources}
                groupBy={CONST.SEARCH.GROUP_BY.HANDLED_BY}
                countDimension={CONST.SEARCH.CHART_COUNT_DIMENSION.REPORT}
                rowLimit={SKELETON_ROW_COUNT}
                comparison={isComparingPreviousPeriod ? comparison : undefined}
                isComparingPreviousPeriod={isComparingPreviousPeriod}
                isLoading={isLoading}
                groupColumnTitle={translate('insightsPage.handledBy.sourceColumn')}
                renderLabel={renderSource}
                valueColumn={averageTimeColumn}
                isChangeNeutral
                // The design runs the last row to the card's bottom edge
                shouldPadBottom={false}
                extraRows={
                    setupPolicyID
                        ? {
                              count: setupRows.length,
                              render: (firstRowIndex, columnIndexes) =>
                                  setupRows.map((setupRow, index) => (
                                      <InsightsHandledBySetupRow
                                          key={setupRow}
                                          type={setupRow}
                                          stage={stage}
                                          policyID={setupPolicyID}
                                          rowIndex={firstRowIndex + index}
                                          columnIndexes={columnIndexes}
                                      />
                                  )),
                          }
                        : undefined
                }
            />
        </View>
    );
}

export default InsightsHandledByTable;
