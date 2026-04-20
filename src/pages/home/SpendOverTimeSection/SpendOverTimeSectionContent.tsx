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
import useSpendOverTimeData, {SPEND_OVER_TIME_STATE} from './useSpendOverTimeData';

function SpendOverTimeSectionContent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Expand', 'OfflineCloud']);
    const illustrations = useMemoizedLazyIllustrations(['BrokenMagnifyingGlass']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {query, queryJSON, groupBy, view, sortedData, state} = useSpendOverTimeData();

    if (!queryJSON || !view || !groupBy || view === CONST.SEARCH.VIEW.TABLE || state === SPEND_OVER_TIME_STATE.HIDDEN) {
        return null;
    }

    return (
        <WidgetContainer
            title={translate('search.spendOverTime')}
            titleRightContent={
                state === SPEND_OVER_TIME_STATE.READY ? (
                    <Button
                        small
                        text={translate('common.view')}
                        onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}))}
                        iconRight={icons.Expand}
                        shouldShowRightIcon
                        textStyles={styles.pb0}
                        style={styles.widgetItemButton}
                        isContentCentered
                    />
                ) : null
            }
        >
            {state === SPEND_OVER_TIME_STATE.OFFLINE && (
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
            {state === SPEND_OVER_TIME_STATE.ERROR && (
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
            {(state === SPEND_OVER_TIME_STATE.LOADING || state === SPEND_OVER_TIME_STATE.READY) && (
                <View style={[shouldUseNarrowLayout ? styles.ph5 : [styles.ph8, styles.pt3]]}>
                    <SearchChartView
                        queryJSON={queryJSON}
                        view={view}
                        groupBy={groupBy}
                        data={sortedData ?? []}
                        isLoading={state === SPEND_OVER_TIME_STATE.LOADING}
                    />
                </View>
            )}
        </WidgetContainer>
    );
}

export default SpendOverTimeSectionContent;
