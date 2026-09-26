import ScrollView from '@components/ScrollView';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';

import React from 'react';
import {View} from 'react-native';

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

    const controls = (
        <>
            <InsightsDateControl
                value={filters.date}
                onChange={(date) => onChange({date})}
            />
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
                style={[styles.flexGrow0, styles.flexShrink0, styles.pb3]}
                contentContainerStyle={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.ph5]}
            >
                {controls}
            </ScrollView>
        );
    }

    return <View style={[styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap2, styles.ph5, styles.pb3]}>{controls}</View>;
}

export default InsightsPageControls;
