import BlockingView from '@components/BlockingViews/BlockingView';
import {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/VictoryTheme';
import SearchChartView from '@components/Search/SearchChartView';
import WidgetContainer from '@components/WidgetContainer';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import WidgetHeaderMenu from '@pages/home/common/WidgetHeaderMenu/WidgetHeaderMenu';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

import InsightTitleDropdown from './InsightTitleDropdown';
import useHomeInsights from './useHomeInsights';
import {INSIGHT_STATE} from './useInsightData';

function InsightsSectionContent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Expand', 'OfflineCloud']);
    const illustrations = useMemoizedLazyIllustrations(['BrokenMagnifyingGlass']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {displayed, state, dropdownConfigs, onSelectInsight} = useHomeInsights();
    const {config, query, queryJSON, groupBy, view, sortedData} = displayed ?? {};

    if (!config || !query || !queryJSON || !view || !groupBy || view === CONST.SEARCH.VIEW.TABLE || state === INSIGHT_STATE.HIDDEN) {
        return null;
    }

    return (
        <WidgetContainer
            titleContent={
                <InsightTitleDropdown
                    configs={dropdownConfigs}
                    selectedKey={config.key}
                    onSelect={onSelectInsight}
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
