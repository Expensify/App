import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchSelectionActions} from '@components/Search/SearchContext';
import {SUPER_WIDE_RIGHT_MODALS} from '@components/WideRHPContextProvider/WIDE_RIGHT_MODALS';

import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useThemeStyles from '@hooks/useThemeStyles';

import getBase62ReportID from '@libs/getBase62ReportID';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {ReportDetailsNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import Permissions from '@libs/Permissions';
import {isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {
    isFinancialReportsForBusinesses as isFinancialReportsForBusinessesUtil,
    isInvoiceReport as isInvoiceReportUtil,
    isMoneyRequest as isMoneyRequestUtil,
    isMoneyRequestReport as isMoneyRequestReportUtil,
    isSelfDM as isSelfDMUtil,
    isTrackExpenseReportNew as isTrackExpenseReportUtil,
    navigateBackOnDeleteTransaction,
} from '@libs/ReportUtils';
import {getDeleteConfirmationPrompt, getDeleteExpenseTitle, getOriginalTransactionWithSplitInfo} from '@libs/TransactionUtils';

import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';

import {getNavigationUrlOnMoneyRequestDelete} from '@userActions/IOU/DeleteMoneyRequest';
import {deleteTrackExpense, getNavigationUrlAfterTrackExpenseDelete} from '@userActions/IOU/TrackExpense';
import {getReportPrivateNote, setDeleteTransactionNavigateBackUrl} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {StackActions} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';

import type {ReportDetailsRequestData} from './types';

import getReportDetailsCaseID from './getReportDetailsCaseID';
import ReportDetailsActions from './ReportDetailsActions';
import ReportDetailsAvatar from './ReportDetailsAvatar';
import ReportDetailsDescription from './ReportDetailsDescription';
import ReportDetailsNameSection from './ReportDetailsNameSection';
import ReportDetailsPromotedActions from './ReportDetailsPromotedActions';
import ReportDetailsTitleSection from './ReportDetailsTitleSection';
import {CASES} from './types';

type DynamicReportDetailsPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>;

function DynamicReportDetailsPage({report, route, reportLoadingState}: DynamicReportDetailsPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const navigateBackFromReportDetailsPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_DETAILS.path);
    const taskDeleteBackTo = Navigation.getTopmostSearchReportRouteParams()?.backTo;

    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`);

    const parentReportAction = useParentReportAction(report);

    const {removeTransaction} = useSearchSelectionActions();

    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails?.accountID;
    const currentUserEmail = currentUserPersonalDetails?.email;
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {showConfirmModal} = useConfirmModal();
    const isMoneyRequestReport = isMoneyRequestReportUtil(report);
    const isMoneyRequest = isMoneyRequestUtil(report);
    const isInvoiceReport = isInvoiceReportUtil(report);
    const isFinancialReportsForBusinesses = isFinancialReportsForBusinessesUtil(report);
    const isSelfDM = isSelfDMUtil(report);
    const isTrackExpenseReport = isTrackExpenseReportUtil(report, parentReport, parentReportAction);
    const isExpenseReport = isMoneyRequestReport || isInvoiceReport || isMoneyRequest;
    const base62ReportID = getBase62ReportID(Number(report.reportID));

    const caseID = getReportDetailsCaseID({isMoneyRequestReport, isInvoiceReport, isMoneyRequest, isTrackExpenseReport});

    const isPrivateNotesFetchTriggered = reportLoadingState?.isLoadingPrivateNotes !== undefined;

    useEffect(() => {
        // Do not fetch private notes if the feature is disabled, isLoadingPrivateNotes is already defined, the network is offline, or if the report is a self DM.
        if (!Permissions.canUsePrivateNotes() || isPrivateNotesFetchTriggered || isOffline || isSelfDM) {
            return;
        }

        getReportPrivateNote(report?.reportID);
    }, [report?.reportID, isOffline, isPrivateNotesFetchTriggered, isSelfDM]);

    const deleteTransaction = ({
        requestParentReportAction,
        iouTransaction,
        iouOriginalTransaction,
        moneyRequestReport,
        moneyRequestReportActions,
        transactionThreadReportActions,
        iouTransactionID,
        iouReport,
        iouReportTransactions,
        chatIOUReport,
        duplicateTransactions,
        duplicateTransactionViolations,
        isSingleTransactionView,
        isMoneyRequestReportArchived,
        isChatIOUReportArchived,
        iouPolicy,
        deleteTransactions,
    }: ReportDetailsRequestData) => {
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
                transactionThreadReportActions,
                transactionID: iouTransactionID,
                reportAction: requestParentReportAction,
                iouReport,
                iouReportTransactions,
                chatIOUReport,
                transactions: duplicateTransactions,
                violations: duplicateTransactionViolations,
                isSingleTransactionView,
                isChatReportArchived: isMoneyRequestReportArchived,
                isChatIOUReportArchived,
                allTransactionViolationsParam: allTransactionViolations,
                currentUserAccountID,
                currentUserEmail: currentUserEmail ?? '',
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

        let urlToNavigateBack: string | undefined;
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
            if (
                isSuperWideRHPDisplayedDirectlyBelow &&
                (previousRoute?.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT])?.reportID === route.params.reportID
            ) {
                Navigation.dismissModal();
                return;
            }

            // If the deleted expense is opened from the super wide rhp, go back there.
            if (
                previousRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT &&
                (previousRoute.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT])?.reportID === route.params.reportID
            ) {
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
            navigateBackOnDeleteTransaction(urlToNavigateBack as Route);
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

    return (
        <ScreenWrapper testID="DynamicReportDetailsPage">
            <FullPageNotFoundView shouldShow={isEmptyObject(report)}>
                <HeaderWithBackButton
                    title={translate('common.details')}
                    onBackButtonPress={() => Navigation.goBack(navigateBackFromReportDetailsPath)}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <View style={[styles.reportDetailsTitleContainer, styles.pb0]}>
                        <ReportDetailsAvatar reportID={report.reportID} />
                    </View>
                    {isExpenseReport ? <ReportDetailsTitleSection reportID={report.reportID} /> : <ReportDetailsNameSection reportID={report.reportID} />}

                    <ReportDetailsDescription reportID={report.reportID} />

                    {isFinancialReportsForBusinesses && (
                        <>
                            <MenuItemWithTopDescription
                                title={base62ReportID}
                                description={translate('common.reportID')}
                                copyValue={base62ReportID}
                                interactive={false}
                                shouldBlockSelection
                                copyable
                            />
                            <MenuItemWithTopDescription
                                title={report.reportID}
                                description={translate('common.longReportID')}
                                copyValue={report.reportID}
                                interactive={false}
                                shouldBlockSelection
                                copyable
                            />
                        </>
                    )}

                    <ReportDetailsPromotedActions reportID={report.reportID} />

                    <ReportDetailsActions
                        reportID={report.reportID}
                        showDeleteModal={showDeleteModal}
                        deleteTransaction={deleteTransaction}
                    />
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(DynamicReportDetailsPage);
