import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {InteractionManager, View} from 'react-native';
import Animated from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import DecisionModal from '@components/DecisionModal';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import HoldOrRejectEducationalModal from '@components/HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from '@components/HoldSubmitterEducationalModal';
import type {PaymentMethodType} from '@components/KYCWall/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {PaymentData, SearchParams} from '@components/Search/types';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useAllTransactions from '@hooks/useAllTransactions';
import useBulkPayOptions from '@hooks/useBulkPayOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useFilterFormValues from '@hooks/useFilterFormValues';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {moveIOUReportToPolicy, moveIOUReportToPolicyAndInviteSubmitter, searchInServer} from '@libs/actions/Report';
import {
    approveMoneyRequestOnSearch,
    deleteMoneyRequestOnSearch,
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
import {setTransactionReport} from '@libs/actions/Transaction';
import {setNameValuePair} from '@libs/actions/User';
import {navigateToParticipantPage} from '@libs/IOUUtils';
import {getTransactionsAndReportsFromSearch} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {getActiveAdminWorkspaces, hasDynamicExternalWorkflow, hasOnlyPersonalPolicies as hasOnlyPersonalPoliciesUtil, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {isMergeActionForSelectedTransactions} from '@libs/ReportSecondaryActionUtils';
import {
    generateReportID,
    getPolicyExpenseChat,
    getReportOrDraftReport,
    isBusinessInvoiceRoom,
    isCurrentUserSubmitter,
    isExpenseReport as isExpenseReportUtil,
    isInvoiceReport,
    isIOUReport as isIOUReportUtil,
} from '@libs/ReportUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {shouldShowDeleteOption} from '@libs/SearchUIUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {hasTransactionBeenRejected} from '@libs/TransactionUtils';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import variables from '@styles/variables';
import {canIOUBePaid, dismissRejectUseExplanation, initMoneyRequest, initSplitExpense, setMoneyRequestParticipantsFromReport, setMoneyRequestReceipt} from '@userActions/IOU';
import {openOldDotLink} from '@userActions/Link';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy, Report, SearchResults, Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
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
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const {selectedTransactions, clearSelectedTransactions, selectedReports, lastSearchType, setLastSearchType, areAllMatchingItemsSelected, selectAllMatchingItems, currentSearchResults} =
        useSearchContext();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const allTransactions = useAllTransactions();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [lastPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE, {canBeMissing: true});
    const newReportID = generateReportID();

    const [newReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${newReportID}`, {canBeMissing: true});
    const [newParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${newReport?.parentReportID}`, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: false});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});
    const [personalPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${personalPolicyID}`, {canBeMissing: true});
    const [draftTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES, {canBeMissing: true});
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS, {canBeMissing: true});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});

    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const [searchRequestResponseStatusCode, setSearchRequestResponseStatusCode] = useState<number | null>(null);
    const {showConfirmModal} = useConfirmModal();
    const {isBetaEnabled} = usePermissions();
    const isDEWBetaEnabled = isBetaEnabled(CONST.BETAS.NEW_DOT_DEW);
    const isCustomReportNamesBetaEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_REPORT_NAMES);
    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<ValueOf<
        typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT
    > | null>(null);

    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION, {canBeMissing: true});
    const [dismissedHoldUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {canBeMissing: true});

    const queryJSON = useMemo(() => buildSearchQueryJSON(route.params.q, route.params.rawQuery, translate), [route.params.q, route.params.rawQuery, translate]);
    const {saveScrollOffset} = useContext(ScrollOffsetContext);
    const activeAdminPolicies = getActiveAdminWorkspaces(policies, currentUserPersonalDetails?.accountID.toString()).sort((a, b) => localeCompare(a.name || '', b.name || ''));
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
    const hasOnlyPersonalPolicies = useMemo(() => hasOnlyPersonalPoliciesUtil(policies), [policies]);

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
        activeAdminPolicies,
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
        async (templateName: string, templateType: string, policyID: string | undefined) => {
            // If the user has selected a large number of items, we'll use the queryJSON to search for the reportIDs and transactionIDs necessary for the export
            if (areAllMatchingItemsSelected) {
                queueExportSearchWithTemplate({
                    templateName,
                    templateType,
                    jsonQuery: JSON.stringify(queryJSON),
                    reportIDList: [],
                    transactionIDList: [],
                    policyID,
                });
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

            const result = await showConfirmModal({
                title: translate('export.exportInProgress'),
                prompt: translate('export.conciergeWillSend'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            clearSelectedTransactions(undefined, true);
        },
        [queryJSON, selectedTransactionsKeys, areAllMatchingItemsSelected, selectedTransactionReportIDs, showConfirmModal, translate, clearSelectedTransactions],
    );

    const policyIDsWithVBBA = useMemo(() => {
        return Object.values(policies ?? {})
            .filter((policy): policy is Policy => !!policy?.achAccount?.bankAccountID)
            .map((policy) => policy.id);
    }, [policies]);

    const handleBasicExport = useCallback(async () => {
        if (isOffline) {
            setIsOfflineModalVisible(true);
            return;
        }

        if (status === null || status === undefined) {
            return;
        }

        if (areAllMatchingItemsSelected) {
            const result = await showConfirmModal({
                title: translate('search.exportSearchResults.title'),
                prompt: translate('search.exportSearchResults.description'),
                confirmText: translate('search.exportSearchResults.title'),
                cancelText: translate('common.cancel'),
            });
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            if (selectedTransactionsKeys.length === 0 || status == null || !hash) {
                return;
            }
            const reportIDList = selectedReports?.map((report) => report?.reportID).filter((reportID) => reportID !== undefined) ?? [];
            queueExportSearchItemsToCSV({
                query: status,
                jsonQuery: JSON.stringify(queryJSON),
                reportIDList,
                transactionIDList: selectedTransactionsKeys,
            });
            selectAllMatchingItems(false);
            clearSelectedTransactions();
            return;
        }

        exportSearchItemsToCSV(
            {
                query: status,
                jsonQuery: JSON.stringify(queryJSON),
                reportIDList: selectedReports?.map((report) => report?.reportID).filter((reportID) => reportID !== undefined) ?? [],
                transactionIDList: selectedTransactionsKeys,
            },
            () => {
                setIsDownloadErrorModalVisible(true);
            },
            translate,
        );
        clearSelectedTransactions(undefined, true);
    }, [
        isOffline,
        areAllMatchingItemsSelected,
        showConfirmModal,
        translate,
        selectedTransactionsKeys,
        status,
        hash,
        selectedReports,
        queryJSON,
        selectAllMatchingItems,
        clearSelectedTransactions,
        setIsDownloadErrorModalVisible,
    ]);

    const handleApproveWithDEWCheck = useCallback(async () => {
        if (isOffline) {
            setIsOfflineModalVisible(true);
            return;
        }

        if (!hash) {
            return;
        }

        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        // Check if any of the selected items have DEW enabled
        const selectedPolicyIDList = selectedReports.length
            ? selectedReports.map((report) => report.policyID)
            : Object.values(selectedTransactions).map((transaction) => transaction.policyID);
        const hasDEWPolicy = selectedPolicyIDList.some((policyID) => {
            const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
            return hasDynamicExternalWorkflow(policy);
        });

        if (hasDEWPolicy && !isDEWBetaEnabled) {
            const result = await showConfirmModal({
                title: translate('customApprovalWorkflow.title'),
                prompt: translate('customApprovalWorkflow.description'),
                confirmText: translate('customApprovalWorkflow.goToExpensifyClassic'),
                shouldShowCancelButton: false,
            });
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            openOldDotLink(CONST.OLDDOT_URLS.INBOX);
            return;
        }

        const reportIDList = !selectedReports.length
            ? Object.values(selectedTransactions).map((transaction) => transaction.reportID)
            : (selectedReports?.filter((report) => !!report).map((report) => report.reportID) ?? []);
        approveMoneyRequestOnSearch(
            hash,
            reportIDList.filter((reportID) => reportID !== undefined),
        );
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            clearSelectedTransactions();
        });
    }, [
        isOffline,
        isDelegateAccessRestricted,
        showDelegateNoAccessModal,
        selectedReports,
        selectedTransactions,
        policies,
        isDEWBetaEnabled,
        showConfirmModal,
        translate,
        hash,
        clearSelectedTransactions,
    ]);

    const handleDeleteSelectedTransactions = useCallback(async () => {
        if (isOffline) {
            setIsOfflineModalVisible(true);
            return;
        }

        if (!hash) {
            return;
        }

        // Use InteractionManager to ensure this runs after the dropdown modal closes
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(async () => {
            const result = await showConfirmModal({
                title: translate('iou.deleteExpense', {count: selectedTransactionsKeys.length}),
                prompt: translate('iou.deleteConfirmation', {count: selectedTransactionsKeys.length}),
                confirmText: translate('common.delete'),
                cancelText: translate('common.cancel'),
                danger: true,
            });
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            // Translations copy for delete modal depends on amount of selected items,
            // We need to wait for modal to fully disappear before clearing them to avoid translation flicker between singular vs plural
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                deleteMoneyRequestOnSearch(hash, selectedTransactionsKeys);
                clearSelectedTransactions();
            });
        });
    }, [isOffline, showConfirmModal, translate, selectedTransactionsKeys, hash, clearSelectedTransactions]);

    const onBulkPaySelected = useCallback(
        (paymentMethod?: PaymentMethodType, additionalData?: Record<string, unknown>) => {
            if (!hash) {
                return;
            }
            if (isOffline) {
                setIsOfflineModalVisible(true);
                return;
            }

            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
                return;
            }

            const activeRoute = Navigation.getActiveRoute();
            const selectedOptions = selectedReports.length ? selectedReports : Object.values(selectedTransactions);

            for (const item of selectedOptions) {
                const itemPolicyID = item.policyID;
                const itemReportID = item.reportID;
                if (!itemReportID) {
                    return;
                }
                const itemReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${itemReportID}`];
                const isExpenseReport = isExpenseReportUtil(itemReportID);
                const isIOUReport = isIOUReportUtil(itemReportID);
                const reportType = getReportType(itemReportID);
                const lastPolicyPaymentMethod = getLastPolicyPaymentMethod(itemPolicyID, personalPolicyID, lastPaymentMethods, reportType, isIOUReport) ?? paymentMethod;

                if (!lastPolicyPaymentMethod) {
                    Navigation.navigate(
                        ROUTES.SEARCH_REPORT.getRoute({
                            reportID: itemReportID,
                            backTo: activeRoute,
                        }),
                    );
                    return;
                }

                const hasPolicyVBBA = itemPolicyID ? policyIDsWithVBBA.includes(itemPolicyID) : false;

                if (isExpenseReport && lastPolicyPaymentMethod !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE && !hasPolicyVBBA) {
                    Navigation.navigate(
                        ROUTES.SEARCH_REPORT.getRoute({
                            reportID: item.reportID,
                            backTo: activeRoute,
                        }),
                    );
                    return;
                }
                const isPolicyPaymentMethod = !Object.values(CONST.IOU.PAYMENT_TYPE).includes(lastPolicyPaymentMethod as ValueOf<typeof CONST.IOU.PAYMENT_TYPE>);
                // If lastPolicyPaymentMethod is not type of CONST.IOU.PAYMENT_TYPE, we're using workspace to pay the IOU
                // Then we should move it to that workspace.
                if (isPolicyPaymentMethod && isIOUReport) {
                    const adminPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${lastPolicyPaymentMethod}`];
                    if (!adminPolicy) {
                        Navigation.navigate(
                            ROUTES.SEARCH_REPORT.getRoute({
                                reportID: item.reportID,
                                backTo: activeRoute,
                            }),
                        );
                        return;
                    }
                    // Get transactions for this report
                    const reportTransactions = Object.values(allTransactions ?? {}).filter(
                        (transaction): transaction is NonNullable<typeof transaction> => !!transaction && transaction.reportID === itemReportID,
                    );
                    const invite = moveIOUReportToPolicyAndInviteSubmitter(itemReport, adminPolicy, formatPhoneNumber, reportTransactions, isCustomReportNamesBetaEnabled);
                    if (!invite?.policyExpenseChatReportID) {
                        moveIOUReportToPolicy(itemReport, adminPolicy, false, reportTransactions, isCustomReportNamesBetaEnabled);
                    }
                }
            }
            const paymentAdditionalData = (additionalData as Partial<PaymentData>) ?? {};
            const paymentData = (
                selectedReports.length
                    ? selectedReports.map((report) => {
                          return {
                              reportID: report.reportID,
                              amount: report.total,
                              paymentType: getLastPolicyPaymentMethod(report.policyID, personalPolicyID, lastPaymentMethods, undefined, isIOUReportUtil(report.reportID)) ?? paymentMethod,
                              ...(isInvoiceReport(report.reportID)
                                  ? getPayMoneyOnSearchInvoiceParams(
                                        report.policyID,
                                        paymentAdditionalData?.payAsBusiness ?? isBusinessInvoiceRoom(report.chatReportID),
                                        paymentAdditionalData?.bankAccountID ?? getLastPolicyBankAccountID(report.policyID, lastPaymentMethods),
                                        CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                                    )
                                  : {}),
                          };
                      })
                    : Object.values(selectedTransactions).map((transaction) => ({
                          reportID: transaction.reportID,
                          amount: transaction.amount,
                          paymentType:
                              getLastPolicyPaymentMethod(transaction.policyID, personalPolicyID, lastPaymentMethods, undefined, isIOUReportUtil(transaction.reportID)) ?? paymentMethod,
                          ...(isInvoiceReport(transaction.reportID)
                              ? getPayMoneyOnSearchInvoiceParams(
                                    transaction.policyID,
                                    paymentAdditionalData?.payAsBusiness ?? isBusinessInvoiceRoom(transaction.reportID),
                                    paymentAdditionalData?.bankAccountID ?? getLastPolicyBankAccountID(transaction.policyID, lastPaymentMethods),
                                    CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                                )
                              : {}),
                      }))
            ) as PaymentData[];

            payMoneyRequestOnSearch(hash, paymentData);

            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                clearSelectedTransactions();
            });
        },
        [
            clearSelectedTransactions,
            hash,
            isOffline,
            lastPaymentMethods,
            selectedReports,
            selectedTransactions,
            policies,
            formatPhoneNumber,
            policyIDsWithVBBA,
            isDelegateAccessRestricted,
            showDelegateNoAccessModal,
            personalPolicyID,
            allTransactions,
            isCustomReportNamesBetaEnabled,
            allReports,
        ],
    );

    const [isSorting, setIsSorting] = useState(false);
    let searchResults: SearchResults | undefined;
    if (currentSearchResults?.data) {
        searchResults = currentSearchResults;
    } else if (isSorting) {
        searchResults = lastNonEmptySearchResults.current;
    }

    // Check if all selected transactions are from the submitter
    const areAllTransactionsFromSubmitter = useMemo(() => {
        if (!currentUserPersonalDetails?.accountID) {
            return false;
        }

        const searchData = currentSearchResults?.data;
        const reports: Report[] = searchData
            ? Object.keys(searchData)
                  .filter((key) => key.startsWith(ONYXKEYS.COLLECTION.REPORT))
                  .map((key) => searchData[key as keyof typeof searchData] as Report)
                  .filter((report): report is Report => report != null && 'reportID' in report)
            : [];

        return (
            selectedTransactionReportIDs.length > 0 &&
            selectedTransactionReportIDs.every((id) => {
                return isCurrentUserSubmitter(getReportOrDraftReport(id, reports));
            })
        );
    }, [selectedTransactionReportIDs, currentUserPersonalDetails?.accountID, currentSearchResults?.data]);

    const headerButtonsOptions = useMemo(() => {
        if (selectedTransactionsKeys.length === 0 || status == null || !hash) {
            return CONST.EMPTY_ARRAY as unknown as Array<DropdownOption<SearchHeaderOptionValue>>;
        }

        const options: Array<DropdownOption<SearchHeaderOptionValue>> = [];
        const isAnyTransactionOnHold = Object.values(selectedTransactions).some((transaction) => transaction.isHeld);

        const typeExpenseReport = queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

        // Gets the list of options for the export sub-menu
        // Gets the list of options for the export sub-menu
        const getExportOptions = () => {
            // We provide the basic and expense level export options by default
            const exportOptions: PopoverMenuItem[] = [
                {
                    text: translate('export.basicExport'),
                    icon: expensifyIcons.Table,
                    onSelected: () => {
                        handleBasicExport();
                    },
                    shouldCloseModalOnSelect: true,
                    shouldCallAfterModalHide: true,
                },
            ];

            // Determine if only full reports are selected by comparing the reportIDs of the selected transactions and the reportIDs of the selected reports
            const areFullReportsSelected = selectedTransactionReportIDs.length === selectedReportIDs.length && selectedTransactionReportIDs.every((id) => selectedReportIDs.includes(id));
            const typeInvoice = queryJSON?.type === CONST.REPORT.TYPE.INVOICE;
            const typeExpense = queryJSON?.type === CONST.REPORT.TYPE.EXPENSE;
            const isAllOneTransactionReport = Object.values(selectedTransactions).every((transaction) => transaction.isFromOneTransactionReport);

            // If we're grouping by invoice or report, and all the expenses on the report are selected, or if all
            // the selected expenses are the only expenses of their parent expense report include the report level export option.
            const includeReportLevelExport = ((typeExpenseReport || typeInvoice) && areFullReportsSelected) || (typeExpense && !typeExpenseReport && isAllOneTransactionReport);

            // Collect a list of export templates available to the user from their account, policy, and custom integrations templates
            const policy = selectedPolicyIDs.length === 1 ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedPolicyIDs.at(0)}`] : undefined;
            const exportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy, includeReportLevelExport);
            for (const template of exportTemplates) {
                exportOptions.push({
                    text: template.name,
                    icon: expensifyIcons.Table,
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
            icon: expensifyIcons.Export,
            rightIcon: expensifyIcons.ArrowRight,
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
        const areSelectedTransactionsIncludedInReports = selectedTransactionsKeys.every((id) =>
            selectedTransactions[id].reportID ? selectedReportIDs.includes(selectedTransactions[id].reportID) : true,
        );
        const shouldShowApproveOption =
            !isOffline &&
            !isAnyTransactionOnHold &&
            areSelectedTransactionsIncludedInReports &&
            (selectedReports.length
                ? selectedReports.every((report) => report.allActions.includes(CONST.SEARCH.ACTION_TYPES.APPROVE))
                : selectedTransactionsKeys.every((id) => selectedTransactions[id].action === CONST.SEARCH.ACTION_TYPES.APPROVE));

        if (shouldShowApproveOption) {
            options.push({
                icon: expensifyIcons.ThumbsUp,
                text: translate('search.bulkActions.approve'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.APPROVE,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    handleApproveWithDEWCheck();
                },
            });
        }

        // Check if all selected transactions can be rejected
        const hasNoRejectedTransaction = selectedTransactionsKeys.every(
            (id) => !hasTransactionBeenRejected(allTransactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + id] ?? []),
        );

        const shouldShowRejectOption =
            queryJSON?.type !== CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT &&
            !isOffline &&
            selectedTransactionsKeys.length > 0 &&
            selectedTransactionsKeys.every((id) => selectedTransactions[id].canReject) &&
            hasNoRejectedTransaction;

        if (shouldShowRejectOption) {
            options.push({
                icon: expensifyIcons.ThumbsDown,
                text: translate('search.bulkActions.reject'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.REJECT,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    if (isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }

                    if (dismissedRejectUseExplanation) {
                        Navigation.navigate(ROUTES.SEARCH_REJECT_REASON_RHP);
                    } else {
                        setRejectModalAction(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT);
                    }
                },
            });
        }

        const shouldShowSubmitOption =
            !isOffline &&
            areSelectedTransactionsIncludedInReports &&
            (selectedReports.length
                ? selectedReports.every((report) => report.allActions.includes(CONST.SEARCH.ACTION_TYPES.SUBMIT))
                : selectedTransactionsKeys.every((id) => selectedTransactions[id].action === CONST.SEARCH.ACTION_TYPES.SUBMIT));

        if (shouldShowSubmitOption) {
            options.push({
                icon: expensifyIcons.Send,
                text: translate('common.submit'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    const itemList = !selectedReports.length ? Object.values(selectedTransactions).map((transaction) => transaction) : (selectedReports?.filter((report) => !!report) ?? []);

                    for (const item of itemList) {
                        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`];
                        if (policy) {
                            submitMoneyRequestOnSearch(hash, [item as Report], [policy]);
                        }
                    }
                    clearSelectedTransactions();
                },
            });
        }
        const {shouldEnableBulkPayOption, isFirstTimePayment} = getPayOption(selectedReports, selectedTransactions, lastPaymentMethods, selectedReportIDs, personalPolicyID);

        const shouldShowPayOption = !isOffline && !isAnyTransactionOnHold && shouldEnableBulkPayOption;

        if (shouldShowPayOption) {
            const payButtonOption = {
                icon: expensifyIcons.MoneyBag,
                text: translate('search.bulkActions.pay'),
                rightIcon: isFirstTimePayment ? expensifyIcons.ArrowRight : undefined,
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
                icon: expensifyIcons.Stopwatch,
                text: translate('search.bulkActions.hold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.HOLD,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    if (isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }

                    const isDismissed = areAllTransactionsFromSubmitter ? dismissedHoldUseExplanation : dismissedRejectUseExplanation;

                    if (isDismissed) {
                        Navigation.navigate(ROUTES.TRANSACTION_HOLD_REASON_RHP);
                    } else if (areAllTransactionsFromSubmitter) {
                        setIsHoldEducationalModalVisible(true);
                    } else {
                        setRejectModalAction(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD);
                    }
                },
            });
        }

        const shouldShowUnholdOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canUnhold);

        if (shouldShowUnholdOption) {
            options.push({
                icon: expensifyIcons.Stopwatch,
                text: translate('search.bulkActions.unhold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    if (isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }

                    unholdMoneyRequestOnSearch(hash, selectedTransactionsKeys);
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => {
                        clearSelectedTransactions();
                    });
                },
            });
        }

        if (selectedTransactionsKeys.length < 3 && searchResults?.search.type !== CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT && searchResults?.data) {
            const {transactions, reports, policies: transactionPolicies} = getTransactionsAndReportsFromSearch(searchResults, selectedTransactionsKeys);

            if (isMergeActionForSelectedTransactions(transactions, reports, transactionPolicies, currentUserPersonalDetails.accountID)) {
                const transactionID = transactions.at(0)?.transactionID;
                if (transactionID) {
                    options.push({
                        text: translate('common.merge'),
                        icon: expensifyIcons.ArrowCollapse,
                        value: CONST.SEARCH.BULK_ACTION_TYPES.MERGE,
                        onSelected: () => setupMergeTransactionDataAndNavigate(transactionID, transactions, localeCompare, reports, false, true),
                    });
                }
            }
        }

        const ownerAccountIDs = new Set<number>();
        let hasUnknownOwner = false;
        for (const id of selectedTransactionsKeys) {
            const transactionEntry = selectedTransactions[id];
            if (!transactionEntry) {
                continue;
            }
            const ownerAccountID = transactionEntry.ownerAccountID ?? getReportOrDraftReport(transactionEntry.reportID)?.ownerAccountID;
            if (typeof ownerAccountID === 'number') {
                ownerAccountIDs.add(ownerAccountID);
                if (ownerAccountIDs.size > 1) {
                    break;
                }
            } else {
                hasUnknownOwner = true;
            }
        }
        const hasMultipleOwners = ownerAccountIDs.size > 1 || (hasUnknownOwner && (ownerAccountIDs.size > 0 || selectedTransactionsKeys.length > 1));

        const canAllTransactionsBeMoved = selectedTransactionsKeys.every((id) => selectedTransactions[id].canChangeReport);

        if (canAllTransactionsBeMoved && !hasMultipleOwners && !typeExpenseReport) {
            options.push({
                text: translate('iou.moveExpenses', {count: selectedTransactionsKeys.length}),
                icon: expensifyIcons.DocumentMerge,
                value: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_REPORT,
                shouldCloseModalOnSelect: true,
                onSelected: () => Navigation.navigate(ROUTES.MOVE_TRANSACTIONS_SEARCH_RHP),
            });
        }

        const firstTransactionKey = selectedTransactionsKeys.at(0);
        const firstTransactionMeta = firstTransactionKey ? selectedTransactions[firstTransactionKey] : undefined;

        const isSplittable = !!firstTransactionMeta?.canSplit;
        const isAlreadySplit = !!firstTransactionMeta?.hasBeenSplit;
        const firstTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${selectedTransactionsKeys.at(0)}`];

        const canSplitTransaction = selectedTransactionsKeys.length === 1 && !isAlreadySplit && isSplittable;

        if (canSplitTransaction) {
            options.push({
                text: translate('iou.split'),
                icon: expensifyIcons.ArrowSplit,
                value: CONST.SEARCH.BULK_ACTION_TYPES.SPLIT,
                onSelected: () => {
                    initSplitExpense(allTransactions, allReports, firstTransaction);
                },
            });
        }

        if (shouldShowDeleteOption(selectedTransactions, currentSearchResults?.data, isOffline)) {
            options.push({
                icon: expensifyIcons.Trashcan,
                text: translate('search.bulkActions.delete'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.DELETE,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    handleDeleteSelectedTransactions();
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
                icon: expensifyIcons.Exclamation,
                text: translate('search.bulkActions.noOptionsAvailable'),
                value: undefined,
                ...emptyOptionStyle,
            });
        }

        return options;
    }, [
        searchResults,
        selectedTransactionsKeys,
        status,
        hash,
        selectedTransactions,
        translate,
        localeCompare,
        areAllMatchingItemsSelected,
        isOffline,
        selectedReports,
        selectedTransactionReportIDs,
        lastPaymentMethods,
        selectedReportIDs,
        allTransactions,
        queryJSON?.type,
        selectedPolicyIDs,
        policies,
        integrationsExportTemplates,
        csvExportLayouts,
        clearSelectedTransactions,
        beginExportWithTemplate,
        bulkPayButtonOptions,
        onBulkPaySelected,
        handleBasicExport,
        handleApproveWithDEWCheck,
        handleDeleteSelectedTransactions,
        allReports,
        theme.icon,
        styles.colorMuted,
        styles.fontWeightNormal,
        styles.textWrap,
        expensifyIcons.ArrowCollapse,
        expensifyIcons.ArrowRight,
        expensifyIcons.ArrowSplit,
        expensifyIcons.DocumentMerge,
        expensifyIcons.Exclamation,
        expensifyIcons.Export,
        expensifyIcons.MoneyBag,
        expensifyIcons.Send,
        expensifyIcons.Stopwatch,
        expensifyIcons.Table,
        expensifyIcons.ThumbsDown,
        expensifyIcons.ThumbsUp,
        expensifyIcons.Trashcan,
        dismissedHoldUseExplanation,
        dismissedRejectUseExplanation,
        areAllTransactionsFromSubmitter,
        allTransactionViolations,
        currentSearchResults?.data,
        isDelegateAccessRestricted,
        showDelegateNoAccessModal,
        currentUserPersonalDetails.accountID,
        personalPolicyID,
    ]);

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
            draftTransactions,
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
                            confirmPayment={onBulkPaySelected}
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
                        onBulkPaySelected={onBulkPaySelected}
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
                    <DecisionModal
                        title={translate('common.youAppearToBeOffline')}
                        prompt={translate('common.offlinePrompt')}
                        isSmallScreenWidth={isSmallScreenWidth}
                        onSecondOptionSubmit={handleOfflineModalClose}
                        secondOptionText={translate('common.buttonConfirm')}
                        isVisible={isOfflineModalVisible}
                        onClose={handleOfflineModalClose}
                    />
                    <DecisionModal
                        title={translate('common.downloadFailedTitle')}
                        prompt={translate('common.downloadFailedDescription')}
                        isSmallScreenWidth={isSmallScreenWidth}
                        onSecondOptionSubmit={handleDownloadErrorModalClose}
                        secondOptionText={translate('common.buttonConfirm')}
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
