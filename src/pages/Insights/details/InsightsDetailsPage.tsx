import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Header from '@components/Header';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {buildChartDrillDownQuery} from '@components/Search/chartDrillDown';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {InsightsDetailsParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import {getQueryGroupBy} from '@pages/Insights/insightsGroupByUtils';
import {applyInsightsFilters} from '@pages/Insights/insightsQueries';
import useInsightsFilters from '@pages/Insights/useInsightsFilters';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

import {resolveInsightsDetailsItem} from './insightsDetailsItem';

type InsightsDetailsPageProps = PlatformStackScreenProps<InsightsDetailsParamList, typeof SCREENS.INSIGHTS_DETAILS>;

/** Details of a point clicked on an Insights chart, opened in the RHP. */
function InsightsDetailsPage({route}: InsightsDetailsPageProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpRight']);
    const {translate, dateFnsLocale} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {graphKey, item: itemKey, end: periodEnd} = route.params;
    const {filters, isResolved} = useInsightsFilters(CONST.INSIGHTS.DASHBOARD.SPEND);
    const memberAccountID = graphKey === CONST.INSIGHTS.GRAPH.TOP_SPENDERS ? Number(itemKey) : undefined;
    const [storedMember] = usePersonalDetail(memberAccountID);

    const {headlineChart, supportingCharts} = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND];
    const chartSpec = route.params.dashboardID === CONST.INSIGHTS.DASHBOARD.SPEND ? [headlineChart, ...supportingCharts].find((spec) => spec.graphKey === graphKey) : undefined;
    const chartQueryJSON = chartSpec && isResolved ? buildSearchQueryJSON(applyInsightsFilters(chartSpec, filters)) : undefined;
    const [chartMember] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${chartQueryJSON?.hash}`, {
        selector: (snapshot) => (memberAccountID === undefined ? undefined : snapshot?.data?.personalDetailsList?.[memberAccountID]),
    });
    const member = chartMember ?? storedMember;
    // A period's title depends on the saved Group by, so nothing resolves until the saved filters load
    const item =
        chartSpec && isResolved
            ? resolveInsightsDetailsItem({
                  groupBy: chartSpec.groupBy ?? getQueryGroupBy(filters),
                  itemKey,
                  periodEnd,
                  member,
                  dateFnsLocale,
                  translate,
              })
            : undefined;
    const viewAllQuery = chartQueryJSON && item ? buildChartDrillDownQuery(chartQueryJSON, item.filterQuery) : undefined;

    if (!isBetaEnabled(CONST.BETAS.INSIGHTS_AI) || !chartSpec || (isResolved && !item)) {
        return (
            <ScreenWrapper testID="InsightsDetailsPage">
                <FullPageNotFoundView shouldShow />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID="InsightsDetailsPage"
            shouldShowOfflineIndicatorInWideScreen
            includeSafeAreaPaddingBottom={false}
        >
            <Header>
                <Header.BackButton />
                <Header.Title title={translate('common.details')} />
            </Header>
            {!!item && (
                <ScrollView
                    contentContainerStyle={[styles.ph5, styles.pb5, styles.gap4]}
                    addBottomSafeAreaPadding
                >
                    <View style={styles.gap1}>
                        <Text
                            variant="label"
                            style={styles.textSupporting}
                        >
                            {translate(chartSpec.titleKey)}
                        </Text>
                        <Text variant="h1">{item.title}</Text>
                    </View>
                    {!!viewAllQuery && (
                        <PressableWithoutFeedback
                            onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: viewAllQuery}))}
                            accessibilityRole={CONST.ROLE.LINK}
                            accessibilityLabel={translate('insightsPage.viewAll')}
                            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.DETAILS_VIEW_ALL}
                            style={[styles.flexRow, styles.alignItemsCenter, styles.alignSelfStart, styles.gap1]}
                        >
                            <Text style={styles.link}>{translate('insightsPage.viewAll')}</Text>
                            <Icon
                                src={icons.ArrowUpRight}
                                fill={theme.link}
                                width={variables.iconSizeExtraSmall}
                                height={variables.iconSizeExtraSmall}
                            />
                        </PressableWithoutFeedback>
                    )}
                </ScrollView>
            )}
        </ScreenWrapper>
    );
}

export default InsightsDetailsPage;
