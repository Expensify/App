import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSearchSelectionActions} from '@components/Search/SearchContext';
import {SUPER_WIDE_RIGHT_MODALS} from '@components/WideRHPContextProvider/WIDE_RIGHT_MODALS';

import useAncestors from '@hooks/useAncestors';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDeleteTransactions from '@hooks/useDeleteTransactions';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import useHasOutstandingChildTask from '@hooks/useHasOutstandingChildTask';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {
    canDeleteCardTransactionByLiabilityType,
    canDeleteTransaction,
    canWriteInReport,
    isCanceledTaskReport,
    isClosedReport,
    isMoneyRequest,
    isSelfDM,
    isTaskReport as isTaskReportUtil,
    isTrackExpenseReportNew,
    navigateBackOnDeleteTransaction,
} from '@libs/ReportUtils';
import {getDeleteConfirmationPrompt, getDeleteExpenseTitle, getOriginalTransactionWithSplitInfo, isDemoTransaction} from '@libs/TransactionUtils';

import {getNavigationUrlOnMoneyRequestDelete} from '@userActions/IOU/DeleteMoneyRequest';
import {deleteTrackExpense, getNavigationUrlAfterTrackExpenseDelete} from '@userActions/IOU/TrackExpense';
import {setDeleteTransactionNavigateBackUrl} from '@userActions/Report';
import {canActionTask, canModifyTask, deleteTask} from '@userActions/Task';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, ReportAction, ReportActions, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {StackActions} from '@react-navigation/native';
import {delegateEmailSelector} from '@selectors/Account';
import React from 'react';

import type {CaseID} from './types';

import {CASES} from './types';

type ReportDetailsDeleteActionProps = {
    report: Report;
    policy: OnyxEntry<Policy>;
    parentReport: OnyxEntry<Report>;
    parentReportAction: OnyxEntry<ReportAction>;
    caseID: CaseID;

    /** The reportID the details page was opened with, used to detect whether the deleted expense is displayed right below the RHP */
    reportIDFromRoute: string;

    /** The IOU action the page acts on */
    requestParentReportAction: OnyxEntry<ReportAction>;
    moneyRequestReport: OnyxEntry<Report>;
    moneyRequestReportActions: OnyxEntry<ReportActions>;
    isMoneyRequestReportArchived: boolean;
    iouTransactionID: string | undefined;
    iouTransaction: OnyxEntry<Transaction>;
    iouOriginalTransaction: OnyxEntry<Transaction>;
    isActionOwner: boolean;
    isDeletedParentAction: boolean;

    /** All actions of the report, needed to delete a task */
    reportActionsForOriginalReportID: OnyxEntry<ReportActions>;
};

/** Reads the reportID of a Search RHP route without asserting the route's param type */
function getReportIDFromRouteParams(params: unknown): string | undefined {
    if (typeof params !== 'object' || params === null || !('reportID' in params) || typeof params.reportID !== 'string') {
        return undefined;
    }
    return params.reportID;
}

/** "Delete task" / "Delete expense" / "Edit splits" row at the bottom of the details page, with its confirmation and navigate-back logic */
function ReportDetailsDeleteAction({
    report,
    policy,
    parentReport,
    parentReportAction,
    caseID,
    reportIDFromRoute,
    requestParentReportAction,
    moneyRequestReport,
    moneyRequestReportActions,
    isMoneyRequestReportArchived,
    iouTransactionID,
    iouTransaction,
    iouOriginalTransaction,
    isActionOwner,
    isDeletedParentAction,
    reportActionsForOriginalReportID,
}: ReportDetailsDeleteActionProps) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Trashcan', 'ArrowSplit']);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {showConfirmModal} = useConfirmModal();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {removeTransaction} = useSearchSelectionActions();
    const taskDeleteBackTo = Navigation.getTopmostSearchReportRouteParams()?.backTo;

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [requestParentReportActionChildReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(requestParentReportAction?.childReportID)}`);
    const {iouReport, chatReport: chatIOUReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(requestParentReportAction);
    const [iouPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);

    const isReportArchived = useReportIsArchived(report?.reportID);
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);
    const hasOutstandingChildTask = useHasOutstandingChildTask(report);
    const ancestors = useAncestors(report);
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(iouTransactionID ? [iouTransactionID] : []);
    const {deleteTransactions, shouldOpenSplitExpenseEditFlowOnDelete} = useDeleteTransactions({
        report: parentReport,
        reportActions: requestParentReportAction ? [requestParentReportAction] : [],
        policy,
    });

    const isTaskReport = isTaskReportUtil(report);
    const isTaskModifiable = canModifyTask(report, currentUserPersonalDetails?.accountID, isParentReportArchived);
    const isTaskActionable = canActionTask(report, parentReportAction, currentUserPersonalDetails?.accountID, parentReport, isParentReportArchived);
    const shouldShowTaskDeleteButton =
        isTaskReport &&
        !isCanceledTaskReport(report, parentReportAction) &&
        canWriteInReport(report) &&
        report.stateNum !== CONST.REPORT.STATE_NUM.APPROVED &&
        !isClosedReport(report) &&
        isTaskModifiable &&
        isTaskActionable;

    const isTrackExpenseReport = isTrackExpenseReportNew(report, parentReport, parentReportAction);
    const isSingleTransactionView = isMoneyRequest(report) || isTrackExpenseReport;
    const isSelfDMTrackExpenseReport = isTrackExpenseReport && isSelfDM(parentReport);
    const canDeleteRequest = isActionOwner && (canDeleteTransaction(moneyRequestReport, isMoneyRequestReportArchived) || isSelfDMTrackExpenseReport) && !isDeletedParentAction;
    const isCardTransactionCanBeDeleted = canDeleteCardTransactionByLiabilityType(iouTransaction);
    const shouldShowDeleteButton = shouldShowTaskDeleteButton || (canDeleteRequest && isCardTransactionCanBeDeleted) || isDemoTransaction(iouTransaction);
    const shouldShowEditSplitOnDeleteAction = iouTransactionID ? shouldOpenSplitExpenseEditFlowOnDelete([iouTransactionID]) : false;

    let deleteMenuItemTitle = translate('reportActionContextMenu.deleteAction', requestParentReportAction);
    if (shouldShowEditSplitOnDeleteAction) {
        deleteMenuItemTitle = translate('iou.editSplits');
    } else if (caseID === CASES.DEFAULT) {
        deleteMenuItemTitle = translate('common.delete');
    }

    const deleteTransaction = () => {
        if (caseID === CASES.DEFAULT) {
            deleteTask(
                report,
                parentReport,
                isReportArchived,
                currentUserPersonalDetails.accountID,
                hasOutstandingChildTask,
                parentReportAction,
                conciergeReportID,
                delegateEmail,
                reportActionsForOriginalReportID,
                {
                    ancestors,
                    shouldNavigateBack: !taskDeleteBackTo,
                },
            );
            return;
        }

        if (!requestParentReportAction) {
            return;
        }

        const isTrackExpense = isTrackExpenseAction(requestParentReportAction);
        const {isExpenseSplit: isSelfDMExpenseSplit} = getOriginalTransactionWithSplitInfo(iouTransaction, iouOriginalTransaction);

        if (isTrackExpense && !isSelfDMExpenseSplit) {
            deleteTrackExpense({
                chatReportID: moneyRequestReport?.reportID,
                chatReport: moneyRequestReport,
                chatReportActions: moneyRequestReportActions,
                transactionID: iouTransactionID,
                reportAction: requestParentReportAction,
                iouReport,
                chatIOUReport,
                transactions: duplicateTransactions,
                violations: duplicateTransactionViolations,
                isSingleTransactionView,
                isChatReportArchived: isMoneyRequestReportArchived,
                isChatIOUReportArchived,
                allTransactionViolationsParam: allTransactionViolations,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                currentUserEmail: currentUserPersonalDetails.email ?? '',
                policy: iouPolicy,
                getCurrencyDecimals,
            });
        } else if (iouTransactionID) {
            const deleteResult = deleteTransactions([iouTransactionID], duplicateTransactions, duplicateTransactionViolations, undefined, isSingleTransactionView);
            if (deleteResult.action === 'redirected') {
                return;
            }
            removeTransaction(iouTransactionID);
        }
    };

    // Where to navigate back to after deleting the transaction and its report.
    const navigateToTargetUrl = () => {
        if (caseID === CASES.DEFAULT && taskDeleteBackTo) {
            Navigation.goBack(taskDeleteBackTo);
            return;
        }

        let urlToNavigateBack: Route | undefined;
        // Only proceed with navigation logic if transaction was actually deleted
        if (!isEmptyObject(requestParentReportAction)) {
            const rootState = navigationRef.getRootState();
            const rhp = rootState.routes.at(-1);
            const rhpRoutes = rhp?.state?.routes ?? [];
            const previousRoute = rhpRoutes.at(-2);
            const superWideRHPIndex = rhpRoutes.findIndex((rhpRoute) => SUPER_WIDE_RIGHT_MODALS.has(rhpRoute.name));

            // If the deleted expense is displayed directly below, close the entire RHP
            const isSuperWideRHPDisplayed = superWideRHPIndex > -1;
            const isSuperWideRHPDisplayedDirectlyBelow = isSuperWideRHPDisplayed && superWideRHPIndex === rhpRoutes.length - 2;
            if (isSuperWideRHPDisplayedDirectlyBelow && getReportIDFromRouteParams(previousRoute?.params) === reportIDFromRoute) {
                Navigation.dismissModal();
                return;
            }

            // If the deleted expense is opened from the super wide rhp, go back there.
            if (previousRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT && getReportIDFromRouteParams(previousRoute.params) === reportIDFromRoute) {
                if (isSuperWideRHPDisplayed) {
                    const distanceToPop = rhpRoutes.length - 1 - superWideRHPIndex;
                    navigationRef.dispatch({...StackActions.pop(distanceToPop), target: rhp?.state?.key});
                    return;
                }
                Navigation.dismissModal();
                return;
            }

            const isTrackExpense = isTrackExpenseAction(requestParentReportAction);
            if (isTrackExpense) {
                urlToNavigateBack = getNavigationUrlAfterTrackExpenseDelete(
                    moneyRequestReport?.reportID,
                    moneyRequestReport,
                    iouTransactionID,
                    requestParentReportAction,
                    iouReport,
                    chatIOUReport,
                    isChatIOUReportArchived,
                    getCurrencyDecimals,
                    isSingleTransactionView,
                );
            } else {
                urlToNavigateBack = getNavigationUrlOnMoneyRequestDelete(
                    iouTransactionID,
                    requestParentReportAction,
                    requestParentReportActionChildReport,
                    iouReport,
                    chatIOUReport,
                    isChatIOUReportArchived,
                    getCurrencyDecimals,
                    isSingleTransactionView,
                );
            }
        }

        if (!urlToNavigateBack) {
            Navigation.dismissModal();
        } else {
            setDeleteTransactionNavigateBackUrl(urlToNavigateBack);
            navigateBackOnDeleteTransaction(urlToNavigateBack);
        }
    };

    const showDeleteModal = async () => {
        const deletePrompt = caseID === CASES.DEFAULT ? translate('task.deleteConfirmation') : getDeleteConfirmationPrompt(translate, iouTransaction);
        const {action} = await showConfirmModal({
            title: caseID === CASES.DEFAULT ? translate('task.deleteTask') : getDeleteExpenseTitle(translate, iouTransaction),
            prompt: deletePrompt,
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            shouldEnableNewFocusManagement: true,
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        const shouldOpenSplitExpenseEditFlow = iouTransactionID ? shouldOpenSplitExpenseEditFlowOnDelete([iouTransactionID]) : false;
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            if (shouldOpenSplitExpenseEditFlow) {
                deleteTransaction();
                return;
            }

            navigateToTargetUrl();
            // Delay deletion until the RHP close animation finishes to prevent a brief
            // "Not Found" flash inside the animating-out panel on slower devices.
            TransitionTracker.runAfterTransitions({callback: deleteTransaction, waitForUpcomingTransition: true});
        });
    };

    if (!shouldShowDeleteButton) {
        return null;
    }

    return (
        <MenuItemAction
            icon={shouldShowEditSplitOnDeleteAction ? expensifyIcons.ArrowSplit : expensifyIcons.Trashcan}
            title={deleteMenuItemTitle}
            onPress={shouldShowEditSplitOnDeleteAction ? deleteTransaction : showDeleteModal}
        />
    );
}

export default ReportDetailsDeleteAction;
