import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';

import React from 'react';
import {View} from 'react-native';

import InsightsDateControl from './InsightsDateControl';
import InsightsGroupByDropdown from './InsightsGroupByDropdown';
import InsightsGroupCurrencyControl from './InsightsGroupCurrencyControl';
import InsightsWorkspaceControl from './InsightsWorkspaceControl';

type InsightsPageControlsProps = {
    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    onChange: (update: Partial<InsightsFilters>) => void;
};

function InsightsPageControls({filters, onChange}: InsightsPageControlsProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap2, styles.ph5, styles.pb3]}>
            <InsightsGroupByDropdown
                groupBy={filters.groupBy}
                onChange={(groupBy) => onChange({groupBy})}
            />
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
                onChange={(groupCurrency) => onChange({groupCurrency})}
            />
        </View>
    );
}

export default InsightsPageControls;
