import {useIsFocused, useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {getFilteredReportActionsForReportView, isDeletedParentAction, isReportActionVisible, isWhisperAction} from '@libs/ReportActionsUtils';
import {
    canUserPerformWriteAction,
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
 * Owns not-found/deletion/linking logic. Renders FullPageNotFoundView or children.
 * Subscribes to its own data internally via useRoute().
 */
// eslint-disable-next-line rulesdir/no-negated-variables
function ReportNotFoundGuard({children}: ReportNotFoundGuardProps) {
    const styles = useThemeStyles();
    const route = useRoute();
    const routeParams = route.params as {reportID?: string; reportActionID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);
    const reportActionIDFromRoute = routeParams?.reportActionID;

    const isFocused = useIsFocused();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [firstRender, setFirstRender] = useState(true);
    const [isLinkingToMessage, setIsLinkingToMessage] = useState(!!reportActionIDFromRoute);
    const [isNavigatingToDeletedAction, setIsNavigatingToDeletedAction] = useState(false);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [parentReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.parentReportID}`);
    const [userLeavingStatus = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportIDFromRoute}`);
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
    const [deleteTransactionNavigateBackUrl] = useOnyx(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL);

    const parentReportAction = useParentReportAction(report);
    const deletedParentAction = isDeletedParentAction(parentReportAction);
    const prevDeletedParentAction = usePrevious(deletedParentAction);

    const reportID = report?.reportID;
    const prevReport = usePrevious(report);
    const prevUserLeavingStatus = usePrevious(userLeavingStatus);
    const lastReportIDFromRoute = usePrevious(reportIDFromRoute);

    const {reportActions: unfilteredReportActions, linkedAction, sortedAllReportActions} = usePaginatedReportActions(reportID, reportActionIDFromRoute);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const isOptimisticDelete = report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;
    const {wasDeleted: reportWasDeleted, parentReportID: deletedReportParentID} = useReportWasDeleted(reportIDFromRoute, report, isOptimisticDelete, userLeavingStatus);

    const isReportArchived = useReportIsArchived(report?.reportID);
    const {isEditingDisabled} = useIsReportReadyToDisplay(report, reportIDFromRoute, isReportArchived);

    // --- Linked action status ---
    const isLinkedActionDeleted = useMemo(() => {
        if (!linkedAction) {
            return false;
        }
        const actionReportID = linkedAction.reportID ?? reportID;
        if (!actionReportID) {
            return true;
        }
        return !isReportActionVisible(linkedAction, actionReportID, canUserPerformWriteAction(report, isReportArchived), visibleReportActionsData);
    }, [linkedAction, report, isReportArchived, reportID, visibleReportActionsData]);

    const prevIsLinkedActionDeleted = usePrevious(linkedAction ? isLinkedActionDeleted : undefined);
    const lastReportActionIDFromRoute = usePrevious(!firstRender ? reportActionIDFromRoute : undefined);

    const isLinkedActionInaccessibleWhisper = useMemo(
        () => !!linkedAction && isWhisperAction(linkedAction) && !(linkedAction?.whisperedToAccountIDs ?? []).includes(currentUserAccountID),
        [currentUserAccountID, linkedAction],
    );

    // --- Parent action deletion status ---
    const {isParentActionMissingAfterLoad, isParentActionDeleted} = getParentReportActionDeletionStatus({
        parentReportID: report?.parentReportID,
        parentReportActionID: report?.parentReportActionID,
        parentReportAction,
        parentReportMetadata,
        isOffline,
    });
    const isDeletedTransactionThread = isReportTransactionThread(report) && (isParentActionDeleted || isParentActionMissingAfterLoad);

    // --- Not found derivation ---
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundLinkedAction =
        (!isLinkedActionInaccessibleWhisper && isLinkedActionDeleted && isNavigatingToDeletedAction) ||
        (!reportMetadata?.isLoadingInitialReportActions &&
            !!reportActionIDFromRoute &&
            !!sortedAllReportActions &&
            sortedAllReportActions?.length > 0 &&
            reportActions.length === 0 &&
            !isLinkingToMessage);

    const currentReportIDFormRoute = (route.params as {reportID?: string} | undefined)?.reportID;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo((): boolean => {
        const isInvalidReportPath = !!currentReportIDFormRoute && !isValidReportIDFromPath(currentReportIDFormRoute);
        const isLoading = isLoadingApp !== false || isLoadingReportData || !!reportMetadata?.isLoadingInitialReportActions;
        const reportExists = !!reportID || (!isDeletedTransactionThread && isOptimisticDelete) || userLeavingStatus;

        if (shouldShowNotFoundLinkedAction) {
            return true;
        }
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
        shouldShowNotFoundLinkedAction,
        isLoadingApp,
        isLoadingReportData,
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

    // --- Reset isLinkingToMessage ---
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            setIsLinkingToMessage(false);
        });
    }, [reportMetadata?.isLoadingInitialReportActions]);

    // --- Handle deleted linked action ---
    useEffect(() => {
        if (!isLinkedActionDeleted) {
            setIsNavigatingToDeletedAction(false);
            return;
        }
        if (lastReportActionIDFromRoute !== reportActionIDFromRoute) {
            setIsNavigatingToDeletedAction(true);
            return;
        }
        if (!isNavigatingToDeletedAction && prevIsLinkedActionDeleted === false) {
            Navigation.setParams({reportActionID: ''});
        }
    }, [isLinkedActionDeleted, prevIsLinkedActionDeleted, lastReportActionIDFromRoute, reportActionIDFromRoute, isNavigatingToDeletedAction]);

    // --- Handle inaccessible whisper ---
    useEffect(() => {
        if (!isLinkedActionInaccessibleWhisper) {
            return;
        }
        Navigation.isNavigationReady().then(() => {
            Navigation.setParams({reportActionID: ''});
        });
    }, [isLinkedActionInaccessibleWhisper]);

    // --- Task report init ---
    useEffect(() => {
        if (!!report?.lastReadTime || !isTaskReport(report)) {
            return;
        }
        readNewestAction(report?.reportID, !!reportMetadata?.hasOnceLoadedReportActions);
    }, [report, reportMetadata?.hasOnceLoadedReportActions]);

    const navigateToEndOfReport = useCallback(() => {
        Navigation.setParams({reportActionID: ''});
    }, []);

    const lastRoute = usePrevious(route);

    // Render-time guard: prevent flash while linking state syncs
    if ((lastRoute !== route || lastReportActionIDFromRoute !== reportActionIDFromRoute) && isLinkingToMessage !== !!reportActionIDFromRoute) {
        setIsLinkingToMessage(!!reportActionIDFromRoute);
        return null;
    }

    return (
        <FullPageNotFoundView
            shouldShow={shouldShowNotFoundPage}
            subtitleKey={shouldShowNotFoundLinkedAction ? 'notFound.commentYouLookingForCannotBeFound' : 'notFound.noAccess'}
            subtitleStyle={[styles.textSupporting]}
            shouldShowBackButton={shouldUseNarrowLayout}
            onBackButtonPress={shouldShowNotFoundLinkedAction ? navigateToEndOfReport : Navigation.goBack}
            shouldShowLink={shouldShowNotFoundLinkedAction}
            linkTranslationKey="notFound.goToChatInstead"
            subtitleKeyBelowLink={shouldShowNotFoundLinkedAction ? 'notFound.contactConcierge' : ''}
            onLinkPress={navigateToEndOfReport}
            shouldDisplaySearchRouter
        >
            <DragAndDropProvider isDisabled={isEditingDisabled}>{children}</DragAndDropProvider>
        </FullPageNotFoundView>
    );
}

export default ReportNotFoundGuard;
