import {useRoute} from '@react-navigation/native';
import React from 'react';
import {ScrollView, View} from 'react-native';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchChartView from '@components/Search/SearchChartView';
import SearchChartWrapper from '@components/Search/SearchChartWrapper';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getInsightConfig, getInsightTabFromUrlSlug} from '@libs/InsightsUtils';
import CONST from '@src/CONST';
import useInsightsChartData from './useInsightsChartData';

function InsightsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    useDocumentTitle(translate('common.insights'));
    const route = useRoute();
    const tabSlug = (route.params as {tab?: string} | undefined)?.tab;

    const activeTabScreen = getInsightTabFromUrlSlug(tabSlug);
    const {queryJSON, groupBy, view, sortedData, isLoading} = useInsightsChartData(activeTabScreen);

    const shouldRenderChart = !!queryJSON && !!groupBy && view !== undefined && view !== CONST.SEARCH.VIEW.TABLE;

    const topBar = (
        <TopBar
            breadcrumbLabel={translate(getInsightConfig(activeTabScreen).translationPath)}
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
            shouldOffsetForGlobalNavBar
        >
            {shouldUseNarrowLayout && topBar}
            <ScrollView contentContainerStyle={styles.homePageContentContainer}>
                {!shouldUseNarrowLayout && topBar}
                {shouldRenderChart && (
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
            </ScrollView>
        </ScreenWrapper>
    );
}

InsightsPage.displayName = 'InsightsPage';

export default InsightsPage;
