import ScrollView from '@components/ScrollView';

import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import InsightsCompareControl from './InsightsCompareControl';
import InsightsDateControl from './InsightsDateControl';
import InsightsGroupCurrencyControl from './InsightsGroupCurrencyControl';
import InsightsWorkspaceControl from './InsightsWorkspaceControl';

type InsightsPageControlsProps = {
    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    /** Filters the dashboard starts from, which a control's Reset returns to */
    defaultFilters: InsightsFilters;

    onChange: (update: Partial<InsightsFilters>) => void;
};

function InsightsPageControls({filters, defaultFilters, onChange}: InsightsPageControlsProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();

    const controls = (
        <>
            <InsightsDateControl
                value={filters.date}
                onChange={(date) => onChange({date})}
            />
            {isBetaEnabled(CONST.BETAS.INSIGHTS_COMPARE) && (
                <InsightsCompareControl
                    value={filters.compare}
                    onChange={(compare) => onChange({compare})}
                />
            )}
            <InsightsWorkspaceControl
                value={filters.policyIDs}
                onChange={(policyIDs) => onChange({policyIDs})}
            />
            <InsightsGroupCurrencyControl
                value={filters.groupCurrency}
                defaultValue={defaultFilters.groupCurrency}
                onChange={(groupCurrency) => onChange({groupCurrency})}
            />
        </>
    );

    if (shouldUseNarrowLayout) {
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                style={[styles.flexGrow0, styles.flexShrink0, styles.pb5]}
                contentContainerStyle={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.ph3]}
            >
                {controls}
            </ScrollView>
        );
    }

    return (
        <View style={[styles.ph5, styles.pb5, styles.insightsPageControlsContainer]}>
            <View style={[styles.centeredContentWidthLimiter, styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap2]}>{controls}</View>
        </View>
    );
}

export default InsightsPageControls;
