import {ModalActions} from '@components/Modal/Global/ModalContext';
import {SUPER_WIDE_RIGHT_MODALS} from '@components/WideRHPContextProvider/WIDE_RIGHT_MODALS';

import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {navigateBackOnDeleteTransaction} from '@libs/ReportUtils';
import {getDeleteConfirmationPrompt, getDeleteExpenseTitle} from '@libs/TransactionUtils';

import type {CaseID, ReportDetailsRequestData} from '@pages/DynamicReportDetailsPage/types';
import {CASES} from '@pages/DynamicReportDetailsPage/types';

import {getNavigationUrlOnMoneyRequestDelete} from '@userActions/IOU/DeleteMoneyRequest';
import {getNavigationUrlAfterTrackExpenseDelete} from '@userActions/IOU/TrackExpense';
import {setDeleteTransactionNavigateBackUrl} from '@userActions/Report';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {StackActions} from '@react-navigation/native';

/** Delete confirmation shared by the task and money Delete rows, navigates back and then deletes once the RHP close transition ends */
function useReportDetailsDeleteModal(reportID: string, caseID: CaseID, parentReportAction?: OnyxEntry<ReportAction>) {
    const {translate} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {showConfirmModal} = useConfirmModal();
    const taskDeleteBackTo = Navigation.getTopmostSearchReportRouteParams()?.backTo;

    // Where to navigate back to after deleting the transaction and its report.
    const navigateToTargetUrl = (requestData?: ReportDetailsRequestData) => {
        if (caseID === CASES.DEFAULT && taskDeleteBackTo) {
            Navigation.goBack(taskDeleteBackTo);
            return;
        }

        const requestParentReportAction = requestData ? requestData.requestParentReportAction : parentReportAction;
        const {
            moneyRequestReport,
            iouTransactionID,
            iouReport,
            chatIOUReport,
            isChatIOUReportArchived,
            isSingleTransactionView,
            requestParentReportActionChildReport,
        }: Partial<ReportDetailsRequestData> = requestData ?? {};

        let urlToNavigateBack: Route | undefined;
        // Only proceed with navigation logic if transaction was actually deleted
        if (!isEmptyObject(requestParentReportAction)) {
            const rootState = navigationRef.getRootState();
            const rhp = rootState.routes.at(-1);
            const rhpRoutes = rhp?.state?.routes ?? [];
            const previousRoute = rhpRoutes.at(-2);
            const previousRouteReportID = previousRoute?.params && 'reportID' in previousRoute.params ? previousRoute.params.reportID : undefined;
            const superWideRHPIndex = rhpRoutes.findIndex((rhpRoute) => SUPER_WIDE_RIGHT_MODALS.has(rhpRoute.name));

            // If the deleted expense is displayed directly below, close the entire RHP
            const isSuperWideRHPDisplayed = superWideRHPIndex > -1;
            const isSuperWideRHPDisplayedDirectlyBelow = isSuperWideRHPDisplayed && superWideRHPIndex === rhpRoutes.length - 2;
            if (isSuperWideRHPDisplayedDirectlyBelow && previousRouteReportID === reportID) {
                Navigation.dismissModal();
                return;
            }

            // If the deleted expense is opened from the super wide rhp, go back there.
            if (previousRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT && previousRouteReportID === reportID) {
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

    const showDeleteModal = async (requestData: ReportDetailsRequestData | undefined, onDelete: () => void) => {
        const deletePrompt = caseID === CASES.DEFAULT ? translate('task.deleteConfirmation') : getDeleteConfirmationPrompt(translate, requestData?.iouTransaction);
        const {action} = await showConfirmModal({
            title: caseID === CASES.DEFAULT ? translate('task.deleteTask') : getDeleteExpenseTitle(translate, requestData?.iouTransaction),
            prompt: deletePrompt,
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            shouldEnableNewFocusManagement: true,
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        const shouldOpenSplitExpenseEditFlow = requestData?.iouTransactionID ? requestData.shouldOpenSplitExpenseEditFlowOnDelete([requestData.iouTransactionID]) : false;
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            if (shouldOpenSplitExpenseEditFlow) {
                onDelete();
                return;
            }

            navigateToTargetUrl(requestData);
            // Delay deletion until the RHP close animation finishes to prevent a brief
            // "Not Found" flash inside the animating-out panel on slower devices.
            TransitionTracker.runAfterTransitions({callback: onDelete, waitForUpcomingTransition: true});
        });
    };

    return showDeleteModal;
}

export default useReportDetailsDeleteModal;
