import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import Search from '@components/Search';
import {useSearchStateContext} from '@components/Search/SearchContext';
import SearchPageFooter from '@components/Search/SearchPageFooter';
import SearchFiltersBar from '@components/Search/SearchPageHeader/SearchFiltersBar';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {SearchParams} from '@components/Search/types';
import {usePlaybackActionsContext} from '@components/VideoPlayerContexts/PlaybackContext';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useReceiptScanDrop from '@hooks/useReceiptScanDrop';
import useTheme from '@hooks/useTheme';
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
    const theme = useTheme();
    const {translate} = useLocalize();
    const {currentSearchResults, lastNonEmptySearchResults, isMobileSelectionModeEnabled, shouldShowFooter} = useSearchStateContext();
    const searchResults = currentSearchResults?.data ? currentSearchResults : lastNonEmptySearchResults;
    const metadata = searchResults?.search;
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
    const {initScanRequest, PDFValidationComponent, ErrorModal, isDragDisabled} = useReceiptScanDrop();
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

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['SmartScan']);
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
                        <DragAndDropProvider isDisabled={isDragDisabled}>
                            {PDFValidationComponent}
                            <SearchPageHeader
                                queryJSON={queryJSON}
                                handleSearch={handleSearchAction}
                                isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                            />
                            <SearchFiltersBar
                                queryJSON={queryJSON}
                                isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                            />
                            <Search
                                key={queryJSON.hash}
                                queryJSON={queryJSON}
                                searchResults={searchResults}
                                handleSearch={handleSearchAction}
                                isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                onSearchListScroll={scrollHandler}
                                searchRequestResponseStatusCode={searchRequestResponseStatusCode}
                            />
                            {!!shouldShowFooter && <SearchPageFooter metadata={metadata} />}
                            <DragAndDropConsumer onDrop={initScanRequest}>
                                <DropZoneUI
                                    icon={expensifyIcons.SmartScan}
                                    dropTitle={translate('dropzone.scanReceipts')}
                                    dropStyles={styles.receiptDropOverlay(true)}
                                    dropTextStyles={styles.receiptDropText}
                                    dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                                />
                            </DragAndDropConsumer>
                        </DragAndDropProvider>
                    )}
                </FullPageNotFoundView>
            </ScreenWrapper>
            {ErrorModal}
        </View>
    );
}

export default SearchPageWide;
