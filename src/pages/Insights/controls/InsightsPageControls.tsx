import Button from '@components/Button';
import ScrollView from '@components/ScrollView';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsCaptureRef} from '@pages/Insights/exportInsightsDashboard/types';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';

import CONST from '@src/CONST';
import viewRef from '@src/types/utils/viewRef';

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
    onExport: () => Promise<void>;
    isExportDisabled?: boolean;
    isExporting?: boolean;
    captureRef?: InsightsCaptureRef;
};

function InsightsPageControls({filters, defaultFilters, onChange, onExport, isExportDisabled = false, isExporting = false, captureRef}: InsightsPageControlsProps) {
    const styles = useThemeStyles();
    const {pageGutter} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Export']);

    const controls = (
        <View
            ref={captureRef ? viewRef(captureRef) : undefined}
            collapsable={false}
            style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, !shouldUseNarrowLayout && [styles.flexWrap, styles.flexShrink1]]}
        >
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
        </View>
    );

    const exportButton = (
        <Button
            size={CONST.BUTTON_SIZE.SMALL}
            onPress={onExport}
            isDisabled={isExportDisabled}
            isLoading={isExporting}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_EXPORT}
            testID="InsightsExportButton"
        >
            <Button.Icon src={icons.Export} />
            <Button.Text style={styles.textMicroBold}>{translate('common.export')}</Button.Text>
        </Button>
    );

    if (shouldUseNarrowLayout) {
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                style={[styles.flexGrow0, styles.flexShrink0, styles.pb5]}
                contentContainerStyle={[styles.flexRow, styles.alignItemsCenter, styles.gap2, pageGutter]}
            >
                {controls}
                {exportButton}
            </ScrollView>
        );
    }

    return (
        <View style={[styles.flex1, styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap2]}>
            {controls}
            {exportButton}
        </View>
    );
}

export default InsightsPageControls;
