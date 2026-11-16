import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ScrollView from '@components/ScrollView';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsCaptureRef} from '@pages/Insights/exportInsightsDashboard/types';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
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

    /** Limits the workspace control to the workspaces the dashboard reports on, or lists every workspace when absent */
    isPolicyAvailable?: (policy: Policy) => boolean;
    onExport: () => Promise<void>;
    isExportDisabled?: boolean;
    isExporting?: boolean;
    captureRef?: InsightsCaptureRef;
};

function InsightsPageControls({filters, defaultFilters, onChange, isPolicyAvailable, onExport, isExportDisabled = false, isExporting = false, captureRef}: InsightsPageControlsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {pageGutter} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Export']);

    const controls = (
        <>
            <InsightsDateControl
                value={filters.date}
                onChange={(date) => onChange({date})}
            />
            <InsightsCompareControl
                value={filters.compare}
                defaultValue={defaultFilters.compare}
                onChange={(compare) => onChange({compare})}
            />
            <InsightsWorkspaceControl
                value={filters.policyIDs}
                onChange={(policyIDs) => onChange({policyIDs})}
                isPolicyAvailable={isPolicyAvailable}
            />
            <InsightsGroupCurrencyControl
                value={filters.groupCurrency}
                defaultValue={defaultFilters.groupCurrency}
                onChange={(groupCurrency) => onChange({groupCurrency})}
            />
        </>
    );

    // Keep the label visible during export so the captured button does not become an empty loading state.
    const exportButton = (
        <Button
            size={CONST.BUTTON_SIZE.SMALL}
            onPress={onExport}
            isDisabled={isExportDisabled || isExporting}
            stayNormalOnDisable={isExporting}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_EXPORT}
            testID="InsightsExportButton"
        >
            {isExporting ? (
                <ActivityIndicator
                    size={variables.iconSizeSmall}
                    color={theme.text}
                />
            ) : (
                <Button.Icon src={icons.Export} />
            )}
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
                <View
                    ref={captureRef ? viewRef(captureRef) : undefined}
                    collapsable={false}
                    testID="InsightsCaptureControls"
                    style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}
                >
                    {controls}
                    {exportButton}
                </View>
            </ScrollView>
        );
    }

    return (
        <View
            ref={captureRef ? viewRef(captureRef) : undefined}
            collapsable={false}
            testID="InsightsCaptureControls"
            style={[styles.flexRow, styles.flexWrap, styles.flexShrink1, styles.alignItemsCenter, styles.gap2]}
        >
            {controls}
            {exportButton}
        </View>
    );
}

export default InsightsPageControls;
