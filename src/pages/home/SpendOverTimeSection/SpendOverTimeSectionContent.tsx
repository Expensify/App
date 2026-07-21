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

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

import InsightTitleDropdown from './InsightTitleDropdown';
import useHomeInsightConfigs from './useHomeInsightConfigs';
import useInsightData, {INSIGHT_STATE} from './useSpendOverTimeData';

function InsightsSectionContent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Expand', 'OfflineCloud']);
    const illustrations = useMemoizedLazyIllustrations(['BrokenMagnifyingGlass']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const insightConfigs = useHomeInsightConfigs();
    const [selectedInsightKey = CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME] = useOnyx(ONYXKEYS.NVP_HOME_SELECTED_INSIGHT);
    // Fall back to the first insight if the persisted key ever points at an option that isn't available.
    const activeConfig = insightConfigs.find((config) => config.key === selectedInsightKey) ?? insightConfigs.at(0);

    const {query, queryJSON, groupBy, view, sortedData, state} = useInsightData(activeConfig);

    const handleSelectInsight = (key: SearchKey) => {
        if (key === selectedInsightKey) {
            return;
        }
        setNameValuePair(ONYXKEYS.NVP_HOME_SELECTED_INSIGHT, key, selectedInsightKey);
    };

    if (!query || !queryJSON || !view || !groupBy || view === CONST.SEARCH.VIEW.TABLE || state === INSIGHT_STATE.HIDDEN) {
        return null;
    }

    return (
        <WidgetContainer
            titleContent={
                <InsightTitleDropdown
                    configs={insightConfigs}
                    selectedKey={activeConfig?.key ?? selectedInsightKey}
                    onSelect={handleSelectInsight}
                />
            }
            titleRightContent={
                state === INSIGHT_STATE.READY ? (
                    <WidgetHeaderMenu
                        testID="insightsOverflowMenu"
                        sentryLabel="InsightsOverflowMenu"
                        menuItems={[
                            {
                                text: translate('common.view'),
                                icon: icons.Expand,
                                onSelected: () => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query})),
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
                    containerStyle={[{minHeight: CHART_CONTENT_MIN_HEIGHT}, styles.gap5]}
                    contentFitImage="contain"
                />
            )}
            {(state === INSIGHT_STATE.LOADING || state === INSIGHT_STATE.READY) && (
                <View style={[shouldUseNarrowLayout ? styles.ph5 : [styles.ph8, styles.pt3]]}>
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
