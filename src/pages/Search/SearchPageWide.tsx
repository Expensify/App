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
import SearchSelectionBar from '@components/Search/SearchPageHeader/SearchSelectionBar';
import type {BankAccountMenuItem, SearchParams, SearchQueryJSON} from '@components/Search/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSearchBulkActions from '@hooks/useSearchBulkActions';
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
    selectedPolicyIDs: Array<string | undefined>;
    selectedTransactionReportIDs: string[];
    selectedReportIDs: string[];
    latestBankItems?: BankAccountMenuItem[];
    handleSearchAction: (value: SearchParams | string) => void;
    onSortPressedCallback: () => void;
    scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    initScanRequest: (e: DragEvent) => void;
    PDFValidationComponent: React.ReactNode;
    ErrorModal: React.ReactNode;
};

function SearchPageWide({
    queryJSON,
    searchResults,
    searchRequestResponseStatusCode,
    isMobileSelectionModeEnabled,
    selectedPolicyIDs,
    selectedTransactionReportIDs,
    selectedReportIDs,
    latestBankItems,
    handleSearchAction,
    onSortPressedCallback,
    scrollHandler,
    initScanRequest,
    PDFValidationComponent,
    ErrorModal,
}: SearchPageWideProps) {
    const {headerButtonsOptions} = useSearchBulkActions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const offlineIndicatorStyle = useMemo(() => [styles.mtAuto], [styles]);

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
                        <DragAndDropProvider>
                            {PDFValidationComponent}
                            <SearchPageHeader
                                queryJSON={queryJSON}
                                handleSearch={handleSearchAction}
                                isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                            />
                            {headerButtonsOptions.length > 0 ? (
                                <SearchSelectionBar
                                    queryJSON={queryJSON}
                                    currentSelectedPolicyID={selectedPolicyIDs?.at(0)}
                                    currentSelectedReportID={selectedTransactionReportIDs?.at(0) ?? selectedReportIDs?.at(0)}
                                    latestBankItems={latestBankItems}
                                />
                            ) : (
                                <SearchFiltersBar
                                    queryJSON={queryJSON}
                                    headerButtonsOptions={headerButtonsOptions}
                                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                    currentSelectedPolicyID={selectedPolicyIDs?.at(0)}
                                    currentSelectedReportID={selectedTransactionReportIDs?.at(0) ?? selectedReportIDs?.at(0)}
                                    latestBankItems={latestBankItems}
                                />
                            )}
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
                            <SearchPageFooter />
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
