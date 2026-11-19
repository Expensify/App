/** A Handled by table row offering a workspace admin to add an AI agent or turn on the stage's rule, with a button opening the setting. */
import Button from '@components/Button';
import {getCellAccessibilityProps, getRowAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import Text from '@components/Text';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import type {InsightsHandledByStage} from '@pages/Insights/dashboardSpecs';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

import type {HandledBySetupRow} from './getHandledBySetupRows';

import {HANDLED_BY_SETUP_ROW} from './getHandledBySetupRows';
import InsightsHandledBySource from './InsightsHandledBySource';
import {getHandledByAverageTimeColumn, HANDLED_BY_TABLE_COLUMN} from './InsightsHandledByTableRow';

type InsightsHandledBySetupRowProps = {
    type: HandledBySetupRow;
    stage: InsightsHandledByStage;
    policyID: string;

    /** Zero-based data row position, excluding the header */
    rowIndex: number;

    /** Whether the page compares against the previous period, which adds an empty change cell */
    isComparingPreviousPeriod: boolean;
};

function InsightsHandledBySetupRow({type, stage, policyID, rowIndex, isComparingPreviousPeriod}: InsightsHandledBySetupRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {cardPaddingHorizontal} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowLayout);
    const isAgentRow = type === HANDLED_BY_SETUP_ROW.AGENT;

    const openSetting = () => {
        if (isAgentRow) {
            Navigation.navigate(ROUTES.WORKSPACE_AGENTS.getRoute(policyID));
            return;
        }
        // Auto-approve compliant reports lives on the Workflows page's Advanced tab, and Submissions on its own tab
        const tab = stage === CONST.INSIGHTS.HANDLED_BY_STAGE.APPROVE ? CONST.TAB.WORKFLOWS.ADVANCED : CONST.TAB.WORKFLOWS.SUBMISSIONS;
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID, tab));
    };

    const source = (
        <InsightsHandledBySource
            label={translate(isAgentRow ? 'insightsPage.handledBy.source.agent' : 'insightsPage.handledBy.source.rules')}
            description={translate(isAgentRow ? `insightsPage.handledBy.agentSetup.${stage}` : `insightsPage.handledBy.ruleSetting.${stage}`)}
            iconName={isAgentRow ? 'Bot' : 'Bolt'}
        />
    );
    const button = (
        <Button
            size={CONST.BUTTON_SIZE.SMALL}
            onPress={openSetting}
            sentryLabel={isAgentRow ? CONST.SENTRY_LABEL.INSIGHTS.HANDLED_BY_SET_UP_AGENT : CONST.SENTRY_LABEL.INSIGHTS.HANDLED_BY_TURN_ON_RULE}
        >
            <Button.Text>{translate(isAgentRow ? 'insightsPage.handledBy.setUp' : 'insightsPage.handledBy.turnOn')}</Button.Text>
        </Button>
    );

    if (shouldUseNarrowLayout) {
        return (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, cardPaddingHorizontal, styles.tableRowVerticalPaddingCompact, rowIndex > 0 && styles.borderTop]}>
                {source}
                <View style={styles.flexShrink0}>{button}</View>
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
                style={[styles.insightsRankingTableShareColumn, cellStyle]}
                {...getCellAccessibilityProps(isTableSemanticsEnabled, HANDLED_BY_TABLE_COLUMN.SHARE)}
            >
                <Text style={styles.textSupporting}>{CONST.INSIGHTS.NO_CHANGE_PLACEHOLDER}</Text>
            </View>
            <View
                style={[styles.insightsRankingTableNumberColumn, cellStyle]}
                {...getCellAccessibilityProps(isTableSemanticsEnabled, HANDLED_BY_TABLE_COLUMN.REPORTS)}
            >
                <Text style={styles.textSupporting}>{CONST.INSIGHTS.NO_CHANGE_PLACEHOLDER}</Text>
            </View>
            {isComparingPreviousPeriod && (
                <View
                    style={styles.insightsRankingTableChangeColumn}
                    {...getCellAccessibilityProps(isTableSemanticsEnabled, HANDLED_BY_TABLE_COLUMN.CHANGE)}
                />
            )}
            <View
                style={[styles.insightsRankingTableNumberColumn, styles.alignItemsEnd, cellStyle]}
                {...getCellAccessibilityProps(isTableSemanticsEnabled, averageTimeColumn)}
            >
                {button}
            </View>
        </View>
    );
}

export default InsightsHandledBySetupRow;
