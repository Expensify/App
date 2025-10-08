import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PaymentMethodType} from '@components/KYCWall/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import Search from '@components/Search';
import {useSearchContext} from '@components/Search/SearchContext';
import SearchPageFooter from '@components/Search/SearchPageFooter';
import SearchFiltersBar from '@components/Search/SearchPageHeader/SearchFiltersBar';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {PaymentData, SearchParams} from '@components/Search/types';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useBulkPayOptions from '@hooks/useBulkPayOptions';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {confirmReadyToOpenApp} from '@libs/actions/App';
import {searchInServer} from '@libs/actions/Report';
import {
    approveMoneyRequestOnSearch,
    deleteMoneyRequestOnSearch,
    exportSearchItemsToCSV,
    getExportTemplates,
    getLastPolicyPaymentMethod,
    getPayOption,
    payMoneyRequestOnSearch,
    queueExportSearchItemsToCSV,
    queueExportSearchWithTemplate,
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
    const {isBetaEnabled} = usePermissions();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const {selectedTransactions, clearSelectedTransactions, selectedReports, lastSearchType, setLastSearchType, areAllMatchingItemsSelected, selectAllMatchingItems} = useSearchContext();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const [lastPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE, {canBeMissing: true});
    const newReportID = generateReportID();
    const [newReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${newReportID}`, {canBeMissing: true});
    const [newParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${newReport?.parentReportID}`, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: false});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES, {canBeMissing: true});
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS, {canBeMissing: true});
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const [isDeleteExpensesConfirmModalVisible, setIsDeleteExpensesConfirmModalVisible] = useState(false);
    const [isDownloadExportModalVisible, setIsDownloadExportModalVisible] = useState(false);
    const [isExportWithTemplateModalVisible, setIsExportWithTemplateModalVisible] = useState(false);
    const queryJSON = useMemo(() => buildSearchQueryJSON(route.params.q), [route.params.q]);
    const {saveScrollOffset} = useContext(ScrollOffsetContext);

    // eslint-disable-next-line rulesdir/no-default-id-values
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    const lastNonEmptySearchResults = useRef<SearchResults | undefined>(undefined);
    const selectedTransactionReportIDs = useMemo(() => [...new Set(Object.values(selectedTransactions).map((transaction) => transaction.reportID))], [selectedTransactions]);
    const selectedReportIDs = Object.values(selectedReports).map((report) => report.reportID);

    const isBetaBulkPayEnabled = isBetaEnabled(CONST.BETAS.PAYMENT_BUTTONS);

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

    const {bulkPayButtonOptions, latestBankItems} = useBulkPayOptions({
        selectedPolicyID: selectedPolicyIDs.at(0),
        selectedReportID: selectedTransactionReportIDs.at(0) ?? selectedReportIDs.at(0),
    });

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

    const beginExportWithTemplate = useCallback(
        (templateName: string, templateType: string, policyID: string | undefined) => {
            // If the user has selected a large number of items, we'll use the queryJSON to search for the reportIDs and transactionIDs necessary for the export
            if (areAllMatchingItemsSelected) {
                queueExportSearchWithTemplate({templateName, templateType, jsonQuery: JSON.stringify(queryJSON), reportIDList: [], transactionIDList: [], policyID});
            } else {
                // Otherwise, we will use the selected transactionIDs and reportIDs directly
                queueExportSearchWithTemplate({
                    templateName,
                    templateType,
                    jsonQuery: '{}',
                    reportIDList: selectedTransactionReportIDs,
                    transactionIDList: selectedTransactionsKeys,
                    policyID,
                });
            }

            setIsExportWithTemplateModalVisible(true);
        },
        [queryJSON, selectedTransactionsKeys, areAllMatchingItemsSelected, selectedTransactionReportIDs],
    );

    const onBulkPaySelected = useCallback(
        (paymentMethod?: PaymentMethodType) => {
            if (!hash) {
                return;
            }
            if (isOffline) {
                setIsOfflineModalVisible(true);
                return;
            }

            const activeRoute = Navigation.getActiveRoute();
            const transactionIDList = selectedReports.length ? undefined : Object.keys(selectedTransactions);
            const selectedOptions = selectedReports.length ? selectedReports : Object.values(selectedTransactions);

            for (const item of selectedOptions) {
                const itemPolicyID = item.policyID;
                const lastPolicyPaymentMethod = getLastPolicyPaymentMethod(itemPolicyID, lastPaymentMethods) ?? paymentMethod;

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
                          paymentType: getLastPolicyPaymentMethod(report.policyID, lastPaymentMethods) ?? paymentMethod,
                      }))
                    : Object.values(selectedTransactions).map((transaction) => ({
                          reportID: transaction.reportID,
                          amount: transaction.amount,
                          paymentType: getLastPolicyPaymentMethod(transaction.policyID, lastPaymentMethods) ?? paymentMethod,
                      }))
            ) as PaymentData[];

            payMoneyRequestOnSearch(hash, paymentData, transactionIDList);
            InteractionManager.runAfterInteractions(() => {
                clearSelectedTransactions();
            });
        },
        [clearSelectedTransactions, hash, isOffline, lastPaymentMethods, selectedReports, selectedTransactions],
    );

    const headerButtonsOptions = useMemo(() => {
        if (selectedTransactionsKeys.length === 0 || status == null || !hash) {
            return CONST.EMPTY_ARRAY as unknown as Array<DropdownOption<SearchHeaderOptionValue>>;
        }

        const options: Array<DropdownOption<SearchHeaderOptionValue>> = [];
        const isAnyTransactionOnHold = Object.values(selectedTransactions).some((transaction) => transaction.isHeld);

        // Gets the list of options for the export sub-menu
        const getExportOptions = () => {
            // We provide the basic and expense level export options by default
            const exportOptions: PopoverMenuItem[] = [
                {
                    text: translate('export.basicExport'),
                    icon: Expensicons.Table,
                    onSelected: () => {
                        if (isOffline) {
                            setIsOfflineModalVisible(true);
                            return;
                        }

                        if (areAllMatchingItemsSelected) {
                            setIsDownloadExportModalVisible(true);
                            return;
                        }

                        exportSearchItemsToCSV(
                            {
                                query: status,
                                jsonQuery: JSON.stringify(queryJSON),
                                reportIDList: selectedReports?.filter((report) => !!report).map((report) => report.reportID) ?? [],
                                transactionIDList: selectedTransactionsKeys,
                            },
                            () => {
                                setIsDownloadErrorModalVisible(true);
                            },
                        );
                        clearSelectedTransactions(undefined, true);
                    },
                    shouldCloseModalOnSelect: true,
                    shouldCallAfterModalHide: true,
                },
            ];

            // Determine if only full reports are selected by comparing the reportIDs of the selected transactions and the reportIDs of the selected reports
            const areFullReportsSelected = selectedTransactionReportIDs.length === selectedReportIDs.length && selectedTransactionReportIDs.every((id) => selectedReportIDs.includes(id));
            const groupByReports = queryJSON?.groupBy === CONST.SEARCH.GROUP_BY.REPORTS;
            const typeInvoice = queryJSON?.type === CONST.REPORT.TYPE.INVOICE;
            const typeExpense = queryJSON?.type === CONST.REPORT.TYPE.EXPENSE;
            const isAllOneTransactionReport = Object.values(selectedTransactions).every((transaction) => transaction.isFromOneTransactionReport);

            // If we're grouping by invoice or report, and all the expenses on the report are selected, or if all
            // the selected expenses are the only expenses of their parent expense report include the report level export option.
            const includeReportLevelExport = ((groupByReports || typeInvoice) && areFullReportsSelected) || (typeExpense && !groupByReports && isAllOneTransactionReport);

            // Collect a list of export templates available to the user from their account, policy, and custom integrations templates
            const policy = selectedPolicyIDs.length === 1 ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedPolicyIDs.at(0)}`] : undefined;
            const exportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, policy, includeReportLevelExport);
            for (const template of exportTemplates) {
                exportOptions.push({
                    text: template.name,
                    icon: Expensicons.Table,
                    description: template.description,
                    onSelected: () => {
                        beginExportWithTemplate(template.templateName, template.type, template.policyID);
                    },
                    shouldCloseModalOnSelect: true,
                    shouldCallAfterModalHide: true,
                });
            }

            return exportOptions;
        };

        const exportButtonOption: DropdownOption<SearchHeaderOptionValue> & Pick<PopoverMenuItem, 'rightIcon'> = {
            icon: Expensicons.Export,
            rightIcon: Expensicons.ArrowRight,
            text: translate('common.export'),
            backButtonText: translate('common.export'),
            value: CONST.SEARCH.BULK_ACTION_TYPES.EXPORT,
            shouldCloseModalOnSelect: true,
            subMenuItems: getExportOptions(),
        };

        // If all matching items are selected, we don't give the user additional options, we only allow them to export the selected items
        if (areAllMatchingItemsSelected) {
            return [exportButtonOption];
        }

        // Otherwise, we provide the full set of options depending on the state of the selected transactions and reports
        const shouldShowApproveOption =
            !isOffline &&
            !isAnyTransactionOnHold &&
            (selectedReports.length
                ? selectedReports.every((report) => report.allActions.includes(CONST.SEARCH.ACTION_TYPES.APPROVE))
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
                    // eslint-disable-next-line deprecation/deprecation
                    InteractionManager.runAfterInteractions(() => {
                        clearSelectedTransactions();
                    });
                },
            });
        }
        const shouldEnableExpenseBulk = selectedReports.length
            ? selectedReports.every(
                  (report) => report.allActions.includes(CONST.SEARCH.ACTION_TYPES.PAY) && report.policyID && getLastPolicyPaymentMethod(report.policyID, lastPaymentMethods),
              )
            : selectedTransactionsKeys.every(
                  (id) =>
                      selectedTransactions[id].action === CONST.SEARCH.ACTION_TYPES.PAY &&
                      selectedTransactions[id].policyID &&
                      getLastPolicyPaymentMethod(selectedTransactions[id].policyID, lastPaymentMethods),
              );

        const {shouldEnableBulkPayOption, isFirstTimePayment} = getPayOption(selectedReports, selectedTransactions, lastPaymentMethods, selectedReportIDs);

        const shouldShowPayOption = !isOffline && !isAnyTransactionOnHold && (isBetaBulkPayEnabled ? shouldEnableBulkPayOption : shouldEnableExpenseBulk);

        if (shouldShowPayOption) {
            const payButtonOption = {
                icon: Expensicons.MoneyBag,
                text: translate('search.bulkActions.pay'),
                rightIcon: isFirstTimePayment ? Expensicons.ArrowRight : undefined,
                value: CONST.SEARCH.BULK_ACTION_TYPES.PAY,
                shouldCloseModalOnSelect: true,
                subMenuItems: isFirstTimePayment ? bulkPayButtonOptions : undefined,
                onSelected: () => onBulkPaySelected(undefined),
            };
            options.push(payButtonOption);
        }

        options.push(exportButtonOption);

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
                    // eslint-disable-next-line deprecation/deprecation
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

                    // Use InteractionManager to ensure this runs after the dropdown modal closes
                    // eslint-disable-next-line deprecation/deprecation
                    InteractionManager.runAfterInteractions(() => {
                        setIsDeleteExpensesConfirmModalVisible(true);
                    });
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
        areAllMatchingItemsSelected,
        isOffline,
        selectedReports,
        queryJSON,
        clearSelectedTransactions,
        lastPaymentMethods,
        theme.icon,
        styles.colorMuted,
        styles.fontWeightNormal,
        styles.textWrap,
        beginExportWithTemplate,
        integrationsExportTemplates,
        csvExportLayouts,
        policies,
        bulkPayButtonOptions,
        onBulkPaySelected,
        selectedPolicyIDs,
        selectedReportIDs,
        selectedTransactionReportIDs,
        isBetaBulkPayEnabled,
    ]);

    const handleDeleteExpenses = () => {
        if (selectedTransactionsKeys.length === 0 || !hash) {
            return;
        }

        setIsDeleteExpensesConfirmModalVisible(false);

        // Translations copy for delete modal depends on amount of selected items,
        // We need to wait for modal to fully disappear before clearing them to avoid translation flicker between singular vs plural
        // eslint-disable-next-line deprecation/deprecation
        InteractionManager.runAfterInteractions(() => {
            deleteMoneyRequestOnSearch(hash, selectedTransactionsKeys);
            clearSelectedTransactions();
        });
    };

    const saveFileAndInitMoneyRequest = (files: FileObject[]) => {
        const initialTransaction = initMoneyRequest({
            isFromGlobalCreate: true,
            reportID: newReportID,
            newIouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            report: newReport,
            parentReport: newParentReport,
            currentDate,
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

        validateFiles(files, Array.from(e.dataTransfer?.items ?? []));
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
        selectAllMatchingItems(false);
        clearSelectedTransactions();
    }, [selectedTransactionsKeys, status, hash, selectedReports, queryJSON, selectAllMatchingItems, clearSelectedTransactions]);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));
    const {resetVideoPlayerData} = usePlaybackContext();

    const [isSorting, setIsSorting] = useState(false);

    let searchResults;
    if (currentSearchResults?.data) {
        searchResults = currentSearchResults;
    } else if (isSorting) {
        searchResults = lastNonEmptySearchResults.current;
    }

    const metadata = searchResults?.search;
    const shouldShowOfflineIndicator = !!searchResults?.data;
    const shouldShowFooter = !!metadata?.count;

    const offlineIndicatorStyle = useMemo(() => {
        if (shouldShowFooter) {
            return [styles.mtAuto, styles.pAbsolute, styles.h10, styles.b0];
        }

        return [styles.mtAuto];
    }, [shouldShowFooter, styles]);

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
            search(value);
        }
    }, []);

    const footerData = useMemo(() => {
        const shouldUseClientTotal = selectedTransactionsKeys.length > 0 && !areAllMatchingItemsSelected;

        const currency = metadata?.currency;
        const count = shouldUseClientTotal ? selectedTransactionsKeys.length : metadata?.count;
        const total = shouldUseClientTotal ? Object.values(selectedTransactions).reduce((acc, transaction) => acc - (transaction.convertedAmount ?? 0), 0) : metadata?.total;

        return {count, total, currency};
    }, [areAllMatchingItemsSelected, metadata?.count, metadata?.currency, metadata?.total, selectedTransactions, selectedTransactionsKeys.length]);

    if (shouldUseNarrowLayout) {
        return (
            <>
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
                        confirmPayment={onBulkPaySelected}
                        latestBankItems={latestBankItems}
                    />
                    <DragAndDropConsumer onDrop={initScanRequest}>
                        <DropZoneUI
                            icon={Expensicons.SmartScan}
                            dropTitle={translate('dropzone.scanReceipts')}
                            dropStyles={styles.receiptDropOverlay(true)}
                            dropTextStyles={styles.receiptDropText}
                            dropWrapperStyles={{marginBottom: variables.bottomTabHeight}}
                            dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                        />
                    </DragAndDropConsumer>
                    {ErrorModal}
                </DragAndDropProvider>
                {!!isMobileSelectionModeEnabled && (
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
                        <ConfirmModal
                            isVisible={isExportWithTemplateModalVisible}
                            onConfirm={() => {
                                setIsExportWithTemplateModalVisible(false);
                                clearSelectedTransactions(undefined, true);
                            }}
                            onCancel={() => setIsExportWithTemplateModalVisible(false)}
                            title={translate('export.exportInProgress')}
                            prompt={translate('export.conciergeWillSend')}
                            confirmText={translate('common.buttonConfirm')}
                            shouldShowCancelButton={false}
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
                            offlineIndicatorStyle={offlineIndicatorStyle}
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
                                    onSearchListScroll={(e) => {
                                        if (!e.nativeEvent.contentOffset.y) {
                                            return;
                                        }

                                        saveScrollOffset(route, e.nativeEvent.contentOffset.y);
                                    }}
                                    onSortPressedCallback={() => {
                                        setIsSorting(true);
                                    }}
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
                                        dashedBorderStyles={[
                                            styles.dropzoneArea,
                                            styles.easeInOpacityTransition,
                                            styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true),
                                        ]}
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
                <ConfirmModal
                    isVisible={isExportWithTemplateModalVisible}
                    onConfirm={() => {
                        setIsExportWithTemplateModalVisible(false);
                        clearSelectedTransactions(undefined, true);
                    }}
                    onCancel={() => setIsExportWithTemplateModalVisible(false)}
                    title={translate('export.exportInProgress')}
                    prompt={translate('export.conciergeWillSend')}
                    confirmText={translate('common.buttonConfirm')}
                    shouldShowCancelButton={false}
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
