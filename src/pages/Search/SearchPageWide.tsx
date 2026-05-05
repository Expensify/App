import React, {useCallback, useContext, useMemo, useRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ReceiptScanDropZone from '@components/ReceiptScanDropZone';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import Search from '@components/Search';
import {useSearchStateContext} from '@components/Search/SearchContext';
import SearchLoadingSkeleton from '@components/Search/SearchLoadingSkeleton';
import SearchPageFooter from '@components/Search/SearchPageFooter';
import SearchActionsBarWide from '@components/Search/SearchPageHeader/SearchActionsBarWide';
import SearchPageHeaderWide from '@components/Search/SearchPageHeader/SearchPageHeaderWide';
import type {SearchParams, SearchQueryJSON} from '@components/Search/types';
import useEndSubmitNavigationSpans from '@hooks/useEndSubmitNavigationSpans';
import useNetwork from '@hooks/useNetwork';
import useSearchLoadingState from '@hooks/useSearchLoadingState';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {isSearchDataLoaded} from '@libs/SearchUIUtils';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SearchResults} from '@src/types/onyx';

type SearchPageWideProps = {
    queryJSON?: SearchQueryJSON;
    searchResults: OnyxEntry<SearchResults>;
    searchRequestResponseStatusCode: number | null;
    isMobileSelectionModeEnabled: boolean;
    footerData: {
        count: number | undefined;
        total: number | undefined;
        currency: string | undefined;
    };
    handleSearchAction: (value: SearchParams | string) => void;
    onSortPressedCallback: () => void;
    route: PlatformStackRouteProp<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;
    shouldShowFooter: boolean;
};

function SearchPageWide({
    queryJSON,
    searchResults,
    searchRequestResponseStatusCode,
    isMobileSelectionModeEnabled,
    footerData,
    handleSearchAction,
    onSortPressedCallback,
    route,
    shouldShowFooter,
}: SearchPageWideProps) {
    const shouldShowLoadingSkeleton = useSearchLoadingState(queryJSON, searchResults);
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {shouldUseLiveData} = useSearchStateContext();
    const {saveScrollOffset} = useContext(ScrollOffsetContext);
    const receiptDropTargetRef = useRef<View>(null);

    const endSubmitNavigationSpans = useEndSubmitNavigationSpans({requireLayout: false});

    const scrollHandler = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (!e.nativeEvent.contentOffset.y) {
                return;
            }

            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        },
        [saveScrollOffset, route],
    );

    const offlineIndicatorStyle = useMemo(() => {
        if (shouldShowFooter) {
            return [styles.mtAuto, styles.pAbsolute, styles.h10, styles.b0];
        }

        return [styles.mtAuto];
    }, [shouldShowFooter, styles]);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));

    return (
        <View
            ref={receiptDropTargetRef}
            style={styles.searchSplitContainer}
        >
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
                        <>
                            <SearchPageHeaderWide queryJSON={queryJSON} />
                            <SearchActionsBarWide
                                queryJSON={queryJSON}
                                searchResults={searchResults}
                                onSort={onSortPressedCallback}
                                handleSearch={handleSearchAction}
                            />
                            {shouldShowLoadingSkeleton ? (
                                <SearchLoadingSkeleton
                                    containerStyle={styles.mt3}
                                    reasonAttributes={{
                                        context: 'SearchPage',
                                        isOffline,
                                        isDataLoaded: shouldUseLiveData || isSearchDataLoaded(searchResults, queryJSON),
                                        isSearchLoading: !!searchResults?.search?.isLoading,
                                        hasEmptyData: Array.isArray(searchResults?.data) && searchResults?.data.length === 0,
                                        hasErrors: Object.keys(searchResults?.errors ?? {}).length > 0 && !isOffline,
                                        hasPendingResponse: searchRequestResponseStatusCode === null,
                                        shouldUseLiveData,
                                    }}
                                />
                            ) : (
                                <Search
                                    key={queryJSON.hash}
                                    queryJSON={queryJSON}
                                    searchResults={searchResults}
                                    handleSearch={handleSearchAction}
                                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                    onSearchListScroll={scrollHandler}
                                    onSortPressedCallback={onSortPressedCallback}
                                    searchRequestResponseStatusCode={searchRequestResponseStatusCode}
                                    onDestinationVisible={endSubmitNavigationSpans}
                                />
                            )}
                            {shouldShowFooter && (
                                <SearchPageFooter
                                    count={footerData.count}
                                    total={footerData.total}
                                    currency={footerData.currency}
                                />
                            )}
                        </>
                    )}
                </FullPageNotFoundView>
            </ScreenWrapper>
            {!!queryJSON && <ReceiptScanDropZone targetRef={receiptDropTargetRef} />}
        </View>
    );
}

export default SearchPageWide;
