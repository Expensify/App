import React, {useEffect, useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/constants';
import SearchChartView from '@components/Search/SearchChartView';
import type {GroupedItem} from '@components/Search/types';
import WidgetContainer from '@components/WidgetContainer';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {search} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getSections, getSortedSections, getSuggestedSearches, isPolicyEligibleForSpendOverTime, isSearchDataLoaded} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const spendOverTimeSearchConfig = getSuggestedSearches()[CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME];
const query = spendOverTimeSearchConfig.searchQuery;
const queryJSON = spendOverTimeSearchConfig.searchQueryJSON;
const groupBy = queryJSON?.groupBy;
const view = queryJSON?.view;
const searchKey = spendOverTimeSearchConfig.key;

function SpendOverTimeSection() {
    const styles = useThemeStyles();
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Expand', 'OfflineCloud']);
    const illustrations = useMemoizedLazyIllustrations(['BrokenMagnifyingGlass']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {accountID, login} = useCurrentUserPersonalDetails();
    const [searchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash}`);
    const {isOffline} = useNetwork();
    const isVisible = Object.values(policies ?? {}).some((policy) => !!policy && isPolicyEligibleForSpendOverTime(policy, login));

    // We need the snapshot's isLoading in the search effect without subscribing to it (which would cause an infinite loop).
    // useLayoutEffect syncs the ref before useEffect runs. TODO: Replace with useEffectEvent after upgrading to React 19.2.
    const isSearchLoadingRef = useRef(false);

    useLayoutEffect(() => {
        isSearchLoadingRef.current = !!searchResults?.search?.isLoading;
    }, [searchResults?.search?.isLoading]);

    useEffect(() => {
        if (!isVisible || isOffline || !queryJSON || isSearchLoadingRef.current) {
            return;
        }
        search({
            queryJSON,
            searchKey,
            offset: 0,
            isOffline: false,
            isLoading: false,
        });
    }, [isVisible, isOffline]);

    if (!isVisible || !queryJSON || !view || !groupBy || view === CONST.SEARCH.VIEW.TABLE || !login) {
        return null;
    }

    const sortedData = searchResults?.data
        ? (getSortedSections(
              queryJSON.type,
              queryJSON.status,
              getSections({
                  type: queryJSON.type,
                  data: searchResults.data,
                  groupBy,
                  queryJSON,
                  currentAccountID: accountID,
                  currentUserEmail: login,
                  translate,
                  formatPhoneNumber,
                  bankAccountList: undefined,
                  allReportMetadata: undefined,
              })[0],
              localeCompare,
              translate,
              queryJSON.sortBy,
              queryJSON.sortOrder,
              groupBy,
          ) as GroupedItem[])
        : undefined;

    const shouldShowOfflineIndicator = isOffline && !sortedData;
    const shouldShowErrorIndicator = !shouldShowOfflineIndicator && Object.keys(searchResults?.errors ?? {}).length > 0;
    const shouldShowLoadingIndicator = !shouldShowOfflineIndicator && !shouldShowErrorIndicator && !isSearchDataLoaded(searchResults, queryJSON);

    if (!shouldShowErrorIndicator && sortedData?.length === 0) {
        return null;
    }

    return (
        <WidgetContainer
            title={translate(spendOverTimeSearchConfig.translationPath)}
            titleRightContent={
                shouldShowOfflineIndicator || shouldShowLoadingIndicator || shouldShowErrorIndicator ? null : (
                    <Button
                        small
                        text={translate('common.view')}
                        onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}))}
                        iconRight={icons.Expand}
                        shouldShowRightIcon
                        textStyles={styles.pb0}
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
                        queryJSON={queryJSON}
                        view={view}
                        groupBy={groupBy}
                        data={sortedData ?? []}
                        isLoading={shouldShowLoadingIndicator}
                        shouldKeepConstantHeight
                    />
                </View>
            )}
        </WidgetContainer>
    );
}

export default SpendOverTimeSection;
