import {useCallback, useContext, useMemo} from 'react';
import {InteractionManager} from 'react-native';
import type {ValueOf} from 'type-fest';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import type {PaymentMethodType} from '@components/KYCWall/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSearchContext} from '@components/Search/SearchContext';
import type {PaymentData, SearchQueryJSON} from '@components/Search/types';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {
    approveMoneyRequestOnSearch,
    deleteMoneyRequestOnSearch,
    exportSearchItemsToCSV,
    getLastPolicyBankAccountID,
    getLastPolicyPaymentMethod,
    getPayMoneyOnSearchInvoiceParams,
    getReportType,
    payMoneyRequestOnSearch,
    queueExportSearchItemsToCSV,
    queueExportSearchWithTemplate,
    submitMoneyRequestOnSearch,
    unholdMoneyRequestOnSearch,
} from '@libs/actions/Search';
import {openOldDotLink} from '@libs/actions/Link';
import {moveIOUReportToPolicy, moveIOUReportToPolicyAndInviteSubmitter} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {isBusinessInvoiceRoom, isExpenseReport as isExpenseReportUtil, isInvoiceReport, isIOUReport as isIOUReportUtil} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

type UseSearchBulkActionsProps = {
    /** The current search query JSON */
    queryJSON: SearchQueryJSON | undefined;
    /** Callback to set offline modal visibility */
    setIsOfflineModalVisible: (visible: boolean) => void;
    /** Callback to set download error modal visibility */
    setIsDownloadErrorModalVisible: (visible: boolean) => void;
};

type UseSearchBulkActionsReturn = {
    /** Handle basic CSV export */
    handleBasicExport: () => Promise<void>;
    /** Handle export with a specific template */
    beginExportWithTemplate: (templateName: string, templateType: string, policyID: string | undefined) => Promise<void>;
    /** Handle approve action with DEW check */
    handleApproveWithDEWCheck: () => Promise<void>;
    /** Handle delete selected transactions */
    handleDeleteSelectedTransactions: () => Promise<void>;
    /** Handle bulk pay selected items */
    onBulkPaySelected: (paymentMethod?: PaymentMethodType, additionalData?: Record<string, unknown>) => void;
    /** Handle submit selected items */
    handleSubmit: () => void;
    /** Handle unhold selected items */
    handleUnhold: () => void;
    /** List of policy IDs that have VBBA */
    policyIDsWithVBBA: string[];
};

/**
 * Hook that encapsulates bulk action business logic for the Search page
 * Following the composition pattern - extracts business logic from UI components
 */
function useSearchBulkActions({queryJSON, setIsOfflineModalVisible, setIsDownloadErrorModalVisible}: UseSearchBulkActionsProps): UseSearchBulkActionsReturn {
    const {translate, formatPhoneNumber} = useLocalize();
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const {isBetaEnabled} = usePermissions();
    const isDEWBetaEnabled = isBetaEnabled(CONST.BETAS.NEW_DOT_DEW);

    const {state, actions} = useSearchContext();
    const {
        selectedTransactions,
        selectedReports,
        areAllMatchingItemsSelected,
    } = state;
    const {clearSelectedTransactions, selectAllMatchingItems} = actions;

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [lastPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});

    const {status, hash} = queryJSON ?? {};
    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

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

    const policyIDsWithVBBA = useMemo(() => {
        return Object.values(policies ?? {})
            .filter((policy): policy is Policy => !!policy?.achAccount?.bankAccountID)
            .map((policy) => policy.id);
    }, [policies]);

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
        setIsOfflineModalVisible,
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
        setIsOfflineModalVisible,
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
    }, [isOffline, showConfirmModal, translate, selectedTransactionsKeys, hash, clearSelectedTransactions, setIsOfflineModalVisible]);

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
                    const invite = moveIOUReportToPolicyAndInviteSubmitter(itemReportID, adminPolicy, formatPhoneNumber);
                    if (!invite?.policyExpenseChatReportID) {
                        moveIOUReportToPolicy(itemReportID, adminPolicy);
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
            setIsOfflineModalVisible,
        ],
    );

    const handleSubmit = useCallback(() => {
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

        const reportIDList = !selectedReports.length
            ? Object.values(selectedTransactions).map((transaction) => transaction.reportID)
            : (selectedReports?.filter((report) => !!report).map((report) => report.reportID) ?? []);

        submitMoneyRequestOnSearch(
            hash,
            reportIDList.filter((reportID) => reportID !== undefined),
        );

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            clearSelectedTransactions();
        });
    }, [isOffline, hash, isDelegateAccessRestricted, showDelegateNoAccessModal, selectedReports, selectedTransactions, clearSelectedTransactions, setIsOfflineModalVisible]);

    const handleUnhold = useCallback(() => {
        if (isOffline) {
            setIsOfflineModalVisible(true);
            return;
        }

        if (!hash) {
            return;
        }

        unholdMoneyRequestOnSearch(hash, selectedTransactionsKeys);

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            clearSelectedTransactions();
        });
    }, [isOffline, hash, selectedTransactionsKeys, clearSelectedTransactions, setIsOfflineModalVisible]);

    return {
        handleBasicExport,
        beginExportWithTemplate,
        handleApproveWithDEWCheck,
        handleDeleteSelectedTransactions,
        onBulkPaySelected,
        handleSubmit,
        handleUnhold,
        policyIDsWithVBBA,
    };
}

export default useSearchBulkActions;
export type {UseSearchBulkActionsProps, UseSearchBulkActionsReturn};
