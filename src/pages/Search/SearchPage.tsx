import React, {useMemo} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderGap from '@components/HeaderGap';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import BottomTabBar from '@components/Navigation/BottomTabBar';
import BOTTOM_TABS from '@components/Navigation/BottomTabBar/BOTTOM_TABS';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import {useSearchContext} from '@components/Search/SearchContext';
import SearchPageHeader from '@components/Search/SearchPageHeader';
import SearchStatusBar from '@components/Search/SearchStatusBar';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import FreezeWrapper from '@libs/Navigation/AppNavigator/FreezeWrapper';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery, buildSearchQueryJSON, getPolicyIDFromSearchQuery} from '@libs/SearchQueryUtils';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import SearchPageNarrow from './SearchPageNarrow';
import SearchTypeMenu from './SearchTypeMenu';

type SearchPageProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const {q, name, groupBy} = route.params;

    const {queryJSON, policyID} = useMemo(() => {
        const parsedQuery = buildSearchQueryJSON(q);
        const extractedPolicyID = parsedQuery && getPolicyIDFromSearchQuery(parsedQuery);

        return {queryJSON: parsedQuery, policyID: extractedPolicyID};
    }, [q]);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: buildCannedSearchQuery()}));
    const {clearSelectedTransactions} = useSearchContext();

    const isSearchNameModified = name === q;
    const searchName = isSearchNameModified ? undefined : name;

    if (shouldUseNarrowLayout) {
        return (
            <FreezeWrapper>
                <SearchPageNarrow
                    queryJSON={queryJSON}
                    policyID={policyID}
                    shouldBeGroupedByReports={groupBy === 'reports'}
                    searchName={searchName}
                />
            </FreezeWrapper>
        );
    }

    return (
        <FreezeWrapper>
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
                                        breadcrumbLabel={translate('common.search')}
                                        shouldDisplaySearch={false}
                                    />
                                    <SearchTypeMenu
                                        queryJSON={queryJSON}
                                        searchName={searchName}
                                        shouldBeGroupedByReports={groupBy === 'reports'}
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
                            <SearchPageHeader queryJSON={queryJSON} />
                            <SearchStatusBar queryJSON={queryJSON} />
                            <Search
                                key={queryJSON.hash}
                                queryJSON={queryJSON}
                                shouldBeGroupedByReports={groupBy === 'reports'}
                            />
                        </ScreenWrapper>
                    </View>
                )}
            </FullPageNotFoundView>
        </FreezeWrapper>
    );
}

SearchPage.displayName = 'SearchPage';
SearchPage.whyDidYouRender = true;

export default SearchPage;
