import {useRoute} from '@react-navigation/native';
import React from 'react';
import {ScrollView, View} from 'react-native';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchChartView from '@components/Search/SearchChartView';
import SearchChartWrapper from '@components/Search/SearchChartWrapper';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import useDocumentTitle from '@hooks/useDocumentTitle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getInsightConfig, getInsightTabFromUrlSlug, INSIGHTS_TAB_ORDER} from '@libs/InsightsUtils';
import Navigation from '@libs/Navigation/Navigation';
import EmptySearchView from '@pages/Search/EmptySearchView';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import useInsightsChartData from './useInsightsChartData';

function InsightsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    useDocumentTitle(translate('common.insights'));
    const icons = useMemoizedLazyExpensifyIcons(['User', 'Folder', 'Basket', 'CalendarSolid']);
    const route = useRoute();
    const tabSlug = (route.params as {tab?: string} | undefined)?.tab;

    const activeTabScreen = getInsightTabFromUrlSlug(tabSlug);
    const {queryJSON, groupBy, view, sortedData, isLoading} = useInsightsChartData(activeTabScreen);

    const tabs = INSIGHTS_TAB_ORDER.map((screen) => {
        const config = getInsightConfig(screen);
        return {
            key: screen,
            title: translate(config.translationPath),
            icon: icons[config.icon],
            route: config.route,
            screenName: screen,
        };
    });

    const onTabPress = (key: string) => {
        const matching = tabs.find((tab) => tab.key === key);
        if (!matching) {
            return;
        }
        Navigation.navigate(matching.route as Route);
    };

    const shouldRenderChart = !!queryJSON && !!groupBy && view !== undefined && view !== CONST.SEARCH.VIEW.TABLE;
    const shouldShowEmptyState = shouldRenderChart && !isLoading && !sortedData?.length;

    const topBar = (
        <TopBar
            breadcrumbLabel={translate('common.insights')}
            shouldDisplayHelpButton
            shouldRemoveHorizontalMargin
            shouldDisplayAccountAvatar
        />
    );

    return (
        <ScreenWrapper
            testID="InsightsPage"
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicatorInWideScreen
        >
            {shouldUseNarrowLayout && topBar}
            <ScrollView contentContainerStyle={styles.homePageContentContainer}>
                {!shouldUseNarrowLayout && topBar}
                <View style={[{width: '100%', maxWidth: variables.contentMaxWidth, alignSelf: 'center'}, styles.flexRow, styles.pt1]}>
                    <TabSelectorContextProvider activeTabKey={activeTabScreen}>
                        <TabSelectorBase
                            tabs={tabs}
                            activeTabKey={activeTabScreen}
                            onTabPress={onTabPress}
                        />
                    </TabSelectorContextProvider>
                </View>
                {shouldRenderChart && !shouldShowEmptyState && (
                    <View style={[styles.homePageCenteredContent, styles.mt3]}>
                        <SearchChartWrapper
                            title={translate(`search.chartTitles.${groupBy}`)}
                            groupBy={groupBy}
                        >
                            <SearchChartView
                                queryJSON={queryJSON}
                                view={view}
                                groupBy={groupBy}
                                data={sortedData ?? []}
                                isLoading={isLoading}
                            />
                        </SearchChartWrapper>
                    </View>
                )}
                {shouldShowEmptyState && (
                    <EmptySearchView
                        similarSearchHash={queryJSON?.hash ?? 0}
                        type={CONST.SEARCH.DATA_TYPES.EXPENSE}
                        hasResults={false}
                        queryJSON={queryJSON}
                    />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

InsightsPage.displayName = 'InsightsPage';

export default InsightsPage;
