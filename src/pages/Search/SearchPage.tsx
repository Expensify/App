import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderGap from '@components/HeaderGap';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import BottomTabBar from '@components/Navigation/BottomTabBar';
import BOTTOM_TABS from '@components/Navigation/BottomTabBar/BOTTOM_TABS';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import {useSearchContext} from '@components/Search/SearchContext';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import SearchStatusBar from '@components/Search/SearchPageHeader/SearchStatusBar';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {shouldShowPolicy} from '@libs/PolicyUtils';
import {buildCannedSearchQuery, buildSearchQueryJSON, getPolicyIDFromSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import SearchPageNarrow from './SearchPageNarrow';
import SearchTypeMenu from './SearchTypeMenu';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});
    const {q, name, groupBy} = route.params;

    const {queryJSON, extractedPolicyID} = useMemo(() => {
        const parsedQuery = buildSearchQueryJSON(q);
        const policyID = parsedQuery && getPolicyIDFromSearchQuery(parsedQuery);
        return {queryJSON: parsedQuery, extractedPolicyID: policyID};
    }, [q]);

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${extractedPolicyID || CONST.DEFAULT_NUMBER_ID}`);

    const policyID = useMemo(() => {
        return shouldShowPolicy(policy, !!isOffline, currentUserLogin) ? extractedPolicyID : undefined;
    }, [policy, isOffline, currentUserLogin, extractedPolicyID]);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));
    const {clearSelectedTransactions} = useSearchContext();

    const shouldGroupByReports = groupBy === CONST.SEARCH.GROUP_BY.REPORTS;

    const isSearchNameModified = name === q;
    const searchName = isSearchNameModified ? undefined : name;

    if (shouldUseNarrowLayout) {
        return (
            <SearchPageNarrow
                queryJSON={queryJSON}
                policyID={policyID}
                shouldGroupByReports={shouldGroupByReports}
                searchName={searchName}
            />
        );
    }

    return (
        <ScreenWrapper
            testID={Search.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
            headerGapStyles={styles.searchHeaderGap}
        >
            <FullPageNotFoundView
                shouldForceFullScreen
                shouldShow={!queryJSON}
                onBackButtonPress={handleOnBackButtonPress}
                shouldShowLink={false}
            >
                {!!queryJSON && (
                    <View style={styles.searchSplitContainer}>
                        <View style={styles.searchSidebar}>
                            {queryJSON ? (
                                <View style={styles.flex1}>
                                    <HeaderGap />
                                    <TopBar
                                        activeWorkspaceID={policyID}
                                        breadcrumbLabel={translate('common.reports')}
                                        shouldDisplaySearch={false}
                                    />
                                    <SearchTypeMenu
                                        queryJSON={queryJSON}
                                        shouldGroupByReports={shouldGroupByReports}
                                    />
                                </View>
                            ) : (
                                <HeaderWithBackButton
                                    title={translate('common.selectMultiple')}
                                    onBackButtonPress={() => {
                                        clearSelectedTransactions();
                                        turnOffMobileSelectionMode();
                                    }}
                                />
                            )}
                            <BottomTabBar selectedTab={BOTTOM_TABS.SEARCH} />
                        </View>
                        <ScreenWrapper
                            testID={Search.displayName}
                            shouldShowOfflineIndicatorInWideScreen
                            offlineIndicatorStyle={styles.mtAuto}
                        >
                            <SearchPageHeader
                                queryJSON={queryJSON}
                                shouldGroupByReports={shouldGroupByReports}
                            />
                            <SearchStatusBar queryJSON={queryJSON} />
                            <Search
                                key={queryJSON.hash}
                                queryJSON={queryJSON}
                                shouldGroupByReports={shouldGroupByReports}
                            />
                        </ScreenWrapper>
                    </View>
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchPage.displayName = 'SearchPage';
SearchPage.whyDidYouRender = true;

export default SearchPage;
