import React, {useEffect, useMemo, useState} from 'react';
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
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery, buildSearchQueryJSON, getPolicyIDFromSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SearchResults} from '@src/types/onyx';
import SearchPageNarrow from './SearchPageNarrow';
import SearchTypeMenu from './SearchTypeMenu';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const {q, name} = route.params;

    const {queryJSON, policyID} = useMemo(() => {
        const parsedQuery = buildSearchQueryJSON(q);
        const extractedPolicyID = parsedQuery && getPolicyIDFromSearchQuery(parsedQuery);

        return {queryJSON: parsedQuery, policyID: extractedPolicyID};
    }, [q]);
    const {clearSelectedTransactions, lastSearchType, setLastSearchType} = useSearchContext();

    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID}`);
    const [lastNonEmptySearchResults, setLastNonEmptySearchResults] = useState<SearchResults | undefined>(undefined);

    useEffect(() => {
        if (!currentSearchResults?.search?.type) {
            return;
        }

        setLastSearchType(currentSearchResults.search.type);
        if (currentSearchResults.data) {
            setLastNonEmptySearchResults(currentSearchResults);
        }
    }, [lastSearchType, queryJSON, setLastSearchType, currentSearchResults]);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));

    const shouldShowOfflineIndicator = currentSearchResults?.data ?? lastNonEmptySearchResults;

    const isSearchNameModified = name === q;
    const searchName = isSearchNameModified ? undefined : name;

    if (shouldUseNarrowLayout) {
        return (
            <SearchPageNarrow
                queryJSON={queryJSON}
                policyID={policyID}
                searchName={searchName}
                lastNonEmptySearchResults={lastNonEmptySearchResults}
                currentSearchResults={currentSearchResults}
            />
        );
    }

    return (
        <ScreenWrapper
            testID={Search.displayName}
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
                                    <SearchTypeMenu queryJSON={queryJSON} />
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
                            shouldShowOfflineIndicatorInWideScreen={!!shouldShowOfflineIndicator}
                            offlineIndicatorStyle={styles.mtAuto}
                        >
                            <SearchPageHeader queryJSON={queryJSON} />
                            <SearchStatusBar queryJSON={queryJSON} />
                            <Search
                                key={queryJSON.hash}
                                queryJSON={queryJSON}
                                currentSearchResults={currentSearchResults}
                                lastNonEmptySearchResults={lastNonEmptySearchResults}
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
