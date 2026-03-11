import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {isDeletedParentAction} from '@libs/ReportActionsUtils';
import {isAdminRoom, isAnnounceRoom, isGroupChat, isMoneyRequest, isMoneyRequestReport, isMoneyRequestReportPendingDeletion, isPolicyExpenseChat} from '@libs/ReportUtils';
import {setShouldShowComposeInput} from '@userActions/Composer';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useReportWasDeleted from './hooks/useReportWasDeleted';

const reportDetailScreens = [
    ...Object.values(SCREENS.REPORT_DETAILS),
    ...Object.values(SCREENS.REPORT_SETTINGS),
    ...Object.values(SCREENS.PRIVATE_NOTES),
    ...Object.values(SCREENS.REPORT_PARTICIPANTS),
];

function isEmpty(report: OnyxEntry<OnyxTypes.Report>): boolean {
    if (isEmptyObject(report)) {
        return true;
    }
    return !Object.values(report).some((value) => value !== undefined && value !== '');
}

/**
 * Renderless handler that navigates away when a report is removed, closed, or deleted.
 * Self-subscribes to its own data via useRoute().
 */
function ReportNavigateAwayHandler() {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);

    const isFocused = useIsFocused();
    const {isInNarrowPaneModal} = useResponsiveLayout();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const firstRender = useRef(true);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [userLeavingStatus = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportIDFromRoute}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const parentReportAction = useParentReportAction(report);
    const deletedParentAction = isDeletedParentAction(parentReportAction);
    const prevDeletedParentAction = usePrevious(deletedParentAction);

    const prevReport = usePrevious(report);
    const prevUserLeavingStatus = usePrevious(userLeavingStatus);
    const lastReportIDFromRoute = usePrevious(reportIDFromRoute);

    const isOptimisticDelete = report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;
    const {wasDeleted: reportWasDeleted, parentReportID: deletedReportParentID} = useReportWasDeleted(reportIDFromRoute, report, isOptimisticDelete, userLeavingStatus);

    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const isTopMostReportId = currentReportIDValue === reportIDFromRoute;

    // --- Navigation on report removal ---
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
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

    return null;
}

export default ReportNavigateAwayHandler;
