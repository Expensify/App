import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import {useSearchContext} from '@components/Search/SearchContext';
import SearchFiltersBar from '@components/Search/SearchPageHeader/SearchFiltersBar';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {PaymentData, SearchParams} from '@components/Search/types';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {confirmReadyToOpenApp} from '@libs/actions/App';
import {searchInServer} from '@libs/actions/Report';
import {
    approveMoneyRequestOnSearch,
    deleteMoneyRequestOnSearch,
    exportSearchItemsToCSV,
    getLastPolicyPaymentMethod,
    payMoneyRequestOnSearch,
    queueExportSearchItemsToCSV,
    search,
    unholdMoneyRequestOnSearch,
} from '@libs/actions/Search';
import {navigateToParticipantPage} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {hasVBBA, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {generateReportID, getPolicyExpenseChat} from '@libs/ReportUtils';
import {buildCannedSearchQuery, buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import variables from '@styles/variables';
import {initMoneyRequest, setMoneyRequestParticipantsFromReport, setMoneyRequestReceipt} from '@userActions/IOU';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SearchResults, Transaction} from '@src/types/onyx';
import SearchPageNarrow from './SearchPageNarrow';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const {selectedTransactions, clearSelectedTransactions, selectedReports, lastSearchType, setLastSearchType, isExportMode, setExportMode} = useSearchContext();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const [lastPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: false});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});

    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const [isDeleteExpensesConfirmModalVisible, setIsDeleteExpensesConfirmModalVisible] = useState(false);
    const [isDownloadExportModalVisible, setIsDownloadExportModalVisible] = useState(false);

    const {q} = route.params;
    const queryJSON = useMemo(() => buildSearchQueryJSON(q), [q]);

    // eslint-disable-next-line rulesdir/no-default-id-values
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    const lastNonEmptySearchResults = useRef<SearchResults | undefined>(undefined);

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

    const {status, hash} = queryJSON ?? {};
    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

    const headerButtonsOptions = useMemo(() => {
        if (selectedTransactionsKeys.length === 0 || status == null || !hash) {
            return [];
        }

        const options: Array<DropdownOption<SearchHeaderOptionValue>> = [];
        const isAnyTransactionOnHold = Object.values(selectedTransactions).some((transaction) => transaction.isHeld);

        const downloadButtonOption: DropdownOption<SearchHeaderOptionValue> = {
            icon: Expensicons.Download,
            text: translate('common.download'),
            value: CONST.SEARCH.BULK_ACTION_TYPES.EXPORT,
            shouldCloseModalOnSelect: true,
            onSelected: () => {
                if (isOffline) {
                    setIsOfflineModalVisible(true);
                    return;
                }

                if (isExportMode) {
                    setIsDownloadExportModalVisible(true);
                    return;
                }

                const reportIDList = selectedReports?.filter((report) => !!report).map((report) => report.reportID) ?? [];
                exportSearchItemsToCSV(
                    {
                        query: status,
                        jsonQuery: JSON.stringify(queryJSON),
                        reportIDList,
                        transactionIDList: selectedTransactionsKeys,
                    },
                    () => {
                        setIsDownloadErrorModalVisible(true);
                    },
                );
                clearSelectedTransactions();
            },
        };

        if (isExportMode) {
            return [downloadButtonOption];
        }

        const shouldShowApproveOption =
            !isOffline &&
            !isAnyTransactionOnHold &&
            (selectedReports.length
                ? selectedReports.every((report) => report.action === CONST.SEARCH.ACTION_TYPES.APPROVE)
                : selectedTransactionsKeys.every((id) => selectedTransactions[id].action === CONST.SEARCH.ACTION_TYPES.APPROVE));

        if (shouldShowApproveOption) {
            options.push({
                icon: Expensicons.ThumbsUp,
                text: translate('search.bulkActions.approve'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.APPROVE,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    const transactionIDList = selectedReports.length ? undefined : Object.keys(selectedTransactions);
                    const reportIDList = !selectedReports.length
                        ? Object.values(selectedTransactions).map((transaction) => transaction.reportID)
                        : (selectedReports?.filter((report) => !!report).map((report) => report.reportID) ?? []);
                    approveMoneyRequestOnSearch(hash, reportIDList, transactionIDList);
                    InteractionManager.runAfterInteractions(() => {
                        clearSelectedTransactions();
                    });
                },
            });
        }

        const shouldShowPayOption =
            !isOffline &&
            !isAnyTransactionOnHold &&
            (selectedReports.length
                ? selectedReports.every((report) => report.action === CONST.SEARCH.ACTION_TYPES.PAY && report.policyID && getLastPolicyPaymentMethod(report.policyID, lastPaymentMethods))
                : selectedTransactionsKeys.every(
                      (id) =>
                          selectedTransactions[id].action === CONST.SEARCH.ACTION_TYPES.PAY &&
                          selectedTransactions[id].policyID &&
                          getLastPolicyPaymentMethod(selectedTransactions[id].policyID, lastPaymentMethods),
                  ));

        if (shouldShowPayOption) {
            options.push({
                icon: Expensicons.MoneyBag,
                text: translate('search.bulkActions.pay'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.PAY,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    const activeRoute = Navigation.getActiveRoute();
                    const transactionIDList = selectedReports.length ? undefined : Object.keys(selectedTransactions);
                    const items = selectedReports.length ? selectedReports : Object.values(selectedTransactions);

                    for (const item of items) {
                        const itemPolicyID = item.policyID;
                        const lastPolicyPaymentMethod = getLastPolicyPaymentMethod(itemPolicyID, lastPaymentMethods);

                        if (!lastPolicyPaymentMethod) {
                            Navigation.navigate(
                                ROUTES.SEARCH_REPORT.getRoute({
                                    reportID: item.reportID,
                                    backTo: activeRoute,
                                }),
                            );
                            return;
                        }

                        const hasPolicyVBBA = hasVBBA(itemPolicyID);

                        if (lastPolicyPaymentMethod !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE && !hasPolicyVBBA) {
                            Navigation.navigate(
                                ROUTES.SEARCH_REPORT.getRoute({
                                    reportID: item.reportID,
                                    backTo: activeRoute,
                                }),
                            );
                            return;
                        }
                    }

                    const paymentData = (
                        selectedReports.length
                            ? selectedReports.map((report) => ({
                                  reportID: report.reportID,
                                  amount: report.total,
                                  paymentType: getLastPolicyPaymentMethod(report.policyID, lastPaymentMethods),
                              }))
                            : Object.values(selectedTransactions).map((transaction) => ({
                                  reportID: transaction.reportID,
                                  amount: transaction.amount,
                                  paymentType: getLastPolicyPaymentMethod(transaction.policyID, lastPaymentMethods),
                              }))
                    ) as PaymentData[];

                    payMoneyRequestOnSearch(hash, paymentData, transactionIDList);
                    InteractionManager.runAfterInteractions(() => {
                        clearSelectedTransactions();
                    });
                },
            });
        }

        options.push(downloadButtonOption);

        const shouldShowHoldOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canHold);

        if (shouldShowHoldOption) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: translate('search.bulkActions.hold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.HOLD,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    Navigation.navigate(ROUTES.TRANSACTION_HOLD_REASON_RHP);
                },
            });
        }

        const shouldShowUnholdOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canUnhold);

        if (shouldShowUnholdOption) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: translate('search.bulkActions.unhold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    unholdMoneyRequestOnSearch(hash, selectedTransactionsKeys);
                    InteractionManager.runAfterInteractions(() => {
                        clearSelectedTransactions();
                    });
                },
            });
        }

        const canAllTransactionsBeMoved = selectedTransactionsKeys.every((id) => selectedTransactions[id].canChangeReport);

        if (canAllTransactionsBeMoved) {
            options.push({
                text: translate('iou.moveExpenses', {count: selectedTransactionsKeys.length}),
                icon: Expensicons.DocumentMerge,
                value: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_REPORT,
                shouldCloseModalOnSelect: true,
                onSelected: () => Navigation.navigate(ROUTES.MOVE_TRANSACTIONS_SEARCH_RHP),
            });
        }

        const shouldShowDeleteOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canDelete);

        if (shouldShowDeleteOption) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate('search.bulkActions.delete'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.DELETE,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }
                    setIsDeleteExpensesConfirmModalVisible(true);
                },
            });
        }

        if (options.length === 0) {
            const emptyOptionStyle = {
                interactive: false,
                iconFill: theme.icon,
                iconHeight: variables.iconSizeLarge,
                iconWidth: variables.iconSizeLarge,
                numberOfLinesTitle: 2,
                titleStyle: {...styles.colorMuted, ...styles.fontWeightNormal, ...styles.textWrap},
            };

            options.push({
                icon: Expensicons.Exclamation,
                text: translate('search.bulkActions.noOptionsAvailable'),
                value: undefined,
                ...emptyOptionStyle,
            });
        }

        return options;
    }, [
        selectedTransactionsKeys,
        status,
        hash,
        selectedTransactions,
        translate,
        isExportMode,
        isOffline,
        selectedReports,
        queryJSON,
        clearSelectedTransactions,
        lastPaymentMethods,
        theme.icon,
        styles.colorMuted,
        styles.fontWeightNormal,
        styles.textWrap,
    ]);

    const handleDeleteExpenses = () => {
        if (selectedTransactionsKeys.length === 0 || !hash) {
            return;
        }

        setIsDeleteExpensesConfirmModalVisible(false);
        deleteMoneyRequestOnSearch(hash, selectedTransactionsKeys);

        // Translations copy for delete modal depends on amount of selected items,
        // We need to wait for modal to fully disappear before clearing them to avoid translation flicker between singular vs plural
        InteractionManager.runAfterInteractions(() => {
            clearSelectedTransactions();
        });
    };

    const saveFileAndInitMoneyRequest = (files: FileObject[]) => {
        const newReportID = generateReportID();
        const initialTransaction = initMoneyRequest({
            isFromGlobalCreate: true,
            reportID: newReportID,
            newIouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
        });

        const newReceiptFiles: ReceiptFile[] = [];

        files.forEach((file, index) => {
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
            setMoneyRequestReceipt(transactionID, source, file.name ?? '', true);
        });

        if (isPaidGroupPolicy(activePolicy) && activePolicy?.isPolicyExpenseChatEnabled && !shouldRestrictUserBillableActions(activePolicy.id)) {
            const activePolicyExpenseChat = getPolicyExpenseChat(currentUserPersonalDetails.accountID, activePolicy?.id);
            const setParticipantsPromises = newReceiptFiles.map((receiptFile) => setMoneyRequestParticipantsFromReport(receiptFile.transactionID, activePolicyExpenseChat));
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
        files.forEach((file) => {
            // eslint-disable-next-line no-param-reassign
            file.uri = URL.createObjectURL(file);
        });

        validateFiles(files);
    };

    const createExportAll = useCallback(() => {
        if (selectedTransactionsKeys.length === 0 || status == null || !hash) {
            return [];
        }

        setIsDownloadExportModalVisible(false);
        const reportIDList = selectedReports?.filter((report) => !!report).map((report) => report.reportID) ?? [];
        queueExportSearchItemsToCSV({
            query: status,
            jsonQuery: JSON.stringify(queryJSON),
            reportIDList,
            transactionIDList: selectedTransactionsKeys,
        });
        setExportMode(false);
        clearSelectedTransactions();
    }, [selectedTransactionsKeys, status, hash, selectedReports, queryJSON, setExportMode, clearSelectedTransactions]);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));
    const {resetVideoPlayerData} = usePlaybackContext();
    const shouldShowOfflineIndicator = currentSearchResults?.data ?? lastNonEmptySearchResults.current;

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
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearchAction = useCallback((value: SearchParams | string) => {
        if (typeof value === 'string') {
            searchInServer(value);
        } else {
            search(value);
        }
    }, []);

    if (shouldUseNarrowLayout) {
        return (
            <>
                <DragAndDropProvider>
                    {PDFValidationComponent}
                    <SearchPageNarrow
                        queryJSON={queryJSON}
                        headerButtonsOptions={headerButtonsOptions}
                        searchResults={currentSearchResults?.data ? currentSearchResults : lastNonEmptySearchResults.current}
                        isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    />
                    <DragAndDropConsumer onDrop={initScanRequest}>
                        <DropZoneUI
                            icon={Expensicons.SmartScan}
                            dropTitle={translate('dropzone.scanReceipts')}
                            dropStyles={styles.receiptDropOverlay(true)}
                            dropTextStyles={styles.receiptDropText}
                            dropInnerWrapperStyles={styles.receiptDropInnerWrapper(true)}
                            dropWrapperStyles={{marginBottom: variables.bottomTabHeight}}
                        />
                    </DragAndDropConsumer>
                    {ErrorModal}
                </DragAndDropProvider>
                {isMobileSelectionModeEnabled && (
                    <View>
                        <ConfirmModal
                            isVisible={isDeleteExpensesConfirmModalVisible}
                            onConfirm={handleDeleteExpenses}
                            onCancel={() => {
                                setIsDeleteExpensesConfirmModalVisible(false);
                            }}
                            title={translate('iou.deleteExpense', {count: selectedTransactionsKeys.length})}
                            prompt={translate('iou.deleteConfirmation', {count: selectedTransactionsKeys.length})}
                            confirmText={translate('common.delete')}
                            cancelText={translate('common.cancel')}
                            danger
                        />
                        <DecisionModal
                            title={translate('common.youAppearToBeOffline')}
                            prompt={translate('common.offlinePrompt')}
                            isSmallScreenWidth={isSmallScreenWidth}
                            onSecondOptionSubmit={() => setIsOfflineModalVisible(false)}
                            secondOptionText={translate('common.buttonConfirm')}
                            isVisible={isOfflineModalVisible}
                            onClose={() => setIsOfflineModalVisible(false)}
                        />
                        <DecisionModal
                            title={translate('common.downloadFailedTitle')}
                            prompt={translate('common.downloadFailedDescription')}
                            isSmallScreenWidth={isSmallScreenWidth}
                            onSecondOptionSubmit={() => setIsDownloadErrorModalVisible(false)}
                            secondOptionText={translate('common.buttonConfirm')}
                            isVisible={isDownloadErrorModalVisible}
                            onClose={() => setIsDownloadErrorModalVisible(false)}
                        />
                    </View>
                )}
            </>
        );
    }

    return (
        <ScreenWrapper
            testID={Search.displayName}
            shouldEnableMaxHeight
            headerGapStyles={[styles.searchHeaderGap, styles.h0]}
        >
            <FullPageNotFoundView
                shouldForceFullScreen
                shouldShow={!queryJSON}
                onBackButtonPress={handleOnBackButtonPress}
                shouldShowLink={false}
            >
                {!!queryJSON && (
                    <View style={styles.searchSplitContainer}>
                        <ScreenWrapper
                            testID={Search.displayName}
                            shouldShowOfflineIndicatorInWideScreen={!!shouldShowOfflineIndicator}
                            offlineIndicatorStyle={styles.mtAuto}
                        >
                            <DragAndDropProvider>
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
                                />
                                <Search
                                    key={queryJSON.hash}
                                    queryJSON={queryJSON}
                                    searchResults={currentSearchResults?.data ? currentSearchResults : lastNonEmptySearchResults.current}
                                    handleSearch={handleSearchAction}
                                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                />
                                <DragAndDropConsumer onDrop={initScanRequest}>
                                    <DropZoneUI
                                        icon={Expensicons.SmartScan}
                                        dropTitle={translate('dropzone.scanReceipts')}
                                        dropStyles={styles.receiptDropOverlay(true)}
                                        dropTextStyles={styles.receiptDropText}
                                        dropInnerWrapperStyles={styles.receiptDropInnerWrapper(true)}
                                    />
                                </DragAndDropConsumer>
                            </DragAndDropProvider>
                        </ScreenWrapper>
                        {ErrorModal}
                    </View>
                )}
                <ConfirmModal
                    isVisible={isDeleteExpensesConfirmModalVisible}
                    onConfirm={handleDeleteExpenses}
                    onCancel={() => {
                        setIsDeleteExpensesConfirmModalVisible(false);
                    }}
                    title={translate('iou.deleteExpense', {count: selectedTransactionsKeys.length})}
                    prompt={translate('iou.deleteConfirmation', {count: selectedTransactionsKeys.length})}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <ConfirmModal
                    isVisible={isDownloadExportModalVisible}
                    onConfirm={createExportAll}
                    onCancel={() => {
                        setIsDownloadExportModalVisible(false);
                    }}
                    title={translate('search.exportSearchResults.title')}
                    prompt={translate('search.exportSearchResults.description')}
                    confirmText={translate('search.exportSearchResults.title')}
                    cancelText={translate('common.cancel')}
                />
                <DecisionModal
                    title={translate('common.youAppearToBeOffline')}
                    prompt={translate('common.offlinePrompt')}
                    isSmallScreenWidth={isSmallScreenWidth}
                    onSecondOptionSubmit={() => setIsOfflineModalVisible(false)}
                    secondOptionText={translate('common.buttonConfirm')}
                    isVisible={isOfflineModalVisible}
                    onClose={() => setIsOfflineModalVisible(false)}
                />
                <DecisionModal
                    title={translate('common.downloadFailedTitle')}
                    prompt={translate('common.downloadFailedDescription')}
                    isSmallScreenWidth={isSmallScreenWidth}
                    onSecondOptionSubmit={() => setIsDownloadErrorModalVisible(false)}
                    secondOptionText={translate('common.buttonConfirm')}
                    isVisible={isDownloadErrorModalVisible}
                    onClose={() => setIsDownloadErrorModalVisible(false)}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchPage.displayName = 'SearchPage';
SearchPage.whyDidYouRender = true;

export default SearchPage;
