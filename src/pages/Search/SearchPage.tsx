import React, {useMemo} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import BottomTabBar, {BOTTOM_TABS} from '@components/Navigation/BottomTabBar';
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
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import SearchPageNarrow from './SearchPageNarrow';
import SearchTypeMenu from './SearchTypeMenu';

type SearchPageProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const {q, name} = route.params;

    const {queryJSON, policyID} = useMemo(() => {
        const parsedQuery = SearchQueryUtils.buildSearchQueryJSON(q);
        const extractedPolicyID = parsedQuery && SearchQueryUtils.getPolicyIDFromSearchQuery(parsedQuery);

        return {queryJSON: parsedQuery, policyID: extractedPolicyID};
    }, [q]);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchQueryUtils.buildCannedSearchQuery()}));
    const {clearSelectedTransactions} = useSearchContext();

    const isSearchNameModified = name === q;
    const searchName = isSearchNameModified ? undefined : name;

    // On small screens this page is not displayed, the configuration is in the file: src/libs/Navigation/AppNavigator/createResponsiveStackNavigator/index.tsx
    // To avoid calling hooks in the Search component when this page isn't visible, we return null here.
    if (shouldUseNarrowLayout) {
        return (
            <SearchPageNarrow
                queryJSON={queryJSON}
                policyID={policyID}
                searchName={searchName}
            />
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
                                <View>
                                    <TopBar
                                        activeWorkspaceID={policyID}
                                        breadcrumbLabel={translate('common.search')}
                                        shouldDisplaySearch={false}
                                    />
                                    <SearchTypeMenu
                                        queryJSON={queryJSON}
                                        searchName={searchName}
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
                            <Search queryJSON={queryJSON} />
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
