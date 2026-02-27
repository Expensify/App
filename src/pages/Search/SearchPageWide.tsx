import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import Search from '@components/Search';
import {useSearchStateContext} from '@components/Search/SearchContext';
import SearchPageFooter from '@components/Search/SearchPageFooter';
import SearchFiltersBar from '@components/Search/SearchPageHeader/SearchFiltersBar';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import SearchReceiptDropZone from '@components/Search/SearchReceiptDropZone';
import type {SearchParams} from '@components/Search/types';
import {usePlaybackActionsContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery, buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import Navigation from '@navigation/Navigation';
import {searchInServer} from '@userActions/Report';
import {search} from '@userActions/Search';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

function SearchPageWide() {
    const route = useRoute<RouteProp<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>>();
    const queryJSON = useMemo(() => buildSearchQueryJSON(route.params.q, route.params.rawQuery), [route.params.q, route.params.rawQuery]);
    const styles = useThemeStyles();
    const {currentSearchResults, lastNonEmptySearchResults, shouldShowFooter} = useSearchStateContext();
    const searchResults = currentSearchResults?.data ? currentSearchResults : lastNonEmptySearchResults;
    const {saveScrollOffset} = useContext(ScrollOffsetContext);
    const scrollHandler = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (!e.nativeEvent.contentOffset.y) {
                return;
            }

            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        },
        [saveScrollOffset, route],
    );
    const {resetVideoPlayerData} = usePlaybackActionsContext();
    const [searchRequestResponseStatusCode, setSearchRequestResponseStatusCode] = useState<number | null>(null);
    const handleSearchAction = useCallback((value: SearchParams | string) => {
        if (typeof value === 'string') {
            searchInServer(value);
        } else {
            setSearchRequestResponseStatusCode(null);
            search(value)?.then((jsonCode) => {
                setSearchRequestResponseStatusCode(Number(jsonCode ?? 0));
            });
        }
    }, []);
    useEffect(() => {
        resetVideoPlayerData();
        return resetVideoPlayerData;
    }, [resetVideoPlayerData]);

    const offlineIndicatorStyle = useMemo(() => {
        if (shouldShowFooter) {
            return [styles.mtAuto, styles.pAbsolute, styles.h10, styles.b0];
        }

        return [styles.mtAuto];
    }, [shouldShowFooter, styles]);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));

    return (
        <View style={styles.searchSplitContainer}>
            <ScreenWrapper
                testID="Search"
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen={!!searchResults}
                offlineIndicatorStyle={offlineIndicatorStyle}
            >
                <FullPageNotFoundView
                    shouldForceFullScreen
                    shouldShow={!queryJSON}
                    onBackButtonPress={handleOnBackButtonPress}
                    shouldShowLink={false}
                >
                    {!!queryJSON && (
                        <SearchReceiptDropZone>
                            <SearchPageHeader
                                queryJSON={queryJSON}
                                handleSearch={handleSearchAction}
                            />
                            <SearchFiltersBar queryJSON={queryJSON} />
                            <Search
                                key={queryJSON.hash}
                                queryJSON={queryJSON}
                                searchResults={searchResults}
                                handleSearch={handleSearchAction}
                                onSearchListScroll={scrollHandler}
                                searchRequestResponseStatusCode={searchRequestResponseStatusCode}
                            />
                            <SearchPageFooter />
                        </SearchReceiptDropZone>
                    )}
                </FullPageNotFoundView>
            </ScreenWrapper>
        </View>
    );
}

export default SearchPageWide;
