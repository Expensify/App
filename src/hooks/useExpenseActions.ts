import {hasSeenTourSelector} from '@selectors/Onboarding';
import passthroughPolicyTagListSelector from '@selectors/PolicyTagList';
import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';
import {useRef} from 'react';
import {InteractionManager} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {SecondaryActionEntry} from '@components/MoneyReportHeaderActions/types';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import {duplicateReport as duplicateReportAction, duplicateExpenseTransaction as duplicateTransactionAction} from '@libs/actions/IOU/Duplicate';
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {deleteAppReport} from '@libs/actions/Report';
import initSplitExpense from '@libs/actions/SplitExpenses';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getExistingTransactionID} from '@libs/IOUUtils';
import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyAccessible} from '@libs/PolicyUtils';
import {getIOUActionForTransactionID, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    canEditFieldOfMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    generateReportID,
    getAddExpenseDropdownOptions,
    getPolicyExpenseChat,
    isDM,
    isOpenReport,
    isSelfDM,
    navigateOnDeleteExpense,
} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {
    getChildTransactions,
    getOriginalTransactionWithSplitInfo,
    hasCustomUnitOutOfPolicyViolation as hasCustomUnitOutOfPolicyViolationTransactionUtils,
    isDistanceRequest,
    isPerDiemRequest,
    isTransactionPendingDelete,
} from '@libs/TransactionUtils';
import {startMoneyRequest} from '@userActions/IOU';
import {getNavigationUrlOnMoneyRequestDelete} from '@userActions/IOU/DeleteMoneyRequest';
import {setDeleteTransactionNavigateBackUrl} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import useConfirmModal from './useConfirmModal';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from './useDefaultExpensePolicy';
import useDeleteTransactions from './useDeleteTransactions';
import useDuplicateTransactionsAndViolations from './useDuplicateTransactionsAndViolations';
import useGetIOUReportFromReportAction from './useGetIOUReportFromReportAction';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import useReportIsArchived from './useReportIsArchived';
import useTheme from './useTheme';
import useThrottledButtonState from './useThrottledButtonState';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';
import useTransactionThreadReport from './useTransactionThreadReport';
import useTransactionViolations from './useTransactionViolations';

type UseExpenseActionsParams = {
    reportID: string | undefined;
    isReportInSearch?: boolean;
    backTo?: Route;
    onDuplicateReset?: () => void;
};

type UseExpenseActionsReturn = {
    actions: Partial<Record<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>, SecondaryActionEntry>>;
    addExpenseDropdownOptions: Array<DropdownOption<string>>;
    handleOptionsMenuHide: () => void;
    isDuplicateReportActive: boolean;
    wasDuplicateReportTriggeredRef: React.RefObject<boolean>;
};

function useExpenseActions({reportID, isReportInSearch = false, backTo, onDuplicateReset}: UseExpenseActionsParams): UseExpenseActionsReturn {
    const theme = useTheme();
    const {translate, localeCompare} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {getCurrencyDecimals} = useCurrencyListActions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {login: currentUserLogin, accountID, email} = currentUserPersonalDetails;
    const {currentSearchHash} = useSearchStateContext();
    const {removeTransaction} = useSearchActionsContext();

    // Report data
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);

    const {transactionThreadReportID, transactionThreadReport, reportActions} = useTransactionThreadReport(reportID);

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);

    const transactions: OnyxTypes.Transaction[] = [];
    const nonPendingDeleteTransactions: OnyxTypes.Transaction[] = [];
    for (const transaction of Object.values(reportTransactions)) {
        transactions.push(transaction);
        if (!isTransactionPendingDelete(transaction)) {
            nonPendingDeleteTransactions.push(transaction);
        }
    }

    const currentTransaction = transactions.at(0);
    const requestParentReportAction =
        reportActions?.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport?.parentReportActionID) ??
        null;

    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`);
    const {iouReport, chatReport: chatIOUReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(requestParentReportAction);

    // Global collections
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: passthroughPolicyTagListSelector});
    const [transactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const draftTransactionIDs = Object.keys(transactionDrafts ?? {});
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [selfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    // Billing keys
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);

    // Archive checks
    const isArchivedReport = useReportIsArchived(moneyRequestReport?.reportID);
    const isChatReportArchived = useReportIsArchived(chatReport?.reportID);

    // Default expense policy / chat
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const activePolicyExpenseChat = getPolicyExpenseChat(accountID, defaultExpensePolicy?.id);

    // Duplicate detection
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transactions.map((t) => t.transactionID));

    // Delete hook — pass chatReport (as in MoneyReportHeader) not moneyRequestReport
    const {deleteTransactions} = useDeleteTransactions({
        report: chatReport,
        reportActions,
        policy,
    });

    // Confirm modal
    const {showConfirmModal} = useConfirmModal();

    // Split indicator
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);
    const hasMultipleSplits = !!transaction?.comment?.originalTransactionID && getChildTransactions(allTransactions, allReports, transaction.comment.originalTransactionID).length > 1;
    const isReportOpen = isOpenReport(moneyRequestReport);
    const hasSplitIndicator = isExpenseSplit && (hasMultipleSplits || isReportOpen);

    // Duplicate report throttle
    const [isDuplicateReportActive, temporarilyDisableDuplicateReportAction] = useThrottledButtonState();
    const wasDuplicateReportTriggeredRef = useRef(false);

    const handleOptionsMenuHide = () => {
        wasDuplicateReportTriggeredRef.current = false;
    };

    // The dropdown ref is owned by the caller (orchestrator) — we close the menu by calling into it.
    // We expose an effect trigger instead: when isDuplicateReportActive flips back to true and the flag
    // is set, the caller should call dropdownMenuRef.current?.setIsMenuVisible(false).
    // To keep this self-contained we return the ref so the caller can react to it.

    const singleTransaction = nonPendingDeleteTransactions.length === 1 ? nonPendingDeleteTransactions.at(0) : undefined;
    const canMoveSingleExpense =
        !!singleTransaction &&
        canEditFieldOfMoneyRequest({
            reportAction: getIOUActionForTransactionID(reportActions, singleTransaction.transactionID),
            fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
            isChatReportArchived,
            outstandingReportsByPolicyID,
            transaction: singleTransaction,
        }) &&
        canUserPerformWriteActionReportUtils(moneyRequestReport, isChatReportArchived);

    // Duplicate expense: unsupported / shouldClose flags
    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const hasCustomUnitOutOfPolicyViolation = hasCustomUnitOutOfPolicyViolationTransactionUtils(transactionViolations);
    const isPerDiemRequestOnNonDefaultWorkspace = isPerDiemRequest(transaction) && defaultExpensePolicy?.id !== policy?.id;
    const isDistanceExpenseUnsupportedForDuplicating = !!(
        isDistanceRequest(transaction) &&
        (isArchivedReport || isChatReportArchived || (activePolicyExpenseChat && (isDM(chatReport) || isSelfDM(chatReport))))
    );
    const shouldDuplicateCloseModalOnSelect =
        isDistanceExpenseUnsupportedForDuplicating ||
        isPerDiemRequestOnNonDefaultWorkspace ||
        hasCustomUnitOutOfPolicyViolation ||
        activePolicyExpenseChat?.iouReportID === moneyRequestReport?.reportID;

    const handleDuplicateReset = () => {
        if (shouldDuplicateCloseModalOnSelect) {
            return;
        }
        onDuplicateReset?.();
    };
    const [isDuplicateActive, temporarilyDisableDuplicateAction] = useThrottledButtonState(handleDuplicateReset);

    const targetPolicyTags = defaultExpensePolicy ? (allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${defaultExpensePolicy.id}`] ?? {}) : {};

    const duplicateExpenseTransaction = (transactionList: OnyxTypes.Transaction[]) => {
        if (!transactionList.length) {
            return;
        }
        const optimisticChatReportID = generateReportID();
        const optimisticIOUReportID = generateReportID();
        const activePolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${defaultExpensePolicy?.id}`] ?? {};

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
                targetPolicyCategories: activePolicyCategories,
                targetReport: activePolicyExpenseChat,
                existingTransactionDraft,
                draftTransactionIDs,
                betas,
                personalDetails,
                recentWaypoints,
                targetPolicyTags,
            });
        }
    };

    const addExpenseDropdownOptions = getAddExpenseDropdownOptions({
        translate,
        icons: useMemoizedLazyExpensifyIcons(['Plus', 'ReceiptPlus', 'Location', 'Feed', 'ArrowRight']),
        iouReportID: moneyRequestReport?.reportID,
        policy,
        userBillingGracePeriodEnds,
        draftTransactionIDs,
        amountOwed,
        ownerBillingGracePeriodEnd,
        lastDistanceExpenseType,
    });

    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Plus',
        'ArrowSplit',
        'ArrowCollapse',
        'ExpenseCopy',
        'ReportCopy',
        'Checkmark',
        'DocumentMerge',
        'Workflows',
        'Trashcan',
        'Buildings',
        'ReceiptPlus',
        'Location',
        'Feed',
        'ArrowRight',
    ]);

    const actions: Partial<Record<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>, SecondaryActionEntry>> = {
        [CONST.REPORT.SECONDARY_ACTIONS.SPLIT]: {
            text: hasSplitIndicator ? translate('iou.editSplits') : translate('iou.split'),
            icon: expensifyIcons.ArrowSplit,
            value: CONST.REPORT.SECONDARY_ACTIONS.SPLIT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.SPLIT,
            onSelected: () => {
                if (transactions.length !== 1) {
                    return;
                }
                initSplitExpense(currentTransaction, policy);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.MERGE]: {
            text: translate('common.merge'),
            icon: expensifyIcons.ArrowCollapse,
            value: CONST.REPORT.SECONDARY_ACTIONS.MERGE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.MERGE,
            onSelected: () => {
                if (!currentTransaction) {
                    return;
                }
                setupMergeTransactionDataAndNavigate(currentTransaction.transactionID, [currentTransaction], localeCompare, getCurrencyDecimals);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_EXPENSE]: {
            text: isDuplicateActive ? translate('common.duplicateExpense') : translate('common.duplicated'),
            icon: isDuplicateActive ? expensifyIcons.ExpenseCopy : expensifyIcons.Checkmark,
            iconFill: isDuplicateActive ? undefined : theme.icon,
            value: CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_EXPENSE,
            onSelected: () => {
                if (hasCustomUnitOutOfPolicyViolation) {
                    showConfirmModal({
                        title: translate('common.duplicateExpense'),
                        prompt: translate('iou.correctRateError'),
                        confirmText: translate('common.buttonConfirm'),
                        shouldShowCancelButton: false,
                    });
                    return;
                }

                if (isDistanceExpenseUnsupportedForDuplicating) {
                    showConfirmModal({
                        title: translate('common.duplicateExpense'),
                        prompt: translate('iou.cannotDuplicateDistanceExpense'),
                        confirmText: translate('common.buttonConfirm'),
                        shouldShowCancelButton: false,
                    });
                    return;
                }

                if (isPerDiemRequestOnNonDefaultWorkspace) {
                    showConfirmModal({
                        title: translate('common.duplicateExpense'),
                        prompt: translate('iou.duplicateNonDefaultWorkspacePerDiemError'),
                        confirmText: translate('common.buttonConfirm'),
                        shouldShowCancelButton: false,
                    });
                    return;
                }

                if (!isDuplicateActive || !transaction) {
                    return;
                }

                temporarilyDisableDuplicateAction();
                duplicateExpenseTransaction([transaction]);
            },
            shouldCloseModalOnSelect: shouldDuplicateCloseModalOnSelect,
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_REPORT]: {
            text: isDuplicateReportActive ? translate('common.duplicateReport') : translate('common.duplicated'),
            icon: isDuplicateReportActive ? expensifyIcons.ReportCopy : expensifyIcons.Checkmark,
            iconFill: isDuplicateReportActive ? undefined : theme.icon,
            value: CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_REPORT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.DUPLICATE_REPORT,
            shouldShow: !!defaultExpensePolicy,
            shouldCloseModalOnSelect: false,
            onSelected: () => {
                if (!isDuplicateReportActive) {
                    return;
                }

                temporarilyDisableDuplicateReportAction();
                wasDuplicateReportTriggeredRef.current = true;

                const isSourcePolicyValid = !!policy && isPolicyAccessible(policy, currentUserLogin ?? '');
                const targetPolicyForDuplicate = isSourcePolicyValid ? policy : defaultExpensePolicy;
                const targetChatForDuplicate = isSourcePolicyValid ? chatReport : activePolicyExpenseChat;
                const activePolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${targetPolicyForDuplicate?.id}`] ?? {};

                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => {
                    duplicateReportAction({
                        sourceReport: moneyRequestReport,
                        sourceReportTransactions: nonPendingDeleteTransactions,
                        sourceReportName: moneyRequestReport?.reportName ?? '',
                        targetPolicy: targetPolicyForDuplicate ?? undefined,
                        targetPolicyCategories: activePolicyCategories,
                        targetPolicyTags: allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${targetPolicyForDuplicate?.id}`] ?? {},
                        parentChatReport: targetChatForDuplicate,
                        ownerPersonalDetails: currentUserPersonalDetails,
                        isASAPSubmitBetaEnabled,
                        betas,
                        personalDetails,
                        quickAction,
                        policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                        draftTransactionIDs,
                        isSelfTourViewed,
                        transactionViolations: allTransactionViolations,
                        translate,
                        recentWaypoints: recentWaypoints ?? [],
                    });
                });
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE]: {
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
        },
        [CONST.REPORT.SECONDARY_ACTIONS.MOVE_EXPENSE]: {
            text: translate('iou.moveExpenses'),
            icon: expensifyIcons.DocumentMerge,
            value: CONST.REPORT.SECONDARY_ACTIONS.MOVE_EXPENSE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.MOVE_EXPENSE,
            shouldShow: canMoveSingleExpense,
            onSelected: () => {
                if (!moneyRequestReport || nonPendingDeleteTransactions.length !== 1) {
                    return;
                }
                const transactionToMove = nonPendingDeleteTransactions.at(0);
                if (!transactionToMove?.transactionID) {
                    return;
                }
                Navigation.navigate(
                    ROUTES.MONEY_REQUEST_EDIT_REPORT.getRoute(
                        CONST.IOU.ACTION.EDIT,
                        CONST.IOU.TYPE.SUBMIT,
                        moneyRequestReport.reportID,
                        true,
                        Navigation.getActiveRoute(),
                        transactionToMove.transactionID,
                    ),
                );
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CHANGE_APPROVER]: {
            text: translate('iou.changeApprover.title'),
            icon: expensifyIcons.Workflows,
            value: CONST.REPORT.SECONDARY_ACTIONS.CHANGE_APPROVER,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.CHANGE_APPROVER,
            onSelected: () => {
                if (!moneyRequestReport) {
                    Log.warn('Change approver secondary action triggered without moneyRequestReport data.');
                    return;
                }
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_CHANGE_APPROVER.path));
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DELETE]: {
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
                        const deleteNavigateBackUrl = goBackRoute ?? backTo ?? Navigation.getActiveRoute();
                        setDeleteTransactionNavigateBackUrl(deleteNavigateBackUrl);
                        if (goBackRoute) {
                            navigateOnDeleteExpense(goBackRoute);
                        }
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        InteractionManager.runAfterInteractions(() => {
                            deleteTransactions([transaction.transactionID], duplicateTransactions, duplicateTransactionViolations, isReportInSearch ? currentSearchHash : undefined, false);
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
                const backToRoute = backTo ?? (chatReport?.reportID ? ROUTES.REPORT_WITH_ID.getRoute(chatReport.reportID) : undefined);
                const deleteNavigateBackUrl = backToRoute ?? Navigation.getActiveRoute();
                setDeleteTransactionNavigateBackUrl(deleteNavigateBackUrl);

                Navigation.setNavigationActionToMicrotaskQueue(() => {
                    Navigation.goBack(backToRoute);
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => {
                        deleteAppReport({
                            report: moneyRequestReport,
                            selfDMReport,
                            currentUserEmailParam: email ?? '',
                            currentUserAccountIDParam: accountID,
                            reportTransactions,
                            allTransactionViolations,
                            bankAccountList,
                            hash: currentSearchHash,
                        });
                    });
                });
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE]: {
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
                if (policy && shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed)) {
                    Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                startMoneyRequest(CONST.IOU.TYPE.SUBMIT, moneyRequestReport?.reportID, draftTransactionIDs);
            },
        },
    };

    return {
        actions,
        addExpenseDropdownOptions,
        handleOptionsMenuHide,
        isDuplicateReportActive,
        wasDuplicateReportTriggeredRef,
    };
}

export default useExpenseActions;
export type {UseExpenseActionsParams, UseExpenseActionsReturn};
