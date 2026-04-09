import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsOwnWorkspaceChatRef from '@hooks/useIsOwnWorkspaceChatRef';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {isDeletedParentAction} from '@libs/ReportActionsUtils';
import {isAdminRoom, isAnnounceRoom, isGroupChat, isMoneyRequest, isMoneyRequestReport, isMoneyRequestReportPendingDeletion, isPolicyExpenseChat} from '@libs/ReportUtils';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@navigation/types';
import {setShouldShowComposeInput} from '@userActions/Composer';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useReportWasDeleted from './hooks/useReportWasDeleted';

type ReportScreenRoute =
    | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>;

const reportDetailScreens = [
    ...Object.values(SCREENS.REPORT_DETAILS),
    ...Object.values(SCREENS.REPORT_SETTINGS),
    ...Object.values(SCREENS.PRIVATE_NOTES),
    ...Object.values(SCREENS.REPORT_PARTICIPANTS),
];

/**
 * Check is the report is deleted.
 * We currently use useMemo to memorize every properties of the report
 * so we can't check using isEmpty.
 */
function isEmpty(report: OnyxEntry<OnyxTypes.Report>): boolean {
    if (isEmptyObject(report)) {
        return true;
    }
    return !Object.values(report).some((value) => value !== undefined && value !== '');
}

/**
 * Component that does not render anything. Owns navigate-on-removal and navigate-on-deletion logic
 * that was previously in ReportScreen.
 *
 * Self-subscribes to route params via useRoute().
 */
function ReportNavigateAwayHandler() {
    const route = useRoute<ReportScreenRoute>();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);

    const isFocused = useIsFocused();
    const {isInNarrowPaneModal} = useResponsiveLayout();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const isTopMostReportId = currentReportIDValue === reportIDFromRoute;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [userLeavingStatus = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportIDFromRoute}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const isSelfTourViewed = onboarding?.selfTourViewed;
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const parentReportAction = useParentReportAction(report);
    const deletedParentAction = isDeletedParentAction(parentReportAction);
    const prevDeletedParentAction = usePrevious(deletedParentAction);

    const prevReport = usePrevious(report);
    const prevUserLeavingStatus = usePrevious(userLeavingStatus);
    const lastReportIDFromRoute = usePrevious(reportIDFromRoute);

    const isOptimisticDelete = report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;
    const {wasDeleted: reportWasDeleted, parentReportID: deletedReportParentID} = useReportWasDeleted(reportIDFromRoute, report, isOptimisticDelete, userLeavingStatus);

    // Track whether the current route is an own workspace chat. A vacation delegate split sends
    // a temporary Onyx SET that wipes the report; by the time effects fire, report is undefined
    // so we must persist the value in a ref updated synchronously during render. See issue #84248.
    const isCurrentRouteOwnWorkspaceChatRef = useIsOwnWorkspaceChatRef(report, reportIDFromRoute);

    const firstRender = useRef(true);

    // Navigation action that reads non-reactive context (concierge params, modal state, etc.)
    const navigateAwayFromReport = useEffectEvent((prevOnyxReportID: string | undefined, prevParentReportID: string | undefined) => {
        const currentRoute = navigationRef.getCurrentRoute();
        const topmostReportIDInSearchRHP = Navigation.getTopmostSearchReportID();
        const isTopmostSearchReportID = reportIDFromRoute === topmostReportIDInSearchRHP;
        const isHoldScreenOpenInRHP = currentRoute?.name === SCREENS.MONEY_REQUEST.HOLD && (route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT ? isTopmostSearchReportID : isTopMostReportId);
        const isReportDetailOpenInRHP =
            isTopMostReportId &&
            reportDetailScreens.find((r) => r === currentRoute?.name) &&
            !!currentRoute?.params &&
            typeof currentRoute.params === 'object' &&
            'reportID' in currentRoute.params &&
            reportIDFromRoute === currentRoute.params.reportID;
        // Early return if the report we're passing isn't in a focused state. We only want to navigate to Concierge if the user leaves the room from another device or gets removed from the room while the report is in a focused state.
        // Prevent auto navigation for report in RHP
        if ((!isFocused && !isHoldScreenOpenInRHP && !isReportDetailOpenInRHP) || (!isHoldScreenOpenInRHP && isInNarrowPaneModal)) {
            return;
        }
        Navigation.dismissModal();
        if (Navigation.getTopmostReportId() === prevOnyxReportID) {
            Navigation.isNavigationReady().then(() => {
                Navigation.popToSidebar();
            });
        }
        if (prevParentReportID) {
            // Prevent navigation to the IOU/Expense Report if it is pending deletion.
            if (isMoneyRequestReportPendingDeletion(prevParentReportID)) {
                return;
            }
            Navigation.isNavigationReady().then(() => {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(prevParentReportID));
            });
            return;
        }

        Navigation.isNavigationReady().then(() => {
            navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, false);
        });
    });

    // Navigate on removal
    useEffect(() => {
        // We don't want this effect to run on the first render.
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
                // Own workspace chats are excluded: a vacation delegate split sends a temporary
                // Onyx SET that wipes the report — the chat was never intentionally removed.
                // See issue #84248.
                (isPolicyExpenseChat(prevReport) && !prevReport?.isOwnPolicyExpenseChat) ||
                isGroupChat(prevReport) ||
                isAdminRoom(prevReport) ||
                isAnnounceRoom(prevReport));
        const didReportClose = wasReportRemoved && prevReport.statusNum === CONST.REPORT.STATUS_NUM.OPEN && report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;
        const isTopLevelPolicyRoomWithNoStatus = !report?.statusNum && !prevReport?.parentReportID && prevReport?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_ROOM;
        const isClosedTopLevelPolicyRoom = wasReportRemoved && prevReport.statusNum === CONST.REPORT.STATUS_NUM.OPEN && isTopLevelPolicyRoomWithNoStatus;
        // Navigate to the Concierge chat if the room was removed from another device (e.g. user leaving a room or removed from a room)
        if (
            // non-optimistic case
            (!prevUserLeavingStatus && !!userLeavingStatus) ||
            didReportClose ||
            isRemovalExpectedForReportType ||
            isClosedTopLevelPolicyRoom ||
            (prevDeletedParentAction && !deletedParentAction)
        ) {
            navigateAwayFromReport(prevOnyxReportID, prevReport?.parentReportID);
            return;
        }

        // If you already have a report open and are deeplinking to a new report on native,
        // the ReportScreen never actually unmounts and the reportID in the route also doesn't change.
        // Therefore, we need to compare if the existing reportID is the same as the one in the route
        // before deciding that we shouldn't call OpenReport.
        if (reportIDFromRoute === lastReportIDFromRoute && (!onyxReportID || onyxReportID === reportIDFromRoute)) {
            return;
        }

        setShouldShowComposeInput(true);
    }, [
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

    // Navigate on deletion
    useEffect(() => {
        if (!reportWasDeleted) {
            return;
        }

        // Only redirect if focused
        if (!isFocused) {
            return;
        }

        // For own workspace chats, a vacation delegate split sends a temporary Onyx SET that
        // silently wipes the report from Onyx — triggering this effect. We skip navigation here
        // entirely: the re-fetch effect in ReportFetchHandler restores the data, which causes
        // useReportWasDeleted to reset wasDeleted → false, and this effect exits early on the
        // next run. Genuine workspace deletions (e.g. user removed, workspace closed) always
        // trigger the "navigate on removal" effect above via userLeavingStatus / didReportClose,
        // never via this path alone. See issue #84248.
        if (isCurrentRouteOwnWorkspaceChatRef.current) {
            return;
        }

        // Try to navigate to parent report if available
        if (deletedReportParentID && !isMoneyRequestReportPendingDeletion(deletedReportParentID)) {
            Navigation.isNavigationReady().then(() => {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(deletedReportParentID));
            });
            return;
        }

        // Fallback to Concierge
        Navigation.isNavigationReady().then(() => {
            navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas);
        });
    }, [reportWasDeleted, isFocused, deletedReportParentID, conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas]);

    return null;
}

ReportNavigateAwayHandler.displayName = 'ReportNavigateAwayHandler';

export default ReportNavigateAwayHandler;
