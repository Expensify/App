/** A Handled by table row offering a workspace admin to add an AI agent or create the stage's rule, with a button opening the setting. */
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
import type {RankingTableColumnIndexes} from './InsightsRankingTableRow';

import {HANDLED_BY_SETUP_ROW} from './getHandledBySetupRows';
import InsightsHandledBySource from './InsightsHandledBySource';

type InsightsHandledBySetupRowProps = {
    type: HandledBySetupRow;
    stage: InsightsHandledByStage;
    policyID: string;

    /** Zero-based data row position, excluding the header */
    rowIndex: number;

    /** The table's column positions, so the cells line up with the rows above */
    columnIndexes: RankingTableColumnIndexes;
};

function InsightsHandledBySetupRow({type, stage, policyID, rowIndex, columnIndexes}: InsightsHandledBySetupRowProps) {
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

    const label = translate(isAgentRow ? 'insightsPage.handledBy.source.agent' : 'insightsPage.handledBy.source.rules');
    const description = translate(isAgentRow ? `insightsPage.handledBy.agentSetup.${stage}` : `insightsPage.handledBy.ruleSetup.${stage}`);
    const iconName = isAgentRow ? 'Bot' : 'Bolt';
    const button = (
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={CONST.BUTTON_SIZE.SMALL}
            onPress={openSetting}
            sentryLabel={isAgentRow ? CONST.SENTRY_LABEL.INSIGHTS.HANDLED_BY_SET_UP_AGENT : CONST.SENTRY_LABEL.INSIGHTS.HANDLED_BY_CREATE_RULE}
        >
            <Button.Text>{translate(isAgentRow ? 'insightsPage.handledBy.setUp' : 'insightsPage.handledBy.create')}</Button.Text>
        </Button>
    );

    if (shouldUseNarrowLayout) {
        return (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, cardPaddingHorizontal, styles.tableRowVerticalPaddingCompact, rowIndex > 0 && styles.borderTop]}>
                <View style={[styles.flex1, styles.mnw0]}>
                    <InsightsHandledBySource
                        label={label}
                        iconName={iconName}
                        description={description}
                        isSetup
                    />
                </View>
                <View style={styles.flexShrink0}>{button}</View>
            </View>
        );
    }

    const cellStyle = [styles.tableRowVerticalPadding, styles.justifyContentCenter];

    return (
        <View
            style={[styles.flexRow, styles.gap5, styles.tableRowHeight, cardPaddingHorizontal, rowIndex > 0 && styles.borderTop]}
            {...getRowAccessibilityProps(isTableSemanticsEnabled, rowIndex)}
        >
            <View
                style={[styles.flex1, styles.mnw0, cellStyle]}
                {...getCellAccessibilityProps(isTableSemanticsEnabled, columnIndexes.group)}
            >
                <InsightsHandledBySource
                    label={label}
                    iconName={iconName}
                    isSetup
                />
            </View>
            <View
                style={[styles.insightsRankingTableShareColumn, cellStyle]}
                {...getCellAccessibilityProps(isTableSemanticsEnabled, columnIndexes.share)}
            >
                <Text style={[styles.textSupporting, styles.textAlignCenter]}>{description}</Text>
            </View>
            <View
                style={styles.insightsRankingTableNumberColumn}
                {...getCellAccessibilityProps(isTableSemanticsEnabled, columnIndexes.count)}
            />
            {columnIndexes.change !== undefined && (
                <View
                    style={styles.insightsRankingTableChangeColumn}
                    {...getCellAccessibilityProps(isTableSemanticsEnabled, columnIndexes.change)}
                />
            )}
            <View
                style={[styles.insightsRankingTableNumberColumn, styles.alignItemsEnd, cellStyle]}
                {...getCellAccessibilityProps(isTableSemanticsEnabled, columnIndexes.value)}
            >
                {button}
            </View>
        </View>
    );
}

export default InsightsHandledBySetupRow;
