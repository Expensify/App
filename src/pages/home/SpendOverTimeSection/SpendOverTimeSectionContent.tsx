import React from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/constants';
import SearchChartView from '@components/Search/SearchChartView';
import WidgetContainer from '@components/WidgetContainer';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {GROUP_BY, QUERY, QUERY_JSON, TRANSLATION_PATH, VIEW} from './config';
import useSpendOverTimeData from './useSpendOverTimeData';

function SpendOverTimeSectionContent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Expand', 'OfflineCloud']);
    const illustrations = useMemoizedLazyIllustrations(['BrokenMagnifyingGlass']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {sortedData, shouldShowOfflineIndicator, shouldShowErrorIndicator, shouldShowLoadingIndicator} = useSpendOverTimeData();

    if (!QUERY_JSON || !VIEW || !GROUP_BY || VIEW === CONST.SEARCH.VIEW.TABLE) {
        return null;
    }

    if (!shouldShowErrorIndicator && sortedData?.length === 0) {
        return null;
    }

    return (
        <WidgetContainer
            title={translate(TRANSLATION_PATH)}
            titleRightContent={
                shouldShowOfflineIndicator || shouldShowLoadingIndicator || shouldShowErrorIndicator ? null : (
                    <Button
                        small
                        text={translate('common.view')}
                        onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: QUERY}))}
                        iconRight={icons.Expand}
                        shouldShowRightIcon
                        textStyles={styles.pb0}
                        style={styles.widgetItemButton}
                        isContentCentered
                    />
                )
            }
        >
            {shouldShowOfflineIndicator && (
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
            {shouldShowErrorIndicator && (
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
                />
            )}
            {!shouldShowOfflineIndicator && !shouldShowErrorIndicator && (
                <View style={[shouldUseNarrowLayout ? styles.ph5 : [styles.ph8, styles.pt3]]}>
                    <SearchChartView
                        queryJSON={QUERY_JSON}
                        view={VIEW}
                        groupBy={GROUP_BY}
                        data={sortedData ?? []}
                        isLoading={shouldShowLoadingIndicator}
                        disableDynamicHeight
                    />
                </View>
            )}
        </WidgetContainer>
    );
}

export default SpendOverTimeSectionContent;
