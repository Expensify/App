import React, {useMemo} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchComponent from '@components/Search';
// Using composition pattern - import from SearchComposition for dot notation components
import Search from '@components/Search/SearchComposition';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {BankAccountMenuItem, SearchParams, SearchQueryJSON} from '@components/Search/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {SearchResults} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type SearchPageWideProps = {
    queryJSON?: SearchQueryJSON;
    searchResults: OnyxEntry<SearchResults>;
    searchRequestResponseStatusCode: number | null;
    isMobileSelectionModeEnabled: boolean;
    headerButtonsOptions: Array<DropdownOption<SearchHeaderOptionValue>>;
    footerData: {
        count: number | undefined;
        total: number | undefined;
        currency: string | undefined;
    };
    selectedPolicyIDs: Array<string | undefined>;
    selectedTransactionReportIDs: string[];
    selectedReportIDs: string[];
    latestBankItems?: BankAccountMenuItem[];
    onBulkPaySelected: (paymentMethod?: PaymentMethodType) => void;
    handleSearchAction: (value: SearchParams | string) => void;
    onSortPressedCallback: () => void;
    scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    initScanRequest: (e: DragEvent) => void;
    PDFValidationComponent: React.ReactNode;
    ErrorModal: React.ReactNode;
    shouldShowFooter: boolean;
};

function SearchPageWide({
    queryJSON,
    searchResults,
    searchRequestResponseStatusCode,
    isMobileSelectionModeEnabled,
    headerButtonsOptions,
    footerData,
    selectedPolicyIDs,
    selectedTransactionReportIDs,
    selectedReportIDs,
    latestBankItems,
    onBulkPaySelected,
    handleSearchAction,
    onSortPressedCallback,
    scrollHandler,
    initScanRequest,
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
                        <DragAndDropProvider>
                            {PDFValidationComponent}
                            {/* Using composition pattern - Search.Header component */}
                            <Search.Header
                                queryJSON={queryJSON}
                                headerButtonsOptions={headerButtonsOptions}
                                handleSearch={handleSearchAction}
                                isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                            />
                            {/* Using composition pattern - Search.FiltersBar component */}
                            <Search.FiltersBar
                                queryJSON={queryJSON}
                                headerButtonsOptions={headerButtonsOptions}
                                isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                currentSelectedPolicyID={selectedPolicyIDs?.at(0)}
                                currentSelectedReportID={selectedTransactionReportIDs?.at(0) ?? selectedReportIDs?.at(0)}
                                confirmPayment={onBulkPaySelected}
                                latestBankItems={latestBankItems}
                            />
                            {/* Using SearchComponent (the main Search list) */}
                            <SearchComponent
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
                                // Using composition pattern - Search.Footer component
                                <Search.Footer
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
