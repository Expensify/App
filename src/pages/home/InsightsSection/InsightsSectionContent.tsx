import BlockingView from '@components/BlockingViews/BlockingView';
import {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/VictoryTheme';
import ChartEmptyState from '@components/Search/ChartEmptyState';
import ChartErrorState from '@components/Search/ChartErrorState';
import SearchChartView from '@components/Search/SearchChartView';
import WidgetContainer from '@components/WidgetContainer';
import WidgetHeaderMenu from '@components/WidgetHeaderMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {setNameValuePair} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchKey} from '@libs/SearchKeyUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

import InsightTitleDropdown from './InsightTitleDropdown';
import useHomeInsightConfigs from './useHomeInsightConfigs';
import useInsightData, {INSIGHT_STATE} from './useInsightData';

function InsightsSectionContent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Expand', 'OfflineCloud']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const isInsightsPageEnabled = isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE);

    const insightConfigs = useHomeInsightConfigs();
    const [selectedKey] = useOnyx(ONYXKEYS.NVP_HOME_SELECTED_INSIGHT);

    // The persisted key can name an insight the user is no longer eligible for, so fall back to the first option.
    const config = insightConfigs.find((insightConfig) => insightConfig.key === selectedKey) ?? insightConfigs.at(0);
    const {queryJSON, groupBy, view, sortedData, state, retry} = useInsightData(config);

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
            titleContent={
                <InsightTitleDropdown
                    configs={insightConfigs}
                    selectedKey={config.key}
                    onSelect={onSelectInsight}
                />
            }
            titleRightContent={
                state === INSIGHT_STATE.READY || state === INSIGHT_STATE.EMPTY || state === INSIGHT_STATE.ERROR ? (
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
            {state === INSIGHT_STATE.OFFLINE && (
                <BlockingView
                    icon={icons.OfflineCloud}
                    iconColor={theme.offline}
                    iconWidth={variables.iconSizeUltraLarge}
                    title={translate('common.youAppearToBeOffline')}
                    titleStyles={[styles.mt0, styles.mb2]}
                    subtitle={translate('common.thisFeatureRequiresInternet')}
                    subtitleStyle={styles.textSupporting}
                    containerStyle={[{minHeight: CHART_CONTENT_MIN_HEIGHT}, styles.gap5]}
                />
            )}
            {state === INSIGHT_STATE.EMPTY && <ChartEmptyState testID="insightsSectionEmptyState" />}
            {state === INSIGHT_STATE.ERROR && <ChartErrorState onRetry={retry} />}
            {(state === INSIGHT_STATE.LOADING || state === INSIGHT_STATE.READY) && (
                <View style={[shouldUseNarrowLayout ? styles.ph5 : [styles.ph8, styles.pt3], view === CONST.SEARCH.VIEW.PIE && styles.pb6]}>
                    <SearchChartView
                        queryJSON={queryJSON}
                        view={view}
                        groupBy={groupBy}
                        data={sortedData ?? []}
                        isLoading={state === INSIGHT_STATE.LOADING}
                    />
                </View>
            )}
        </WidgetContainer>
    );
}

export default InsightsSectionContent;
