import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {InteractionManager, View} from 'react-native';
import Animated from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import DecisionModal from '@components/DecisionModal';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import HoldOrRejectEducationalModal from '@components/HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from '@components/HoldSubmitterEducationalModal';
import type {PaymentMethodType} from '@components/KYCWall/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import {SearchBulkActionsModalContext} from '@components/Search/SearchBulkActionsModalContext';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import {useSearchSelectionContext} from '@components/Search/SearchSelectionContext';
import type {PaymentData, SearchParams} from '@components/Search/types';
import {usePlaybackActionsContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useAllTransactions from '@hooks/useAllTransactions';
import useBulkPayOptions from '@hooks/useBulkPayOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilterFormValues from '@hooks/useFilterFormValues';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useReceiptScanDrop from '@hooks/useReceiptScanDrop';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {deleteAppReport, moveIOUReportToPolicy, moveIOUReportToPolicyAndInviteSubmitter, searchInServer} from '@libs/actions/Report';
import {
    approveMoneyRequestOnSearch,
    bulkDeleteReports,
    exportSearchItemsToCSV,
    getExportTemplates,
    getLastPolicyBankAccountID,
    getLastPolicyPaymentMethod,
    getPayMoneyOnSearchInvoiceParams,
    getPayOption,
    getReportType,
    getTotalFormattedAmount,
    isCurrencySupportWalletBulkPay,
    payMoneyRequestOnSearch,
    queueExportSearchItemsToCSV,
    queueExportSearchWithTemplate,
    search,
    submitMoneyRequestOnSearch,
    unholdMoneyRequestOnSearch,
    updateAdvancedFilters,
} from '@libs/actions/Search';
import {setNameValuePair} from '@libs/actions/User';
import {getTransactionsAndReportsFromSearch} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {isMergeActionForSelectedTransactions} from '@libs/ReportSecondaryActionUtils';
import {
    getReportOrDraftReport,
    isBusinessInvoiceRoom,
    isCurrentUserSubmitter,
    isExpenseReport as isExpenseReportUtil,
    isInvoiceReport,
    isIOUReport as isIOUReportUtil,
} from '@libs/ReportUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {navigateToSearchRHP, shouldShowDeleteOption} from '@libs/SearchUIUtils';
import {hasTransactionBeenRejected} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import {canIOUBePaid, dismissRejectUseExplanation} from '@userActions/IOU';
import {initSplitExpense} from '@userActions/IOU/Split';
import {openOldDotLink} from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report, SearchResults, Transaction, TransactionViolations} from '@src/types/onyx';
import SearchPageNarrow from './SearchPageNarrow';
import SearchPageWide from './SearchPageWide';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {lastSearchType, setLastSearchType, currentSearchKey, currentSearchResults} = useSearchContext();
    const {selectedTransactions, clearSelectedTransactions, selectedReports, areAllMatchingItemsSelected, selectAllMatchingItems} = useSearchSelectionContext();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isMobileSelectionModeEnabled = useMobileSelectionMode(clearSelectedTransactions);
    const allTransactions = useAllTransactions();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const selfDMReport = useSelfDMReport();
    const [lastPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS);
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const {accountID} = useCurrentUserPersonalDetails();

    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const [searchRequestResponseStatusCode, setSearchRequestResponseStatusCode] = useState<number | null>(null);
    const {showConfirmModal} = useConfirmModal();
    const {isBetaEnabled} = usePermissions();
    const isDEWBetaEnabled = isBetaEnabled(CONST.BETAS.NEW_DOT_DEW);
    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<ValueOf<
        typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT
    > | null>(null);

    const [emptyReportsCount, setEmptyReportsCount] = useState<number>(0);

    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION);
    const [dismissedHoldUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION);

    const queryJSON = useMemo(() => buildSearchQueryJSON(route.params.q, route.params.rawQuery), [route.params.q, route.params.rawQuery]);
    const isExpenseReportType = queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
    const {saveScrollOffset} = useContext(ScrollOffsetContext);
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Export',
        'Table',
        'DocumentMerge',
        'Send',
        'Trashcan',
        'ThumbsUp',
        'ThumbsDown',
        'ArrowRight',
        'ArrowCollapse',
        'Stopwatch',
        'Exclamation',
        'SmartScan',
        'MoneyBag',
        'ArrowSplit',
    ] as const);

    const lastNonEmptySearchResults = useRef<SearchResults | undefined>(undefined);
    const selectedTransactionReportIDs = useMemo(
        () => [
            ...new Set(
                Object.values(selectedTransactions)
                    .map((transaction) => transaction.reportID)
                    .filter((reportID) => reportID !== undefined),
            ),
        ],
        [selectedTransactions],
    );
    const selectedReportIDs = Object.values(selectedReports)
        .map((report) => report.reportID)
        .filter((reportID) => reportID !== undefined);
    const isCurrencySupportedBulkWallet = isCurrencySupportWalletBulkPay(selectedReports, selectedTransactions);

    // Collate a list of policyIDs from the selected transactions
    const selectedPolicyIDs = useMemo(
        () => [
            ...new Set(
                Object.values(selectedTransactions)
                    .map((transaction) => transaction.policyID)
                    .filter(Boolean),
            ),
        ],
        [selectedTransactions],
    );
    const selectedBulkCurrency = selectedReports.at(0)?.currency ?? Object.values(selectedTransactions).at(0)?.currency;
    const totalFormattedAmount = getTotalFormattedAmount(selectedReports, selectedTransactions, selectedBulkCurrency);

    const onlyShowPayElsewhere = useMemo(() => {
        const firstPolicyID = selectedPolicyIDs.at(0);
        const selectedPolicy = firstPolicyID ? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${firstPolicyID}`] : undefined;
        return (selectedTransactionReportIDs ?? selectedReportIDs).some((reportID) => {
            const report = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const chatReportID = report?.chatReportID;
            const chatReport = chatReportID ? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`] : undefined;
            return (
                report &&
                !canIOUBePaid(report, chatReport, selectedPolicy, bankAccountList, undefined, false) &&
                canIOUBePaid(report, chatReport, selectedPolicy, bankAccountList, undefined, true)
            );
        });
    }, [currentSearchResults?.data, selectedPolicyIDs, selectedReportIDs, selectedTransactionReportIDs, bankAccountList]);

    const {bulkPayButtonOptions, latestBankItems} = useBulkPayOptions({
        selectedPolicyID: selectedPolicyIDs.at(0),
        selectedReportID: selectedTransactionReportIDs.at(0) ?? selectedReportIDs.at(0),
        isCurrencySupportedWallet: isCurrencySupportedBulkWallet,
        currency: selectedBulkCurrency,
        formattedAmount: totalFormattedAmount,
        onlyShowPayElsewhere,
    });

    const formValues = useFilterFormValues(queryJSON);

    // Sync the advanced filters form with the current query when it changes
    useEffect(() => {
        updateAdvancedFilters(formValues, true);
    }, [formValues]);

    useConfirmReadyToOpenApp();

    useEffect(() => {
        if (!currentSearchResults?.search?.type) {
            return;
        }

        setLastSearchType(currentSearchResults.search.type);
        if (currentSearchResults.data) {
            lastNonEmptySearchResults.current = currentSearchResults;
        }
    }, [lastSearchType, queryJSON, setLastSearchType, currentSearchResults]);

    const {status, hash} = queryJSON ?? {};
    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

    const [isSorting, setIsSorting] = useState(false);
    let searchResults: SearchResults | undefined;
    if (currentSearchResults?.data) {
        searchResults = currentSearchResults;
    } else if (isSorting) {
        searchResults = lastNonEmptySearchResults.current;
    }

    const {initScanRequest, PDFValidationComponent, ErrorModal} = useReceiptScanDrop();

    const {resetVideoPlayerData} = usePlaybackActionsContext();

    const metadata = searchResults?.search;

    // Handles video player cleanup:
    // 1. On mount: Resets player if navigating from report screen
    // 2. On unmount: Stops video when leaving this screen
    // in narrow layout, the reset will be handled by the attachment modal, so we don't need to do it here to preserve autoplay
    useEffect(() => {
        if (shouldUseNarrowLayout) {
            return;
        }
        resetVideoPlayerData();
        return () => {
            if (shouldUseNarrowLayout) {
                return;
            }
            resetVideoPlayerData();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const prevIsLoading = usePrevious(currentSearchResults?.isLoading);

    useEffect(() => {
        if (!isSorting || !prevIsLoading || currentSearchResults?.isLoading) {
            return;
        }

        setIsSorting(false);
    }, [currentSearchResults?.isLoading, isSorting, prevIsLoading]);

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

    const onSortPressedCallback = useCallback(() => {
        setIsSorting(true);
    }, []);

    const scrollHandler = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (!e.nativeEvent.contentOffset.y) {
                return;
            }

            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        },
        [saveScrollOffset, route],
    );

    const handleOfflineModalClose = useCallback(() => {
        setIsOfflineModalVisible(false);
    }, [setIsOfflineModalVisible]);

    const handleDownloadErrorModalClose = useCallback(() => {
        setIsDownloadErrorModalVisible(false);
    }, [setIsDownloadErrorModalVisible]);

    const dismissModalAndUpdateUseHold = useCallback(() => {
        setIsHoldEducationalModalVisible(false);
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false, !isOffline);
        if (hash && selectedTransactionsKeys.length > 0) {
            navigateToSearchRHP(ROUTES.TRANSACTION_HOLD_REASON_SEARCH, ROUTES.TRANSACTION_HOLD_REASON_RHP);
        }
    }, [hash, selectedTransactionsKeys.length, isOffline]);

    const dismissRejectModalBasedOnAction = useCallback(() => {
        if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD) {
            dismissRejectUseExplanation();
            if (hash && selectedTransactionsKeys.length > 0) {
                navigateToSearchRHP(ROUTES.TRANSACTION_HOLD_REASON_SEARCH, ROUTES.TRANSACTION_HOLD_REASON_RHP);
            }
        } else {
            dismissRejectUseExplanation();
            Navigation.navigate(ROUTES.SEARCH_REJECT_REASON_RHP);
        }
        setRejectModalAction(null);
    }, [rejectModalAction, hash, selectedTransactionsKeys.length]);

    const searchBulkActionsModalValue = useMemo(
        () => ({
            setIsOfflineModalVisible,
            setRejectModalAction,
            setIsHoldEducationalModalVisible,
            setIsDownloadErrorModalVisible,
            setEmptyReportsCount,
        }),
        [],
    );

    return (
        <>
            <SearchBulkActionsModalContext.Provider value={searchBulkActionsModalValue}>
                <Animated.View style={[styles.flex1]}>
                    {shouldUseNarrowLayout ? (
                        <DragAndDropProvider>
                            {PDFValidationComponent}
                            <SearchPageNarrow
                                queryJSON={queryJSON}
                                metadata={metadata}
                                searchResults={searchResults}
                                isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                currentSelectedPolicyID={selectedPolicyIDs?.at(0)}
                                currentSelectedReportID={selectedTransactionReportIDs?.at(0) ?? selectedReportIDs?.at(0)}
                                latestBankItems={latestBankItems}
                            />
                            <DragAndDropConsumer onDrop={initScanRequest}>
                                <DropZoneUI
                                    icon={expensifyIcons.SmartScan}
                                    dropTitle={translate('dropzone.scanReceipts')}
                                    dropStyles={styles.receiptDropOverlay(true)}
                                    dropTextStyles={styles.receiptDropText}
                                    dropWrapperStyles={{marginBottom: variables.bottomTabHeight}}
                                    dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                                />
                            </DragAndDropConsumer>
                            {ErrorModal}
                        </DragAndDropProvider>
                    ) : (
                        <SearchPageWide
                            queryJSON={queryJSON}
                            searchResults={searchResults}
                            searchRequestResponseStatusCode={searchRequestResponseStatusCode}
                            isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                            selectedPolicyIDs={selectedPolicyIDs}
                            selectedTransactionReportIDs={selectedTransactionReportIDs}
                            selectedReportIDs={selectedReportIDs}
                            latestBankItems={latestBankItems}
                            handleSearchAction={handleSearchAction}
                            onSortPressedCallback={onSortPressedCallback}
                            scrollHandler={scrollHandler}
                            initScanRequest={initScanRequest}
                            PDFValidationComponent={PDFValidationComponent}
                            ErrorModal={ErrorModal}
                        />
                    )}
                </Animated.View>
            </SearchBulkActionsModalContext.Provider>
            {(!shouldUseNarrowLayout || isMobileSelectionModeEnabled) && (
                <View>
                    <DecisionModal
                        title={translate('common.youAppearToBeOffline')}
                        prompt={translate('common.offlinePrompt')}
                        isSmallScreenWidth={isSmallScreenWidth}
                        onSecondOptionSubmit={handleOfflineModalClose}
                        secondOptionText={translate('common.buttonConfirm')}
                        isVisible={isOfflineModalVisible}
                        onClose={handleOfflineModalClose}
                    />
                    {!!rejectModalAction && (
                        <HoldOrRejectEducationalModal
                            onClose={dismissRejectModalBasedOnAction}
                            onConfirm={dismissRejectModalBasedOnAction}
                        />
                    )}
                    {!!isHoldEducationalModalVisible && (
                        <HoldSubmitterEducationalModal
                            onClose={dismissModalAndUpdateUseHold}
                            onConfirm={dismissModalAndUpdateUseHold}
                        />
                    )}
                </View>
            )}
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={emptyReportsCount ? translate('common.downloadFailedEmptyReportDescription', {count: emptyReportsCount}) : translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={handleDownloadErrorModalClose}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadErrorModalVisible}
                onClose={handleDownloadErrorModalClose}
            />
        </>
    );
}

SearchPage.whyDidYouRender = true;

export default SearchPage;
