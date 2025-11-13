import React from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import SearchPageFooter from '@components/Search/SearchPageFooter';
import SearchFiltersBar from '@components/Search/SearchPageHeader/SearchFiltersBar';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {BankAccountMenuItem, SearchParams, SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
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
    shouldShowOfflineIndicator: boolean;
    offlineIndicatorStyle: Array<Record<string, unknown>>;
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
    shouldShowOfflineIndicator,
    offlineIndicatorStyle,
    shouldShowFooter,
}: SearchPageWideProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    if (!queryJSON) {
        return null;
    }
    return (
        <View style={styles.searchSplitContainer}>
            <ScreenWrapper
                testID={Search.displayName}
                shouldShowOfflineIndicatorInWideScreen={!!shouldShowOfflineIndicator}
                offlineIndicatorStyle={offlineIndicatorStyle}
            >
                {PDFValidationComponent}
                <SearchPageHeader
                    queryJSON={queryJSON}
                    headerButtonsOptions={headerButtonsOptions}
                    handleSearch={handleSearchAction}
                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                />
                <SearchFiltersBar
                    queryJSON={queryJSON}
                    headerButtonsOptions={headerButtonsOptions}
                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    currentSelectedPolicyID={selectedPolicyIDs?.at(0)}
                    currentSelectedReportID={selectedTransactionReportIDs?.at(0) ?? selectedReportIDs?.at(0)}
                    confirmPayment={onBulkPaySelected}
                    latestBankItems={latestBankItems}
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
                        icon={Expensicons.SmartScan}
                        dropTitle={translate('dropzone.scanReceipts')}
                        dropStyles={styles.receiptDropOverlay(true)}
                        dropTextStyles={styles.receiptDropText}
                        dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                    />
                </DragAndDropConsumer>
            </ScreenWrapper>
            {ErrorModal}
        </View>
    );
}

SearchPageWide.displayName = 'SearchPageWide';

export default SearchPageWide;
