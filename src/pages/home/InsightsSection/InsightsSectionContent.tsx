import BlockingView from '@components/BlockingViews/BlockingView';
import {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/VictoryTheme';
import SearchChartView from '@components/Search/SearchChartView';
import WidgetContainer from '@components/WidgetContainer';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {setNameValuePair} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchKey} from '@libs/SearchUIUtils';

import WidgetHeaderMenu from '@pages/home/common/WidgetHeaderMenu/WidgetHeaderMenu';
import HomeSectionEmptyState from '@pages/home/HomeSectionEmptyState';

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
    const illustrations = useMemoizedLazyIllustrations(['BrokenMagnifyingGlass', 'Chart']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

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
                                onSelected: () => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: config.searchQuery})),
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
            {state === INSIGHT_STATE.EMPTY && (
                <HomeSectionEmptyState
                    testID="insightsSectionEmptyState"
                    illustration={illustrations.Chart}
                    title={translate('homePage.insightsSection.chartUnavailable')}
                    description={translate('homePage.insightsSection.notEnoughData')}
                />
            )}
            {state === INSIGHT_STATE.ERROR && (
                <BlockingView
                    icon={illustrations.BrokenMagnifyingGlass}
                    iconHeight={variables.iconSizeMegaLarge}
                    title={translate('errorPage.title', {
                        isBreakLine: shouldUseNarrowLayout,
                    })}
                    titleStyles={[styles.mt0, styles.mb2]}
                    subtitle={translate('errorPage.subtitle')}
                    subtitleStyle={styles.textSupporting}
                    containerStyle={[{minHeight: CHART_CONTENT_MIN_HEIGHT}, styles.gap5, styles.pb5]}
                    contentFitImage="contain"
                    buttonTranslationKey="common.tryAgain"
                    onButtonPress={retry}
                />
            )}
            {(state === INSIGHT_STATE.LOADING || state === INSIGHT_STATE.READY) && (
                <View style={[shouldUseNarrowLayout ? styles.ph6 : [styles.ph8, styles.pt3], view === CONST.SEARCH.VIEW.PIE && styles.pb6]}>
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
