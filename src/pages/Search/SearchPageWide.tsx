import React, {useMemo} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import SearchPageFooter from '@components/Search/SearchPageFooter';
import SearchFiltersBar from '@components/Search/SearchPageHeader/SearchFiltersBar';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {SearchParams, SearchQueryJSON} from '@components/Search/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';
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
    scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    initScanRequest: (e: DragEvent) => void;
    isDragDisabled: boolean;
    PDFValidationComponent: React.ReactNode;
    ErrorModal: React.ReactNode;
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
    scrollHandler,
    initScanRequest,
    isDragDisabled,
    PDFValidationComponent,
    ErrorModal,
    shouldShowFooter,
}: SearchPageWideProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

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
                                onSortPressedCallback={onSortPressedCallback}
                                searchRequestResponseStatusCode={searchRequestResponseStatusCode}
                            />
                            {shouldShowFooter && (
                                <SearchPageFooter
                                    count={footerData.count}
                                    total={footerData.total}
                                    currency={footerData.currency}
                                />
                            )}
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
