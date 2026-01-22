import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import HoldOrRejectEducationalModal from '@components/HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from '@components/HoldSubmitterEducationalModal';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
// Using composition pattern - import from SearchComposition
import Search from '@components/Search/SearchComposition';
import {SearchDownloadErrorModal, SearchOfflineModal} from '@components/Search/modals';
import type {SearchParams} from '@components/Search/types';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useFilterFormValues from '@hooks/useFilterFormValues';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBulkActions from '@hooks/useSearchBulkActions';
import useSearchHeaderOptions from '@hooks/useSearchHeaderOptions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {confirmReadyToOpenApp} from '@libs/actions/App';
import {searchInServer} from '@libs/actions/Report';
import {search, updateAdvancedFilters} from '@libs/actions/Search';
import {setTransactionReport} from '@libs/actions/Transaction';
import {setNameValuePair} from '@libs/actions/User';
import {navigateToParticipantPage} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {hasOnlyPersonalPolicies as hasOnlyPersonalPoliciesUtil, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {generateReportID, getPolicyExpenseChat} from '@libs/ReportUtils';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import variables from '@styles/variables';
import {dismissRejectUseExplanation, initMoneyRequest, setMoneyRequestParticipantsFromReport, setMoneyRequestReceipt} from '@userActions/IOU';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SearchResults, Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import SearchPageNarrow from './SearchPageNarrow';
import SearchPageWide from './SearchPageWide';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    // Using composition pattern - access state and actions separately
    const {state, actions} = Search.useSearch();
    const {selectedTransactions, lastSearchType, areAllMatchingItemsSelected, currentSearchResults} = state;
    const {setLastSearchType} = actions;
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const newReportID = generateReportID();

    const [newReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${newReportID}`, {canBeMissing: true});
    const [newParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${newReport?.parentReportID}`, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: false});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});
    const [personalPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${personalPolicyID}`, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE, {canBeMissing: true});

    // Modal visibility state
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const [searchRequestResponseStatusCode, setSearchRequestResponseStatusCode] = useState<number | null>(null);
    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<ValueOf<
        typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT
    > | null>(null);
    const [isSorting, setIsSorting] = useState(false);

    const queryJSON = useMemo(() => buildSearchQueryJSON(route.params.q, route.params.rawQuery), [route.params.q, route.params.rawQuery]);
    const {saveScrollOffset} = useContext(ScrollOffsetContext);
    const hasOnlyPersonalPolicies = useMemo(() => hasOnlyPersonalPoliciesUtil(policies), [policies]);
    const searchResults = currentSearchResults;
    const {hash} = queryJSON ?? {};
    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['SmartScan'] as const);

    const lastNonEmptySearchResults = useRef<SearchResults | undefined>(undefined);

    // Use composition pattern hooks for business logic
    const bulkActions = useSearchBulkActions({
        queryJSON,
        setIsOfflineModalVisible,
        setIsDownloadErrorModalVisible,
    });

    const {
        headerButtonsOptions,
        latestBankItems,
        selectedPolicyIDs,
        selectedTransactionReportIDs,
        selectedReportIDs,
    } = useSearchHeaderOptions({
        queryJSON,
        searchResults,
        bulkActions,
        setIsOfflineModalVisible,
        setIsHoldEducationalModalVisible,
        setRejectModalAction,
    });

    const formValues = useFilterFormValues(queryJSON);

    // Sync the advanced filters form with the current query when it changes
    useEffect(() => {
        updateAdvancedFilters(formValues, true);
    }, [formValues]);

    useEffect(() => {
        confirmReadyToOpenApp();
    }, []);

    useEffect(() => {
        if (!currentSearchResults?.search?.type) {
            return;
        }

        setLastSearchType(currentSearchResults.search.type);
        if (currentSearchResults.data) {
            lastNonEmptySearchResults.current = currentSearchResults;
        }
    }, [lastSearchType, queryJSON, setLastSearchType, currentSearchResults]);

    // Peggy injects default sortBy/sortOrder at parse time, so queryJSON
    // can differ from the URL's raw query. When they diverge, we need to replace the URL
    useEffect(() => {
        if (!queryJSON || !route.params.q) {
            return;
        }
        const normalizedQueryString = buildSearchQueryString(queryJSON);
        if (normalizedQueryString !== route.params.q) {
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: normalizedQueryString}), {forceReplace: true});
        }
    }, [queryJSON, route.params.q]);

    // File handling for drag-and-drop receipt scanning
    const saveFileAndInitMoneyRequest = (files: FileObject[]) => {
        const initialTransaction = initMoneyRequest({
            isFromGlobalCreate: true,
            reportID: newReportID,
            personalPolicy,
            newIouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            report: newReport,
            parentReport: newParentReport,
            currentDate,
            currentUserPersonalDetails,
            hasOnlyPersonalPolicies,
        });

        const newReceiptFiles: ReceiptFile[] = [];

        for (const [index, file] of files.entries()) {
            const source = URL.createObjectURL(file as Blob);
            const transaction =
                index === 0
                    ? (initialTransaction as Partial<Transaction>)
                    : buildOptimisticTransactionAndCreateDraft({
                          initialTransaction: initialTransaction as Partial<Transaction>,
                          currentUserPersonalDetails,
                          reportID: newReportID,
                      });
            const transactionID = transaction.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
            newReceiptFiles.push({
                file,
                source,
                transactionID,
            });
            setMoneyRequestReceipt(transactionID, source, file.name ?? '', true, file.type);
        }

        if (isPaidGroupPolicy(activePolicy) && activePolicy?.isPolicyExpenseChatEnabled && !shouldRestrictUserBillableActions(activePolicy.id)) {
            const activePolicyExpenseChat = getPolicyExpenseChat(currentUserPersonalDetails.accountID, activePolicy?.id);
            const shouldAutoReport = !!activePolicy?.autoReporting || !!personalPolicy?.autoReporting;
            const transactionReportID = shouldAutoReport ? activePolicyExpenseChat?.reportID : CONST.REPORT.UNREPORTED_REPORT_ID;
            const setParticipantsPromises = newReceiptFiles.map((receiptFile) => {
                setTransactionReport(receiptFile.transactionID, {reportID: transactionReportID}, true);
                return setMoneyRequestParticipantsFromReport(receiptFile.transactionID, activePolicyExpenseChat, currentUserPersonalDetails.accountID);
            });
            Promise.all(setParticipantsPromises).then(() =>
                Navigation.navigate(
                    ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                        CONST.IOU.ACTION.CREATE,
                        CONST.IOU.TYPE.SUBMIT,
                        initialTransaction?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                        activePolicyExpenseChat?.reportID,
                    ),
                ),
            );
        } else {
            navigateToParticipantPage(CONST.IOU.TYPE.CREATE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, newReportID);
        }
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation(saveFileAndInitMoneyRequest);

    const initScanRequest = (e: DragEvent) => {
        const files = Array.from(e?.dataTransfer?.files ?? []);

        if (files.length === 0) {
            return;
        }
        for (const file of files) {
            // eslint-disable-next-line no-param-reassign
            file.uri = URL.createObjectURL(file);
        }

        validateFiles(files, Array.from(e.dataTransfer?.items ?? []));
    };

    const {resetVideoPlayerData} = usePlaybackContext();

    const metadata = searchResults?.search;
    const shouldShowFooter = !!metadata?.count || selectedTransactionsKeys.length > 0;

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
            search(value)?.then((jsonCode) => {
                setSearchRequestResponseStatusCode(Number(jsonCode ?? 0));
            });
        }
    }, []);

    const footerData = useMemo(() => {
        const shouldUseClientTotal = !metadata?.count || (selectedTransactionsKeys.length > 0 && !areAllMatchingItemsSelected);
        const selectedTransactionItems = Object.values(selectedTransactions);
        const currency = metadata?.currency ?? selectedTransactionItems.at(0)?.groupCurrency;
        const count = shouldUseClientTotal ? selectedTransactionsKeys.length : metadata?.count;
        const total = shouldUseClientTotal ? selectedTransactionItems.reduce((acc, transaction) => acc - (transaction.groupAmount ?? 0), 0) : metadata?.total;

        return {count, total, currency};
    }, [areAllMatchingItemsSelected, metadata?.count, metadata?.currency, metadata?.total, selectedTransactions, selectedTransactionsKeys.length]);

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
            Navigation.navigate(ROUTES.TRANSACTION_HOLD_REASON_RHP);
        }
    }, [hash, selectedTransactionsKeys.length, isOffline]);

    const dismissRejectModalBasedOnAction = useCallback(() => {
        if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD) {
            dismissRejectUseExplanation();
            if (hash && selectedTransactionsKeys.length > 0) {
                Navigation.navigate(ROUTES.TRANSACTION_HOLD_REASON_RHP);
            }
        } else {
            dismissRejectUseExplanation();
            Navigation.navigate(ROUTES.SEARCH_REJECT_REASON_RHP);
        }
        setRejectModalAction(null);
    }, [rejectModalAction, hash, selectedTransactionsKeys.length]);

    return (
        <>
            <Animated.View style={[styles.flex1]}>
                {shouldUseNarrowLayout ? (
                    <DragAndDropProvider>
                        {PDFValidationComponent}
                        <SearchPageNarrow
                            queryJSON={queryJSON}
                            metadata={metadata}
                            headerButtonsOptions={headerButtonsOptions}
                            searchResults={searchResults}
                            isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                            footerData={footerData}
                            currentSelectedPolicyID={selectedPolicyIDs?.at(0)}
                            currentSelectedReportID={selectedTransactionReportIDs?.at(0) ?? selectedReportIDs?.at(0)}
                            confirmPayment={bulkActions.onBulkPaySelected}
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
                        headerButtonsOptions={headerButtonsOptions}
                        footerData={footerData}
                        selectedPolicyIDs={selectedPolicyIDs}
                        selectedTransactionReportIDs={selectedTransactionReportIDs}
                        selectedReportIDs={selectedReportIDs}
                        latestBankItems={latestBankItems}
                        onBulkPaySelected={bulkActions.onBulkPaySelected}
                        handleSearchAction={handleSearchAction}
                        onSortPressedCallback={onSortPressedCallback}
                        scrollHandler={scrollHandler}
                        initScanRequest={initScanRequest}
                        PDFValidationComponent={PDFValidationComponent}
                        ErrorModal={ErrorModal}
                        shouldShowFooter={shouldShowFooter}
                    />
                )}
            </Animated.View>
            {(!shouldUseNarrowLayout || isMobileSelectionModeEnabled) && (
                <View>
                    <SearchOfflineModal
                        isVisible={isOfflineModalVisible}
                        onClose={handleOfflineModalClose}
                    />
                    <SearchDownloadErrorModal
                        isVisible={isDownloadErrorModalVisible}
                        onClose={handleDownloadErrorModalClose}
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
        </>
    );
}

SearchPage.whyDidYouRender = true;

export default SearchPage;
