import {useRoute} from '@react-navigation/native';
import {isUserValidatedSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useContext, useMemo} from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useDeleteTransactions from '@hooks/useDeleteTransactions';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaymentOptions from '@hooks/usePaymentOptions';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import {duplicateExpenseTransaction as duplicateTransactionAction} from '@libs/actions/IOU/Duplicate';
import {openOldDotLink} from '@libs/actions/Link';
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {deleteAppReport, exportReportToCSV, exportToIntegration, markAsManuallyExported} from '@libs/actions/Report';
import {getExportTemplates, queueExportSearchWithTemplate} from '@libs/actions/Search';
import initSplitExpense from '@libs/actions/SplitExpenses';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getExistingTransactionID} from '@libs/IOUUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import type {KYCFlowEvent, TriggerKYCFlow} from '@libs/PaymentUtils';
import {selectPaymentType} from '@libs/PaymentUtils';
import {getConnectedIntegration, getValidConnectedIntegration, hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {getSecondaryExportReportActions, getSecondaryReportActions} from '@libs/ReportSecondaryActionUtils';
import {
    changeMoneyRequestHoldStatus,
    generateReportID,
    getAddExpenseDropdownOptions,
    getIntegrationIcon,
    getPolicyExpenseChat,
    isCurrentUserSubmitter,
    isDM,
    navigateOnDeleteExpense,
    navigateToDetailsPage,
    rejectMoneyRequestReason,
} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {getOriginalTransactionWithSplitInfo, hasCustomUnitOutOfPolicyViolation as hasCustomUnitOutOfPolicyViolationTransactionUtils, isPerDiemRequest} from '@libs/TransactionUtils';
import type {ExportType} from '@pages/inbox/report/ReportDetailsExportPage';
import {cancelPayment, getNavigationUrlOnMoneyRequestDelete, reopenReport, retractReport, startMoneyRequest, submitReport, unapproveExpenseReport} from '@userActions/IOU';
import {setDeleteTransactionNavigateBackUrl} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from './DelegateNoAccessModalProvider';
import {KYCWallContext} from './KYCWall/KYCWallContext';
import {ModalActions} from './Modal/Global/ModalContext';
import {useMoneyReportHeaderContext} from './MoneyReportHeaderContext';
import MoneyReportHeaderKYCDropdown from './MoneyReportHeaderKYCDropdown';
import {usePersonalDetails} from './OnyxListItemProvider';
import type {PopoverMenuItem} from './PopoverMenu';
import {useSearchActionsContext, useSearchStateContext} from './Search/SearchContext';
import Text from './Text';

type MoneyReportHeaderSecondaryActionsProps = {
    /** The primary action type (to filter from secondary) */
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '';

    /** The money request report */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The chat report associated with the money request */
    chatReport: OnyxEntry<OnyxTypes.Report>;

    /** The policy tied to the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Report actions */
    reportActions: OnyxTypes.ReportAction[];

    /** All transactions in the report */
    transactions: OnyxTypes.Transaction[];

    /** Non-pending-delete transactions */
    nonPendingDeleteTransactions: OnyxTypes.Transaction[];

    /** The single transaction (for transaction thread) */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Transaction violations for the single transaction */
    transactionViolations: OnyxTypes.TransactionViolation[];

    /** The transaction thread report ID */
    transactionThreadReportID: string | undefined;

    /** The parent report action for the request */
    requestParentReportAction: OnyxTypes.ReportAction | null | undefined;

    /** The report's next step */
    nextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;

    /** All transaction violations collection */
    allTransactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;

    /** Report transaction violations mapped */
    violations: OnyxCollection<OnyxTypes.TransactionViolations>;

    /** Bank account list */
    bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>;

    /** Report name value pairs */
    reportNameValuePairs: OnyxEntry<OnyxTypes.ReportNameValuePairs>;

    /** Report metadata */
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>;

    /** Whether the chat report is archived */
    isChatReportArchived: boolean;

    /** Intro selected NVP */
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;

    /** User betas */
    betas: OnyxEntry<OnyxTypes.Beta[]>;

    /** Whether the report is exported */
    isExported: boolean;

    /** Integration name from export message */
    integrationNameFromExportMessage: string | null;

    /** Whether the report has violations */
    hasViolations: boolean;

    /** The total formatted amount */
    totalAmount: string;

    /** Transaction IDs */
    transactionIDs: string[];

    /** Report transactions object (for deleteAppReport) */
    reportTransactions: Record<string, OnyxTypes.Transaction>;

    /** Dismissed reject use explanation (shared with parent) */
    dismissedRejectUseExplanation: OnyxEntry<boolean>;

    /** Whether pay button should show */
    shouldShowPayButton: boolean;

    /** Whether approve button should show */
    shouldShowApproveButton: boolean;

    /** Whether approve button should be disabled */
    shouldDisableApproveButton: boolean;

    /** Whether to only show pay elsewhere */
    onlyShowPayElsewhere: boolean;
};

function MoneyReportHeaderSecondaryActions({
    primaryAction,
    report: moneyRequestReport,
    chatReport,
    policy,
    reportActions,
    transactions,
    nonPendingDeleteTransactions,
    transaction,
    transactionViolations,
    transactionThreadReportID,
    requestParentReportAction,
    nextStep,
    allTransactionViolations,
    violations,
    bankAccountList,
    reportNameValuePairs,
    reportMetadata,
    isChatReportArchived,
    introSelected,
    betas,
    isExported,
    integrationNameFromExportMessage,
    hasViolations,
    totalAmount,
    transactionIDs,
    reportTransactions,
    dismissedRejectUseExplanation,
    shouldShowPayButton,
    shouldShowApproveButton,
    shouldDisableApproveButton,
    onlyShowPayElsewhere,
}: MoneyReportHeaderSecondaryActionsProps) {
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {accountID, email, login} = useCurrentUserPersonalDetails();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {showConfirmModal} = useConfirmModal();
    const {
        confirmPayment,
        confirmApproval,
        showPDFModal,
        showHoldEducationalModal,
        setRejectModalAction,
        showRateErrorModal,
        showDuplicatePerDiemErrorModal,
        showDownloadError,
        showOfflineModal,
    } = useMoneyReportHeaderContext();
    const {currentSearchHash} = useSearchStateContext();
    const {removeTransaction, clearSelectedTransactions} = useSearchActionsContext();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const isDEWBetaEnabled = isBetaEnabled(CONST.BETAS.NEW_DOT_DEW);
    const personalDetails = usePersonalDetails();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const kycWallRef = useContext(KYCWallContext);
    const route = useRoute<
        | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.EXPENSE_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
    >();

    const [isDuplicateActive, temporarilyDisableDuplicateAction] = useThrottledButtonState();

    // Subscriptions moved from parent
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [dismissedHoldUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION);
    const currentTransaction = transactions.at(0);
    const [originalIOUTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(currentTransaction?.comment?.originalTransactionID)}`);
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`);
    const [selfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [userBillingGraceEndPeriods] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [activePolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${defaultExpensePolicy?.id}`);
    const [transactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const draftTransactionIDs = Object.keys(transactionDrafts ?? {});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);

    // Derived values
    const {iouReport, chatReport: chatIOUReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(requestParentReportAction);
    const {deleteTransactions} = useDeleteTransactions({report: chatReport, reportActions, policy});
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transactions.map((t) => t.transactionID));
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);
    const connectedIntegration = getValidConnectedIntegration(policy);
    const connectedIntegrationFallback = getConnectedIntegration(policy);
    const activePolicyExpenseChat = getPolicyExpenseChat(accountID, defaultExpensePolicy?.id);
    const isReportSubmitter = isCurrentUserSubmitter(chatIOUReport);
    const isChatReportDM = isDM(chatReport);
    const hasCustomUnitOutOfPolicyViolation = hasCustomUnitOutOfPolicyViolationTransactionUtils(transactionViolations);
    const isPerDiemRequestOnNonDefaultWorkspace = isPerDiemRequest(transaction) && defaultExpensePolicy?.id !== policy?.id;

    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Buildings',
        'Plus',
        'Stopwatch',
        'Cash',
        'Send',
        'Clear',
        'ThumbsUp',
        'CircularArrowBackwards',
        'ArrowSplit',
        'ArrowCollapse',
        'Workflows',
        'Trashcan',
        'ArrowRight',
        'ThumbsDown',
        'Table',
        'Info',
        'Export',
        'Download',
        'XeroSquare',
        'QBOSquare',
        'NetSuiteSquare',
        'IntacctSquare',
        'QBDSquare',
        'CertiniaSquare',
        'Feed',
        'ExpenseCopy',
        'Checkmark',
        'ReportCopy',
        'Location',
        'ReceiptPlus',
    ] as const);

    const exportTemplates = useMemo(
        () => getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy),
        [integrationsExportTemplates, csvExportLayouts, policy, translate],
    );

    const showExportProgressModal = useCallback(() => {
        return showConfirmModal({
            title: translate('export.exportInProgress'),
            prompt: translate('export.conciergeWillSend'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    }, [showConfirmModal, translate]);

    const beginExportWithTemplate = useCallback(
        (templateName: string, templateType: string, transactionIDList: string[], policyID?: string) => {
            if (isOffline) {
                showOfflineModal();
                return;
            }
            if (!moneyRequestReport) {
                return;
            }

            showExportProgressModal().then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                clearSelectedTransactions(undefined, true);
            });
            queueExportSearchWithTemplate({
                templateName,
                templateType,
                jsonQuery: '{}',
                reportIDList: [moneyRequestReport.reportID],
                transactionIDList,
                policyID,
            });
        },
        [isOffline, showOfflineModal, moneyRequestReport, showExportProgressModal, clearSelectedTransactions],
    );

    const addExpenseDropdownOptions = useMemo(
        () => getAddExpenseDropdownOptions(translate, expensifyIcons, moneyRequestReport?.reportID, policy, userBillingGraceEndPeriods, undefined, undefined, lastDistanceExpenseType),
        [moneyRequestReport?.reportID, policy, userBillingGraceEndPeriods, lastDistanceExpenseType, expensifyIcons, translate],
    );

    const paymentButtonOptions = usePaymentOptions({
        currency: moneyRequestReport?.currency,
        iouReport: moneyRequestReport,
        chatReportID: chatReport?.reportID,
        formattedAmount: totalAmount,
        policyID: moneyRequestReport?.policyID,
        onPress: confirmPayment,
        shouldHidePaymentOptions: !shouldShowPayButton,
        shouldShowApproveButton,
        shouldDisableApproveButton,
        onlyShowPayElsewhere,
    });

    const confirmExport = useCallback(
        (exportType: ExportType) => {
            if (!moneyRequestReport?.reportID || !connectedIntegration) {
                return;
            }
            if (exportType === CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION) {
                exportToIntegration(moneyRequestReport.reportID, connectedIntegration);
            } else if (exportType === CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
                markAsManuallyExported(moneyRequestReport.reportID, connectedIntegration);
            }
        },
        [connectedIntegration, moneyRequestReport?.reportID],
    );

    const showExportAgainModal = useCallback(
        (exportType: ExportType) => {
            if (!connectedIntegration) {
                return;
            }
            showConfirmModal({
                title: translate('workspace.exportAgainModal.title'),
                prompt: translate('workspace.exportAgainModal.description', {
                    connectionName: connectedIntegration ?? connectedIntegrationFallback,
                    reportName: moneyRequestReport?.reportName ?? '',
                }),
                confirmText: translate('workspace.exportAgainModal.confirmText'),
                cancelText: translate('workspace.exportAgainModal.cancelText'),
            }).then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                confirmExport(exportType);
            });
        },
        [showConfirmModal, translate, connectedIntegration, connectedIntegrationFallback, moneyRequestReport?.reportName, confirmExport],
    );

    const showDWEModal = useCallback(async () => {
        const result = await showConfirmModal({
            confirmText: translate('customApprovalWorkflow.goToExpensifyClassic'),
            title: translate('customApprovalWorkflow.title'),
            prompt: translate('customApprovalWorkflow.description'),
            shouldShowCancelButton: false,
        });

        if (result.action === ModalActions.CONFIRM) {
            openOldDotLink(CONST.OLDDOT_URLS.INBOX);
        }
    }, [showConfirmModal, translate]);

    const duplicateExpenseTransaction = useCallback(
        (transactionList: OnyxTypes.Transaction[]) => {
            if (!transactionList.length) {
                return;
            }

            const optimisticChatReportID = generateReportID();
            const optimisticIOUReportID = generateReportID();
            const targetPolicyCategories = activePolicyCategories ?? {};

            for (const item of transactionList) {
                const existingTransactionID = getExistingTransactionID(item.linkedTrackedExpenseReportAction);
                const existingTransactionDraft = existingTransactionID ? transactionDrafts?.[existingTransactionID] : undefined;

                duplicateTransactionAction({
                    transaction: item,
                    optimisticChatReportID,
                    optimisticIOUReportID,
                    isASAPSubmitBetaEnabled,
                    introSelected,
                    activePolicyID,
                    quickAction,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    isSelfTourViewed,
                    customUnitPolicyID: policy?.id,
                    targetPolicy: defaultExpensePolicy ?? undefined,
                    targetPolicyCategories,
                    targetReport: activePolicyExpenseChat,
                    existingTransactionDraft,
                    draftTransactionIDs,
                    betas,
                    personalDetails,
                    recentWaypoints,
                });
            }
        },
        [
            activePolicyExpenseChat,
            activePolicyID,
            activePolicyCategories,
            transactionDrafts,
            defaultExpensePolicy,
            draftTransactionIDs,
            introSelected,
            isASAPSubmitBetaEnabled,
            quickAction,
            policyRecentlyUsedCurrencies,
            policy?.id,
            isSelfTourViewed,
            betas,
            personalDetails,
            recentWaypoints,
        ],
    );

    const exportSubmenuOptions: Record<string, DropdownOption<string>> = useMemo(() => {
        const options: Record<string, DropdownOption<string>> = {
            [CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV]: {
                text: translate('export.basicExport'),
                icon: expensifyIcons.Table,
                value: CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV,
                sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
                onSelected: () => {
                    if (!moneyRequestReport) {
                        return;
                    }
                    if (isOffline) {
                        showOfflineModal();
                        return;
                    }
                    exportReportToCSV(
                        {reportID: moneyRequestReport.reportID, transactionIDList: transactionIDs},
                        () => {
                            showDownloadError();
                        },
                        translate,
                    );
                },
            },
            [CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION]: {
                // connectedIntegrationFallback is guaranteed non-null when EXPORT secondary action is present
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                text: translate('workspace.common.exportIntegrationSelected', {connectionName: connectedIntegrationFallback!}),
                icon: (() => {
                    return getIntegrationIcon(connectedIntegration ?? connectedIntegrationFallback, expensifyIcons);
                })(),
                displayInDefaultIconColor: true,
                additionalIconStyles: styles.integrationIcon,
                value: CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION,
                sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
                onSelected: () => {
                    if (!connectedIntegration || !moneyRequestReport) {
                        return;
                    }
                    if (isExported) {
                        showExportAgainModal(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION);
                        return;
                    }
                    exportToIntegration(moneyRequestReport.reportID, connectedIntegration);
                },
            },
            [CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED]: {
                text: translate('workspace.common.markAsExported'),
                icon: (() => {
                    return getIntegrationIcon(connectedIntegration ?? connectedIntegrationFallback, expensifyIcons);
                })(),
                additionalIconStyles: styles.integrationIcon,
                displayInDefaultIconColor: true,
                value: CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED,
                sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
                onSelected: () => {
                    if (!connectedIntegration || !moneyRequestReport) {
                        return;
                    }
                    if (isExported) {
                        showExportAgainModal(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED);
                        return;
                    }
                    markAsManuallyExported(moneyRequestReport.reportID, connectedIntegration);
                },
            },
        };

        for (const template of exportTemplates) {
            options[template.name] = {
                text: template.name,
                icon: expensifyIcons.Table,
                value: template.templateName,
                description: template.description,
                sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
                onSelected: () => beginExportWithTemplate(template.templateName, template.type, transactionIDs, template.policyID),
            };
        }

        return options;
    }, [
        translate,
        expensifyIcons,
        connectedIntegrationFallback,
        styles.integrationIcon,
        moneyRequestReport,
        isOffline,
        showOfflineModal,
        showDownloadError,
        transactionIDs,
        connectedIntegration,
        isExported,
        showExportAgainModal,
        exportTemplates,
        beginExportWithTemplate,
    ]);

    const secondaryActions = useMemo(() => {
        if (!moneyRequestReport) {
            return [];
        }
        return getSecondaryReportActions({
            currentUserLogin: login ?? '',
            currentUserAccountID: accountID,
            report: moneyRequestReport,
            chatReport,
            reportTransactions: nonPendingDeleteTransactions,
            originalTransaction: originalIOUTransaction,
            violations,
            bankAccountList,
            policy,
            reportNameValuePairs,
            reportActions,
            reportMetadata,
            policies,
            isChatReportArchived,
        });
    }, [
        moneyRequestReport,
        login,
        accountID,
        chatReport,
        nonPendingDeleteTransactions,
        originalIOUTransaction,
        violations,
        policy,
        reportNameValuePairs,
        reportActions,
        reportMetadata,
        policies,
        isChatReportArchived,
        bankAccountList,
    ]);

    const secondaryExportActions = useMemo(() => {
        if (!moneyRequestReport) {
            return [];
        }
        return getSecondaryExportReportActions(accountID, email ?? '', moneyRequestReport, bankAccountList, policy, exportTemplates);
    }, [moneyRequestReport, accountID, email, policy, exportTemplates, bankAccountList]);

    const connectedIntegrationName = connectedIntegration ? translate('workspace.accounting.connectionName', {connectionName: connectedIntegration}) : '';
    const unapproveWarningText = useMemo(
        () => (
            <Text>
                <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')}</Text> <Text>{translate('iou.unapproveWithIntegrationWarning', connectedIntegrationName)}</Text>
            </Text>
        ),
        [connectedIntegrationName, styles.noWrap, styles.textStrong, translate],
    );

    const reopenExportedReportWarningText = (
        <Text>
            <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')} </Text>
            <Text>{translate('iou.reopenExportedReportConfirmation', {connectionName: integrationNameFromExportMessage ?? ''})}</Text>
        </Text>
    );

    type SecondaryActionOption = DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>;

    const getSecondaryActionConfig = (actionType: ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>): SecondaryActionOption | undefined => {
        switch (actionType) {
            case CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS:
                return {
                    value: CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS,
                    text: translate('iou.viewDetails'),
                    icon: expensifyIcons.Info,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.VIEW_DETAILS,
                    onSelected: () => {
                        navigateToDetailsPage(moneyRequestReport, Navigation.getReportRHPActiveRoute());
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.EXPORT:
                return {
                    value: CONST.REPORT.SECONDARY_ACTIONS.EXPORT,
                    text: translate('common.export'),
                    backButtonText: translate('common.export'),
                    icon: expensifyIcons.Export,
                    rightIcon: expensifyIcons.ArrowRight,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT,
                    subMenuItems: secondaryExportActions.map((exportAction) => exportSubmenuOptions[exportAction as string]),
                };
            case CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF:
                return {
                    value: CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF,
                    text: translate('common.downloadAsPDF'),
                    icon: expensifyIcons.Download,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.DOWNLOAD_PDF,
                    onSelected: () => {
                        if (!moneyRequestReport) {
                            return;
                        }
                        showPDFModal(moneyRequestReport.reportID);
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.SUBMIT:
                return {
                    value: CONST.REPORT.SECONDARY_ACTIONS.SUBMIT,
                    text: translate('common.submit'),
                    icon: expensifyIcons.Send,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.SUBMIT,
                    onSelected: () => {
                        if (!moneyRequestReport) {
                            return;
                        }
                        if (hasDynamicExternalWorkflow(policy) && !isDEWBetaEnabled) {
                            showDWEModal();
                            return;
                        }
                        submitReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, userBillingGraceEndPeriods);
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.APPROVE:
                return {
                    text: translate('iou.approve'),
                    icon: expensifyIcons.ThumbsUp,
                    value: CONST.REPORT.SECONDARY_ACTIONS.APPROVE,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.APPROVE,
                    onSelected: confirmApproval,
                };
            case CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE:
                return {
                    text: translate('iou.unapprove'),
                    icon: expensifyIcons.CircularArrowBackwards,
                    value: CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.UNAPPROVE,
                    onSelected: async () => {
                        if (isDelegateAccessRestricted) {
                            showDelegateNoAccessModal();
                            return;
                        }

                        if (isExported) {
                            const result = await showConfirmModal({
                                title: translate('iou.unapproveReport'),
                                prompt: unapproveWarningText,
                                confirmText: translate('iou.unapproveReport'),
                                cancelText: translate('common.cancel'),
                                danger: true,
                            });

                            if (result.action !== ModalActions.CONFIRM) {
                                return;
                            }
                            unapproveExpenseReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep);
                            return;
                        }

                        unapproveExpenseReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep);
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT:
                return {
                    text: translate('iou.cancelPayment'),
                    icon: expensifyIcons.Clear,
                    value: CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.CANCEL_PAYMENT,
                    onSelected: async () => {
                        const result = await showConfirmModal({
                            title: translate('iou.cancelPayment'),
                            prompt: translate('iou.cancelPaymentConfirmation'),
                            confirmText: translate('iou.cancelPayment'),
                            cancelText: translate('common.dismiss'),
                            danger: true,
                        });

                        if (result.action !== ModalActions.CONFIRM || !chatReport) {
                            return;
                        }
                        cancelPayment(moneyRequestReport, chatReport, policy, isASAPSubmitBetaEnabled, accountID, email ?? '', hasViolations);
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.HOLD:
                return {
                    text: translate('iou.hold'),
                    icon: expensifyIcons.Stopwatch,
                    value: CONST.REPORT.SECONDARY_ACTIONS.HOLD,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.HOLD,
                    onSelected: () => {
                        if (!requestParentReportAction) {
                            throw new Error('Parent action does not exist');
                        }

                        if (isDelegateAccessRestricted) {
                            showDelegateNoAccessModal();
                            return;
                        }

                        const isDismissed = isReportSubmitter ? dismissedHoldUseExplanation : dismissedRejectUseExplanation;

                        if (isDismissed || isChatReportDM) {
                            changeMoneyRequestHoldStatus(requestParentReportAction);
                        } else if (isReportSubmitter) {
                            showHoldEducationalModal();
                        } else {
                            setRejectModalAction(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD);
                        }
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD:
                return {
                    text: translate('iou.unhold'),
                    icon: expensifyIcons.Stopwatch,
                    value: CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.REMOVE_HOLD,
                    onSelected: () => {
                        if (!requestParentReportAction) {
                            throw new Error('Parent action does not exist');
                        }

                        if (isDelegateAccessRestricted) {
                            showDelegateNoAccessModal();
                            return;
                        }

                        changeMoneyRequestHoldStatus(requestParentReportAction);
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.SPLIT:
                return {
                    text: isExpenseSplit ? translate('iou.editSplits') : translate('iou.split'),
                    icon: expensifyIcons.ArrowSplit,
                    value: CONST.REPORT.SECONDARY_ACTIONS.SPLIT,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.SPLIT,
                    onSelected: () => {
                        if (Number(transactions?.length) !== 1) {
                            return;
                        }
                        initSplitExpense(currentTransaction, policy);
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.MERGE:
                return {
                    text: translate('common.merge'),
                    icon: expensifyIcons.ArrowCollapse,
                    value: CONST.REPORT.SECONDARY_ACTIONS.MERGE,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.MERGE,
                    onSelected: () => {
                        if (!currentTransaction) {
                            return;
                        }
                        setupMergeTransactionDataAndNavigate(currentTransaction.transactionID, [currentTransaction], localeCompare);
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE:
                return {
                    text: isDuplicateActive ? translate('common.duplicateExpense') : translate('common.duplicated'),
                    icon: isDuplicateActive ? expensifyIcons.ExpenseCopy : expensifyIcons.Checkmark,
                    iconFill: isDuplicateActive ? undefined : theme.icon,
                    value: CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE,
                    onSelected: () => {
                        if (hasCustomUnitOutOfPolicyViolation) {
                            showRateErrorModal();
                            return;
                        }
                        if (isPerDiemRequestOnNonDefaultWorkspace) {
                            showDuplicatePerDiemErrorModal();
                            return;
                        }
                        if (!isDuplicateActive || !transaction) {
                            return;
                        }
                        temporarilyDisableDuplicateAction();
                        duplicateExpenseTransaction([transaction]);
                    },
                    shouldCloseModalOnSelect:
                        isPerDiemRequestOnNonDefaultWorkspace || hasCustomUnitOutOfPolicyViolation || activePolicyExpenseChat?.iouReportID === moneyRequestReport?.reportID,
                };
            case CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_REPORT:
                return {
                    text: translate('common.duplicateReport'),
                    icon: expensifyIcons.ReportCopy,
                    value: CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_REPORT,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.DUPLICATE_REPORT,
                    shouldShow: false,
                };
            case CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE:
                return {
                    text: translate('iou.changeWorkspace'),
                    icon: expensifyIcons.Buildings,
                    value: CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.CHANGE_WORKSPACE,
                    shouldShow: transactions.length === 0 || nonPendingDeleteTransactions.length > 0,
                    onSelected: () => {
                        if (!moneyRequestReport) {
                            return;
                        }
                        Navigation.navigate(ROUTES.REPORT_WITH_ID_CHANGE_WORKSPACE.getRoute(moneyRequestReport.reportID, Navigation.getActiveRoute()));
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.CHANGE_APPROVER:
                return {
                    text: translate('iou.changeApprover.title'),
                    icon: expensifyIcons.Workflows,
                    value: CONST.REPORT.SECONDARY_ACTIONS.CHANGE_APPROVER,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.CHANGE_APPROVER,
                    onSelected: () => {
                        if (!moneyRequestReport) {
                            Log.warn('Change approver secondary action triggered without moneyRequestReport data.');
                            return;
                        }
                        Navigation.navigate(ROUTES.REPORT_CHANGE_APPROVER.getRoute(moneyRequestReport.reportID, Navigation.getActiveRoute()));
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.DELETE:
                return {
                    text: translate('common.delete'),
                    icon: expensifyIcons.Trashcan,
                    value: CONST.REPORT.SECONDARY_ACTIONS.DELETE,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.DELETE,
                    onSelected: async () => {
                        const transactionCount = Object.keys(transactions).length;

                        if (transactionCount === 1) {
                            const result = await showConfirmModal({
                                title: translate('iou.deleteExpense', {count: 1}),
                                prompt: translate('iou.deleteConfirmation', {count: 1}),
                                confirmText: translate('common.delete'),
                                cancelText: translate('common.cancel'),
                                danger: true,
                            });

                            if (result.action !== ModalActions.CONFIRM) {
                                return;
                            }
                            if (transactionThreadReportID) {
                                if (!requestParentReportAction || !transaction?.transactionID) {
                                    throw new Error('Missing data!');
                                }
                                const goBackRoute = getNavigationUrlOnMoneyRequestDelete(
                                    transaction.transactionID,
                                    requestParentReportAction,
                                    iouReport,
                                    chatIOUReport,
                                    isChatIOUReportArchived,
                                    false,
                                );
                                const deleteNavigateBackUrl = goBackRoute ?? route.params?.backTo ?? Navigation.getActiveRoute();
                                setDeleteTransactionNavigateBackUrl(deleteNavigateBackUrl);
                                if (goBackRoute) {
                                    navigateOnDeleteExpense(goBackRoute);
                                }
                                // Defer deletion until after navigation animation completes
                                // eslint-disable-next-line @typescript-eslint/no-deprecated
                                InteractionManager.runAfterInteractions(() => {
                                    deleteTransactions([transaction.transactionID], duplicateTransactions, duplicateTransactionViolations, currentSearchHash, false);
                                    removeTransaction(transaction.transactionID);
                                });
                            }
                            return;
                        }

                        const result = await showConfirmModal({
                            title: translate('iou.deleteReport', {count: 1}),
                            prompt: translate('iou.deleteReportConfirmation', {count: 1}),
                            confirmText: translate('common.delete'),
                            cancelText: translate('common.cancel'),
                            danger: true,
                        });
                        if (result.action !== ModalActions.CONFIRM) {
                            return;
                        }
                        const backToRoute = route.params?.backTo ?? (chatReport?.reportID ? ROUTES.REPORT_WITH_ID.getRoute(chatReport.reportID) : undefined);
                        const deleteNavigateBackUrl = backToRoute ?? Navigation.getActiveRoute();
                        setDeleteTransactionNavigateBackUrl(deleteNavigateBackUrl);

                        Navigation.setNavigationActionToMicrotaskQueue(() => {
                            Navigation.goBack(backToRoute);
                            // Defer heavy deletion until after navigation animation completes
                            // eslint-disable-next-line @typescript-eslint/no-deprecated
                            InteractionManager.runAfterInteractions(() => {
                                deleteAppReport(moneyRequestReport, selfDMReport, email ?? '', accountID, reportTransactions, allTransactionViolations, bankAccountList, currentSearchHash);
                            });
                        });
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.RETRACT:
                return {
                    text: translate('iou.retract'),
                    icon: expensifyIcons.CircularArrowBackwards,
                    value: CONST.REPORT.SECONDARY_ACTIONS.RETRACT,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.RETRACT,
                    onSelected: () => {
                        retractReport(moneyRequestReport, chatReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep);
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.REOPEN:
                return {
                    text: translate('iou.retract'),
                    icon: expensifyIcons.CircularArrowBackwards,
                    value: CONST.REPORT.SECONDARY_ACTIONS.REOPEN,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.REOPEN,
                    onSelected: async () => {
                        if (isExported) {
                            const result = await showConfirmModal({
                                title: translate('iou.reopenReport'),
                                prompt: reopenExportedReportWarningText,
                                confirmText: translate('iou.reopenReport'),
                                cancelText: translate('common.cancel'),
                                danger: true,
                            });

                            if (result.action !== ModalActions.CONFIRM) {
                                return;
                            }
                            reopenReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, chatReport);
                            return;
                        }
                        reopenReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, chatReport);
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.REJECT:
                return {
                    text: translate('common.reject'),
                    icon: expensifyIcons.ThumbsDown,
                    value: CONST.REPORT.SECONDARY_ACTIONS.REJECT,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.REJECT,
                    onSelected: () => {
                        if (isDelegateAccessRestricted) {
                            showDelegateNoAccessModal();
                            return;
                        }

                        if (dismissedRejectUseExplanation) {
                            if (requestParentReportAction) {
                                rejectMoneyRequestReason(requestParentReportAction);
                            }
                        } else {
                            setRejectModalAction(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT);
                        }
                    },
                    shouldShow: transactions.length === 1,
                };
            case CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE:
                return {
                    text: translate('iou.addExpense'),
                    backButtonText: translate('iou.addExpense'),
                    icon: expensifyIcons.Plus,
                    rightIcon: expensifyIcons.ArrowRight,
                    value: CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE,
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.ADD_EXPENSE,
                    subMenuItems: addExpenseDropdownOptions,
                    onSelected: () => {
                        if (!moneyRequestReport?.reportID) {
                            return;
                        }
                        if (policy && shouldRestrictUserBillableActions(policy.id, userBillingGraceEndPeriods)) {
                            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                            return;
                        }
                        startMoneyRequest(CONST.IOU.TYPE.SUBMIT, moneyRequestReport?.reportID);
                    },
                };
            case CONST.REPORT.SECONDARY_ACTIONS.PAY:
                return {
                    text: translate('iou.settlePayment', totalAmount),
                    icon: expensifyIcons.Cash,
                    rightIcon: expensifyIcons.ArrowRight,
                    value: CONST.REPORT.SECONDARY_ACTIONS.PAY,
                    backButtonText: translate('iou.settlePayment', totalAmount),
                    sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.PAY,
                    subMenuItems: Object.values(paymentButtonOptions),
                };
            default:
                return undefined;
        }
    };

    const applicableSecondaryActions = secondaryActions
        .map((action) => getSecondaryActionConfig(action))
        .filter((action): action is SecondaryActionOption => action !== undefined && action.shouldShow !== false && action.value !== primaryAction);

    const onPaymentSelect = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) =>
        selectPaymentType({
            event,
            iouPaymentType,
            triggerKYCFlow,
            policy,
            onPress: confirmPayment,
            currentAccountID: accountID,
            currentEmail: email ?? '',
            hasViolations,
            isASAPSubmitBetaEnabled,
            isUserValidated,
            confirmApproval,
            iouReport: moneyRequestReport,
            iouReportNextStep: nextStep,
            betas,
            userBillingGraceEndPeriods,
        });

    if (!applicableSecondaryActions.length) {
        return null;
    }

    return (
        <MoneyReportHeaderKYCDropdown
            chatReportID={chatReport?.reportID}
            iouReport={moneyRequestReport}
            onPaymentSelect={onPaymentSelect}
            onSuccessfulKYC={(payment) => confirmPayment(payment)}
            primaryAction={primaryAction}
            applicableSecondaryActions={applicableSecondaryActions}
            ref={kycWallRef}
        />
    );
}

MoneyReportHeaderSecondaryActions.displayName = 'MoneyReportHeaderSecondaryActions';

export default MoneyReportHeaderSecondaryActions;
