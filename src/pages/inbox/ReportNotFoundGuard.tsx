import {useIsFocused, useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useEffect, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {isDeletedParentAction} from '@libs/ReportActionsUtils';
import {
    isAdminRoom,
    isAnnounceRoom,
    isGroupChat,
    isMoneyRequest,
    isMoneyRequestReport,
    isMoneyRequestReportPendingDeletion,
    isPolicyExpenseChat,
    isReportTransactionThread,
    isTaskReport,
    isValidReportIDFromPath,
} from '@libs/ReportUtils';
import {getParentReportActionDeletionStatus} from '@libs/TransactionNavigationUtils';
import {setShouldShowComposeInput} from '@userActions/Composer';
import {navigateToConciergeChat, readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useReportWasDeleted from './hooks/useReportWasDeleted';
import LinkedActionNotFoundGuard from './LinkedActionNotFoundGuard';

const reportDetailScreens = [
    ...Object.values(SCREENS.REPORT_DETAILS),
    ...Object.values(SCREENS.REPORT_SETTINGS),
    ...Object.values(SCREENS.PRIVATE_NOTES),
    ...Object.values(SCREENS.REPORT_PARTICIPANTS),
];

const defaultReportMetadata = {
    hasOnceLoadedReportActions: false,
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    isOptimisticReport: false,
};

function isEmpty(report: OnyxEntry<OnyxTypes.Report>): boolean {
    if (isEmptyObject(report)) {
        return true;
    }
    return !Object.values(report).some((value) => value !== undefined && value !== '');
}

type ReportNotFoundGuardProps = {
    children: ReactNode;
};

/**
 * Owns not-found/deletion/navigation logic. Renders FullPageNotFoundView or children.
 * Linked action not-found logic is delegated to LinkedActionNotFoundGuard (child).
 */
// eslint-disable-next-line rulesdir/no-negated-variables
function ReportNotFoundGuard({children}: ReportNotFoundGuardProps) {
    const styles = useThemeStyles();
    const route = useRoute();
    const routeParams = route.params as {reportID?: string; reportActionID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);

    const isFocused = useIsFocused();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [firstRender, setFirstRender] = useState(true);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [parentReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.parentReportID}`);
    const [userLeavingStatus = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportIDFromRoute}`);
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [deleteTransactionNavigateBackUrl] = useOnyx(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL);

    const parentReportAction = useParentReportAction(report);
    const deletedParentAction = isDeletedParentAction(parentReportAction);
    const prevDeletedParentAction = usePrevious(deletedParentAction);

    const reportID = report?.reportID;
    const prevReport = usePrevious(report);
    const prevUserLeavingStatus = usePrevious(userLeavingStatus);
    const lastReportIDFromRoute = usePrevious(reportIDFromRoute);

    const isOptimisticDelete = report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;
    const {wasDeleted: reportWasDeleted, parentReportID: deletedReportParentID} = useReportWasDeleted(reportIDFromRoute, report, isOptimisticDelete, userLeavingStatus);

    const isReportArchived = useReportIsArchived(report?.reportID);
    const {isEditingDisabled} = useIsReportReadyToDisplay(report, reportIDFromRoute, isReportArchived);

    // --- Parent action deletion status ---
    const {isParentActionMissingAfterLoad, isParentActionDeleted} = getParentReportActionDeletionStatus({
        parentReportID: report?.parentReportID,
        parentReportActionID: report?.parentReportActionID,
        parentReportAction,
        parentReportMetadata,
        isOffline,
    });
    const isDeletedTransactionThread = isReportTransactionThread(report) && (isParentActionDeleted || isParentActionMissingAfterLoad);

    const currentReportIDFormRoute = (route.params as {reportID?: string} | undefined)?.reportID;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo((): boolean => {
        const isInvalidReportPath = !!currentReportIDFormRoute && !isValidReportIDFromPath(currentReportIDFormRoute);
        const isLoading = isLoadingApp !== false || isLoadingReportData || (!isOffline && !!reportMetadata?.isLoadingInitialReportActions);
        const reportExists = !!reportID || (!isDeletedTransactionThread && isOptimisticDelete) || userLeavingStatus;

        if (deleteTransactionNavigateBackUrl) {
            return false;
        }
        if (isDeletedTransactionThread) {
            return true;
        }
        if (isInvalidReportPath) {
            return true;
        }
        if (isLoading) {
            return false;
        }
        if (firstRender) {
            return false;
        }
        return !reportExists;
    }, [
        isLoadingApp,
        isLoadingReportData,
        isOffline,
        reportMetadata?.isLoadingInitialReportActions,
        reportID,
        isOptimisticDelete,
        userLeavingStatus,
        currentReportIDFormRoute,
        firstRender,
        deleteTransactionNavigateBackUrl,
        isDeletedTransactionThread,
    ]);

    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const isTopMostReportId = currentReportIDValue === reportIDFromRoute;

    // --- Navigation on report removal (the big effect) ---
    useEffect(() => {
        if (firstRender) {
            setFirstRender(false);
            return;
        }

        const onyxReportID = report?.reportID;
        const prevOnyxReportID = prevReport?.reportID;
        const wasReportRemoved = !!prevOnyxReportID && prevOnyxReportID === reportIDFromRoute && !onyxReportID;
        const isRemovalExpectedForReportType =
            isEmpty(report) &&
            (isMoneyRequest(prevReport) ||
                isMoneyRequestReport(prevReport) ||
                isPolicyExpenseChat(prevReport) ||
                isGroupChat(prevReport) ||
                isAdminRoom(prevReport) ||
                isAnnounceRoom(prevReport));
        const didReportClose = wasReportRemoved && prevReport.statusNum === CONST.REPORT.STATUS_NUM.OPEN && report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;
        const isTopLevelPolicyRoomWithNoStatus = !report?.statusNum && !prevReport?.parentReportID && prevReport?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_ROOM;
        const isClosedTopLevelPolicyRoom = wasReportRemoved && prevReport.statusNum === CONST.REPORT.STATUS_NUM.OPEN && isTopLevelPolicyRoomWithNoStatus;

        if (
            (!prevUserLeavingStatus && !!userLeavingStatus) ||
            didReportClose ||
            isRemovalExpectedForReportType ||
            isClosedTopLevelPolicyRoom ||
            (prevDeletedParentAction && !deletedParentAction)
        ) {
            const currentRoute = navigationRef.getCurrentRoute();
            const topmostReportIDInSearchRHP = Navigation.getTopmostSearchReportID();
            const isTopmostSearchReportID = reportIDFromRoute === topmostReportIDInSearchRHP;
            const isHoldScreenOpenInRHP =
                currentRoute?.name === SCREENS.MONEY_REQUEST.HOLD && (route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT ? isTopmostSearchReportID : isTopMostReportId);
            const isReportDetailOpenInRHP =
                isTopMostReportId &&
                reportDetailScreens.find((r) => r === currentRoute?.name) &&
                !!currentRoute?.params &&
                typeof currentRoute.params === 'object' &&
                'reportID' in currentRoute.params &&
                reportIDFromRoute === currentRoute.params.reportID;

            if ((!isFocused && !isHoldScreenOpenInRHP && !isReportDetailOpenInRHP) || (!isHoldScreenOpenInRHP && isInNarrowPaneModal)) {
                return;
            }
            Navigation.dismissModal();
            if (Navigation.getTopmostReportId() === prevOnyxReportID) {
                Navigation.isNavigationReady().then(() => {
                    Navigation.popToSidebar();
                });
            }
            if (prevReport?.parentReportID) {
                if (isMoneyRequestReportPendingDeletion(prevReport.parentReportID)) {
                    return;
                }
                Navigation.isNavigationReady().then(() => {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(prevReport.parentReportID));
                });
                return;
            }

            Navigation.isNavigationReady().then(() => {
                navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, false);
            });
            return;
        }

        if (reportIDFromRoute === lastReportIDFromRoute && (!onyxReportID || onyxReportID === reportIDFromRoute)) {
            return;
        }

        setShouldShowComposeInput(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        route.name,
        report,
        prevReport?.reportID,
        prevUserLeavingStatus,
        userLeavingStatus,
        prevReport?.statusNum,
        prevReport?.parentReportID,
        prevReport?.chatType,
        prevReport,
        reportIDFromRoute,
        lastReportIDFromRoute,
        isFocused,
        deletedParentAction,
        prevDeletedParentAction,
    ]);

    // --- Navigate on report deletion ---
    useEffect(() => {
        if (!reportWasDeleted) {
            return;
        }
        if (!isFocused) {
            return;
        }
        if (deletedReportParentID && !isMoneyRequestReportPendingDeletion(deletedReportParentID)) {
            Navigation.isNavigationReady().then(() => {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(deletedReportParentID));
            });
            return;
        }
        Navigation.isNavigationReady().then(() => {
            navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID);
        });
    }, [reportWasDeleted, isFocused, deletedReportParentID, conciergeReportID, introSelected, currentUserAccountID]);

    // --- Task report init ---
    useEffect(() => {
        if (!!report?.lastReadTime || !isTaskReport(report)) {
            return;
        }
        readNewestAction(report?.reportID, !!reportMetadata?.hasOnceLoadedReportActions);
    }, [report, reportMetadata?.hasOnceLoadedReportActions]);

    return (
        <FullPageNotFoundView
            shouldShow={shouldShowNotFoundPage}
            subtitleKey="notFound.noAccess"
            subtitleStyle={[styles.textSupporting]}
            shouldShowBackButton={shouldUseNarrowLayout}
            onBackButtonPress={Navigation.goBack}
            shouldDisplaySearchRouter
        >
            <DragAndDropProvider isDisabled={isEditingDisabled}>
                <LinkedActionNotFoundGuard>{children}</LinkedActionNotFoundGuard>
            </DragAndDropProvider>
        </FullPageNotFoundView>
    );
}

export default ReportNotFoundGuard;
