import ChartEmptyState from '@components/Search/ChartEmptyState';
import ChartErrorState from '@components/Search/ChartErrorState';
import ChartOfflineState from '@components/Search/ChartOfflineState';
import SearchChartView from '@components/Search/SearchChartView';
import WidgetContainer from '@components/WidgetContainer';
import WidgetHeaderMenu from '@components/WidgetHeaderMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {setNameValuePair} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import {INSIGHTS_CHART_STATE} from '@libs/resolveInsightsChartData';
import type {SearchKey} from '@libs/SearchKeyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

import InsightTitleDropdown from './InsightTitleDropdown';
import useHomeInsightConfigs from './useHomeInsightConfigs';
import useInsightData from './useInsightData';

function InsightsSectionContent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Expand']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const isInsightsPageEnabled = isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE);

    const {configs: insightConfigs, isResolved: isConfigResolved} = useHomeInsightConfigs();
    const [selectedKey, selectedKeyMetadata] = useOnyx(ONYXKEYS.NVP_HOME_SELECTED_INSIGHT);

    // The persisted key can name an insight the user is no longer eligible for, so fall back to the first option.
    const config = insightConfigs.find((insightConfig) => insightConfig.key === selectedKey) ?? insightConfigs.at(0);
    const {queryJSON, groupBy, view, data, state, retry} = useInsightData(config, isConfigResolved && selectedKeyMetadata.status === 'loaded');

    const onSelectInsight = (key: SearchKey) => {
        if (key === config?.key) {
            return;
        }
        setNameValuePair(ONYXKEYS.NVP_HOME_SELECTED_INSIGHT, key, config?.key ?? key);
    };

    if (!config || !queryJSON || !groupBy) {
        return null;
    }

    return (
        <WidgetContainer
            containerStyles={styles.overflowVisible}
            titleContent={
                <InsightTitleDropdown
                    configs={insightConfigs}
                    selectedKey={config.key}
                    onSelect={onSelectInsight}
                />
            }
            titleRightContent={
                state === INSIGHTS_CHART_STATE.READY || state === INSIGHTS_CHART_STATE.EMPTY || state === INSIGHTS_CHART_STATE.ERROR ? (
                    <WidgetHeaderMenu
                        testID="insightsOverflowMenu"
                        sentryLabel="InsightsOverflowMenu"
                        menuItems={[
                            {
                                text: translate('common.view'),
                                icon: icons.Expand,
                                onSelected: () =>
                                    Navigation.navigate(
                                        isInsightsPageEnabled
                                            ? ROUTES.INSIGHTS.getRoute(CONST.INSIGHTS.DASHBOARD.SPEND)
                                            : ROUTES.SEARCH_ROOT.getRoute({query: config.searchQuery, searchKey: config.key}),
                                    ),
                                shouldCallAfterModalHide: true,
                            },
                        ]}
                    />
                ) : null
            }
        >
            {state === INSIGHTS_CHART_STATE.OFFLINE && <ChartOfflineState />}
            {state === INSIGHTS_CHART_STATE.EMPTY && <ChartEmptyState testID="insightsSectionEmptyState" />}
            {state === INSIGHTS_CHART_STATE.ERROR && <ChartErrorState onRetry={retry} />}
            {(state === INSIGHTS_CHART_STATE.LOADING || state === INSIGHTS_CHART_STATE.READY) && (
                <View style={shouldUseNarrowLayout ? [styles.ph5, styles.pb5] : [styles.ph8, styles.pt3, styles.pb8]}>
                    <SearchChartView
                        queryJSON={queryJSON}
                        view={view}
                        groupBy={groupBy}
                        data={data}
                        isLoading={state === INSIGHTS_CHART_STATE.LOADING}
                        shouldShowGroupLabels={!isInsightsPageEnabled}
                    />
                </View>
            )}
        </WidgetContainer>
    );
}

export default InsightsSectionContent;
