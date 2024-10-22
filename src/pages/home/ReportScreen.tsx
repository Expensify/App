import {PortalHost} from '@gorhom/portal';
import {useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {FlatList, ViewStyle} from 'react-native';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Banner from '@components/Banner';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import TaskHeaderActionButton from '@components/TaskHeaderActionButton';
import type {CurrentReportIDContextValue} from '@components/withCurrentReportID';
import withCurrentReportID from '@components/withCurrentReportID';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useAppFocusEvent from '@hooks/useAppFocusEvent';
import useDeepCompareRef from '@hooks/useDeepCompareRef';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import Timing from '@libs/actions/Timing';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import clearReportNotifications from '@libs/Notification/clearReportNotifications';
import Performance from '@libs/Performance';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import shouldFetchReport from '@libs/shouldFetchReport';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {AuthScreensParamList} from '@navigation/types';
import * as ComposerActions from '@userActions/Composer';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import HeaderView from './HeaderView';
import ReportActionsListItemRenderer from './report/ReportActionsListItemRenderer';
import ReportActionsView from './report/ReportActionsView';
import ReportFooter from './report/ReportFooter';
import type {ActionListContextType, ReactionListRef, ScrollPosition} from './ReportScreenContext';
import {ActionListContext, ReactionListContext} from './ReportScreenContext';

type ReportScreenNavigationProps = StackScreenProps<AuthScreensParamList, typeof SCREENS.REPORT>;

type ReportScreenProps = CurrentReportIDContextValue & ReportScreenNavigationProps;

const defaultReportMetadata = {
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
};

/** Get the currently viewed report ID as number */
function getReportID(route: ReportScreenNavigationProps['route']): string {
    // The report ID is used in an onyx key. If it's an empty string, onyx will return
    // a collection instead of an individual report.
    return String(route.params?.reportID || 0);
}

/**
 * Check is the report is deleted.
 * We currently use useMemo to memorize every properties of the report
 * so we can't check using isEmpty.
 *
 * @param report
 */
function isEmpty(report: OnyxEntry<OnyxTypes.Report>): boolean {
    if (isEmptyObject(report)) {
        return true;
    }
    return !Object.values(report).some((value) => value !== undefined && value !== '');
}

function getParentReportAction(parentReportActions: OnyxEntry<OnyxTypes.ReportActions>, parentReportActionID: string | undefined): OnyxEntry<OnyxTypes.ReportAction> {
    if (!parentReportActions || !parentReportActionID) {
        return;
    }
    return parentReportActions[parentReportActionID ?? '0'];
}

function ReportScreen({route, currentReportID = '', navigation}: ReportScreenProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const reportIDFromRoute = getReportID(route);
    const reportActionIDFromRoute = route?.params?.reportActionID ?? '';
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    const firstRenderRef = useRef(true);
    const flatListRef = useRef<FlatList>(null);
    const {canUseDefaultRooms} = usePermissions();
    const reactionListRef = useRef<ReactionListRef>(null);
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
    const {activeWorkspaceID} = useActiveWorkspace();

    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const [isComposerFullSize] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportIDFromRoute}`, {initialValue: false});
    const [accountManagerReportID] = useOnyx(ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID, {initialValue: ''});
    const [userLeavingStatus] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportIDFromRoute}`, {initialValue: false});
    const [reportOnyx, reportResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`, {allowStaleData: true});
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {initialValue: defaultReportMetadata});
    const [isSidebarLoaded] = useOnyx(ONYXKEYS.IS_SIDEBAR_LOADED, {initialValue: false});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {allowStaleData: true, initialValue: {}});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportOnyx?.parentReportID || -1}`, {
        canEvict: false,
        selector: (parentReportActions) => getParentReportAction(parentReportActions, reportOnyx?.parentReportActionID ?? ''),
    });
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [workspaceTooltip] = useOnyx(ONYXKEYS.NVP_WORKSPACE_TOOLTIP);
    const wasLoadingApp = usePrevious(isLoadingApp);
    const finishedLoadingApp = wasLoadingApp && !isLoadingApp;
    const isDeletedParentAction = ReportActionsUtils.isDeletedParentAction(parentReportAction);
    const prevIsDeletedParentAction = usePrevious(isDeletedParentAction);

    const isLoadingReportOnyx = isLoadingOnyxValue(reportResult);
    const permissions = useDeepCompareRef(reportOnyx?.permissions);

    useEffect(() => {
        // Don't update if there is a reportID in the params already
        if (route.params.reportID) {
            const reportActionID = route?.params?.reportActionID;
            const isValidReportActionID = ValidationUtils.isNumeric(reportActionID);
            if (reportActionID && !isValidReportActionID) {
                navigation.setParams({reportActionID: ''});
            }
            return;
        }

        const lastAccessedReportID = ReportUtils.findLastAccessedReport(!canUseDefaultRooms, !!route.params.openOnAdminRoom, activeWorkspaceID)?.reportID;

        // It's possible that reports aren't fully loaded yet
        // in that case the reportID is undefined
        if (!lastAccessedReportID) {
            return;
        }

        Log.info(`[ReportScreen] no reportID found in params, setting it to lastAccessedReportID: ${lastAccessedReportID}`);
        navigation.setParams({reportID: lastAccessedReportID});
    }, [activeWorkspaceID, canUseDefaultRooms, navigation, route, finishedLoadingApp]);

    /**
     * Create a lightweight Report so as to keep the re-rendering as light as possible by
     * passing in only the required props.
     *
     * Also, this plays nicely in contrast with Onyx,
     * which creates a new object every time collection changes. Because of this we can't
     * put this into onyx selector as it will be the same.
     */
    const report = useMemo(
        (): OnyxEntry<OnyxTypes.Report> =>
            reportOnyx && {
                lastReadTime: reportOnyx.lastReadTime,
                reportID: reportOnyx.reportID ?? '',
                policyID: reportOnyx.policyID,
                lastVisibleActionCreated: reportOnyx.lastVisibleActionCreated,
                statusNum: reportOnyx.statusNum,
                stateNum: reportOnyx.stateNum,
                writeCapability: reportOnyx.writeCapability,
                type: reportOnyx.type,
                errorFields: reportOnyx.errorFields,
                isPolicyExpenseChat: reportOnyx.isPolicyExpenseChat,
                parentReportID: reportOnyx.parentReportID,
                parentReportActionID: reportOnyx.parentReportActionID,
                chatType: reportOnyx.chatType,
                pendingFields: reportOnyx.pendingFields,
                isDeletedParentAction: reportOnyx.isDeletedParentAction,
                reportName: reportOnyx.reportName,
                description: reportOnyx.description,
                managerID: reportOnyx.managerID,
                total: reportOnyx.total,
                nonReimbursableTotal: reportOnyx.nonReimbursableTotal,
                fieldList: reportOnyx.fieldList,
                ownerAccountID: reportOnyx.ownerAccountID,
                currency: reportOnyx.currency,
                unheldTotal: reportOnyx.unheldTotal,
                participants: reportOnyx.participants,
                isWaitingOnBankAccount: reportOnyx.isWaitingOnBankAccount,
                iouReportID: reportOnyx.iouReportID,
                isOwnPolicyExpenseChat: reportOnyx.isOwnPolicyExpenseChat,
                isPinned: reportOnyx.isPinned,
                chatReportID: reportOnyx.chatReportID,
                visibility: reportOnyx.visibility,
                oldPolicyName: reportOnyx.oldPolicyName,
                policyName: reportOnyx.policyName,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                private_isArchived: reportOnyx.private_isArchived,
                isOptimisticReport: reportOnyx.isOptimisticReport,
                lastMentionedTime: reportOnyx.lastMentionedTime,
                avatarUrl: reportOnyx.avatarUrl,
                avatarFileName: reportOnyx.avatarFileName,
                permissions,
                invoiceReceiver: reportOnyx.invoiceReceiver,
                policyAvatar: reportOnyx.policyAvatar,
                pendingChatMembers: reportOnyx.pendingChatMembers,
            },
        [reportOnyx, permissions],
    );
    const reportID = report?.reportID;

    const prevReport = usePrevious(report);
    const prevUserLeavingStatus = usePrevious(userLeavingStatus);
    const [isLinkingToMessage, setIsLinkingToMessage] = useState(!!reportActionIDFromRoute);

    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: (value) => value?.accountID});
    const {reportActions, linkedAction, sortedAllReportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID, reportActionIDFromRoute);

    const [isBannerVisible, setIsBannerVisible] = useState(true);
    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({});

    const wasReportAccessibleRef = useRef(false);
    if (firstRenderRef.current) {
        Timing.start(CONST.TIMING.CHAT_RENDER);
        Performance.markStart(CONST.TIMING.CHAT_RENDER);
    }
    const [isComposerFocus, setIsComposerFocus] = useState(false);
    const shouldAdjustScrollView = useMemo(() => isComposerFocus && !modal?.willAlertModalBecomeVisible, [isComposerFocus, modal]);
    const viewportOffsetTop = useViewportOffsetTop(shouldAdjustScrollView);

    const {reportPendingAction, reportErrors} = ReportUtils.getReportOfflinePendingActionAndErrors(report);
    const screenWrapperStyle: ViewStyle[] = [styles.appContent, styles.flex1, {marginTop: viewportOffsetTop}];
    const isEmptyChat = useMemo(() => ReportUtils.isEmptyReport(report), [report]);
    const isOptimisticDelete = report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;
    const indexOfLinkedMessage = useMemo(
        (): number => reportActions.findIndex((obj) => String(obj.reportActionID) === String(reportActionIDFromRoute)),
        [reportActions, reportActionIDFromRoute],
    );

    const isPendingActionExist = !!reportActions.at(0)?.pendingAction;
    const doesCreatedActionExists = useCallback(() => !!sortedAllReportActions?.findLast((action) => ReportActionsUtils.isCreatedAction(action)), [sortedAllReportActions]);
    const isLinkedMessageAvailable = useMemo(() => indexOfLinkedMessage > -1, [indexOfLinkedMessage]);

    // The linked report actions should have at least 15 messages (counting as 1 page) above them to fill the screen.
    // If the count is too high (equal to or exceeds the web pagination size / 50) and there are no cached messages in the report,
    // OpenReport will be called each time the user scrolls up the report a bit, clicks on report preview, and then goes back."
    const isLinkedMessagePageReady = isLinkedMessageAvailable && (reportActions.length - indexOfLinkedMessage >= CONST.REPORT.MIN_INITIAL_REPORT_ACTION_COUNT || doesCreatedActionExists());

    // If there's a non-404 error for the report we should show it instead of blocking the screen
    const hasHelpfulErrors = Object.keys(report?.errorFields ?? {}).some((key) => key !== 'notFound');
    const shouldHideReport = !hasHelpfulErrors && !ReportUtils.canAccessReport(report, policies, betas);

    const transactionThreadReportID = ReportActionsUtils.getOneTransactionThreadReportID(reportID ?? '', reportActions ?? [], isOffline);
    const [transactionThreadReportActions = {}] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`);
    const combinedReportActions = ReportActionsUtils.getCombinedReportActions(reportActions, transactionThreadReportID ?? null, Object.values(transactionThreadReportActions));
    const lastReportAction = [...combinedReportActions, parentReportAction].find((action) => ReportUtils.canEditReportAction(action) && !ReportActionsUtils.isMoneyRequestAction(action));
    const isSingleTransactionView = ReportUtils.isMoneyRequest(report) || ReportUtils.isTrackExpenseReport(report);
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID ?? '-1'}`];
    const isTopMostReportId = currentReportID === reportIDFromRoute;
    const didSubscribeToReportLeavingEvents = useRef(false);

    useEffect(() => {
        if (!report?.reportID || shouldHideReport) {
            wasReportAccessibleRef.current = false;
            return;
        }
        wasReportAccessibleRef.current = true;
    }, [shouldHideReport, report]);

    const onBackButtonPress = useCallback(() => {
        if (isInNarrowPaneModal) {
            Navigation.dismissModal();
            return;
        }
        Navigation.goBack(undefined, false, true);
    }, [isInNarrowPaneModal]);

    let headerView = (
        <HeaderView
            reportID={reportIDFromRoute}
            onNavigationMenuButtonClicked={onBackButtonPress}
            report={report}
            parentReportAction={parentReportAction}
            shouldUseNarrowLayout={shouldUseNarrowLayout}
        />
    );

    if (isSingleTransactionView) {
        headerView = (
            <MoneyRequestHeader
                report={report}
                policy={policy}
                parentReportAction={parentReportAction}
                onBackButtonPress={onBackButtonPress}
            />
        );
    }

    useEffect(() => {
        if (!transactionThreadReportID || !route?.params?.reportActionID || !ReportUtils.isOneTransactionThread(linkedAction?.childReportID ?? '-1', reportID ?? '', linkedAction)) {
            return;
        }
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(route?.params?.reportID));
    }, [transactionThreadReportID, route?.params?.reportActionID, route?.params?.reportID, linkedAction, reportID]);

    if (ReportUtils.isMoneyRequestReport(report) || ReportUtils.isInvoiceReport(report)) {
        headerView = (
            <MoneyReportHeader
                report={report}
                policy={policy}
                transactionThreadReportID={transactionThreadReportID}
                reportActions={reportActions}
                onBackButtonPress={onBackButtonPress}
            />
        );
    }

    /**
     * When false the ReportActionsView will completely unmount and we will show a loader until it returns true.
     */
    const isCurrentReportLoadedFromOnyx = useMemo((): boolean => {
        // This is necessary so that when we are retrieving the next report data from Onyx the ReportActionsView will remount completely
        const isTransitioning = report && report?.reportID !== reportIDFromRoute;
        return reportIDFromRoute !== '' && !!report?.reportID && !isTransitioning;
    }, [report, reportIDFromRoute]);

    const isInitialPageReady = isOffline
        ? reportActions.length > 0
        : reportActions.length >= CONST.REPORT.MIN_INITIAL_REPORT_ACTION_COUNT || isPendingActionExist || (doesCreatedActionExists() && reportActions.length > 0);

    const isLinkedActionDeleted = useMemo(() => !!linkedAction && !ReportActionsUtils.shouldReportActionBeVisible(linkedAction, linkedAction.reportActionID), [linkedAction]);
    const prevIsLinkedActionDeleted = usePrevious(linkedAction ? isLinkedActionDeleted : undefined);
    const isLinkedActionInaccessibleWhisper = useMemo(
        () => !!linkedAction && ReportActionsUtils.isWhisperAction(linkedAction) && !(linkedAction?.whisperedToAccountIDs ?? []).includes(currentUserAccountID),
        [currentUserAccountID, linkedAction],
    );

    const isLoading = isLoadingApp ?? (!reportIDFromRoute || (!isSidebarLoaded && !isInNarrowPaneModal) || PersonalDetailsUtils.isPersonalDetailsEmpty());
    const shouldShowSkeleton =
        (isLinkingToMessage && !isLinkedMessagePageReady) ||
        (!isLinkingToMessage && !isInitialPageReady) ||
        isEmptyObject(reportOnyx) ||
        isLoadingReportOnyx ||
        !isCurrentReportLoadedFromOnyx ||
        isLoading;

    const isLinkedActionBecomesDeleted = prevIsLinkedActionDeleted !== undefined && !prevIsLinkedActionDeleted && isLinkedActionDeleted;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundLinkedAction =
        (!isLinkedActionInaccessibleWhisper && isLinkedActionDeleted && !isLinkedActionBecomesDeleted) ||
        (shouldShowSkeleton &&
            !reportMetadata.isLoadingInitialReportActions &&
            !!reportActionIDFromRoute &&
            !!sortedAllReportActions &&
            sortedAllReportActions?.length > 0 &&
            reportActions.length === 0 &&
            !isLinkingToMessage);

    const currentReportIDFormRoute = route.params?.reportID;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo((): boolean => {
        if (shouldShowNotFoundLinkedAction) {
            return true;
        }

        // Wait until we're sure the app is done loading (needs to be a strict equality check since it's undefined initially)
        if (isLoadingApp !== false) {
            return false;
        }

        // If we just finished loading the app, we still need to try fetching the report. Wait until that's done before
        // showing the Not Found page
        if (finishedLoadingApp) {
            return false;
        }

        if (!wasReportAccessibleRef.current && !firstRenderRef.current && !reportID && !isOptimisticDelete && !reportMetadata?.isLoadingInitialReportActions && !userLeavingStatus) {
            return true;
        }

        if (shouldHideReport) {
            return true;
        }
        return !!currentReportIDFormRoute && !ReportUtils.isValidReportIDFromPath(currentReportIDFormRoute);
    }, [
        shouldShowNotFoundLinkedAction,
        isLoadingApp,
        finishedLoadingApp,
        reportID,
        isOptimisticDelete,
        reportMetadata?.isLoadingInitialReportActions,
        userLeavingStatus,
        shouldHideReport,
        currentReportIDFormRoute,
    ]);

    const fetchReport = useCallback(() => {
        Report.openReport(reportIDFromRoute, reportActionIDFromRoute);
    }, [reportIDFromRoute, reportActionIDFromRoute]);

    useEffect(() => {
        if (!reportID || !isFocused) {
            return;
        }
        Report.updateLastVisitTime(reportID);
    }, [reportID, isFocused]);

    const fetchReportIfNeeded = useCallback(() => {
        // Report ID will be empty when the reports collection is empty.
        // This could happen when we are loading the collection for the first time after logging in.
        if (!ReportUtils.isValidReportIDFromPath(reportIDFromRoute)) {
            return;
        }

        /**
         * Since OpenReport is a write, the response from OpenReport will get dropped while the app is
         * still loading. This usually happens when signing in and deeplinking to a report. Instead,
         * we'll fetch the report after the app finishes loading.
         *
         * This needs to be a strict equality check since isLoadingApp is initially undefined until the
         * value is loaded from Onyx
         */
        if (isLoadingApp !== false) {
            return;
        }

        if (!shouldFetchReport(report) && (isInitialPageReady || isLinkedMessagePageReady)) {
            return;
        }

        fetchReport();
    }, [report, fetchReport, reportIDFromRoute, isLoadingApp, isInitialPageReady, isLinkedMessagePageReady]);

    const dismissBanner = useCallback(() => {
        setIsBannerVisible(false);
    }, []);

    const chatWithAccountManager = useCallback(() => {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(accountManagerReportID ?? ''));
    }, [accountManagerReportID]);

    // Clear notifications for the current report when it's opened and re-focused
    const clearNotifications = useCallback(() => {
        // Check if this is the top-most ReportScreen since the Navigator preserves multiple at a time
        if (!isTopMostReportId) {
            return;
        }

        clearReportNotifications(reportID ?? '');
    }, [reportID, isTopMostReportId]);

    useEffect(clearNotifications, [clearNotifications]);
    useAppFocusEvent(clearNotifications);

    useEffect(() => {
        Timing.end(CONST.TIMING.CHAT_RENDER);
        Performance.markEnd(CONST.TIMING.CHAT_RENDER);

        const interactionTask = InteractionManager.runAfterInteractions(() => {
            ComposerActions.setShouldShowComposeInput(true);
        });
        return () => {
            interactionTask.cancel();
            if (!didSubscribeToReportLeavingEvents.current) {
                return;
            }

            Report.unsubscribeFromLeavingRoomReportChannel(reportID ?? '');
        };

        // I'm disabling the warning, as it expects to use exhaustive deps, even though we want this useEffect to run only on the first render.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Call OpenReport only if we are not linking to a message or the report is not available yet
        if (isLoadingReportOnyx || reportActionIDFromRoute) {
            return;
        }
        fetchReportIfNeeded();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isLoadingReportOnyx]);

    useEffect(() => {
        if (isLoadingReportOnyx || !reportActionIDFromRoute || isLinkedMessagePageReady) {
            return;
        }

        // This function is triggered when a user clicks on a link to navigate to a report.
        // For each link click, we retrieve the report data again, even though it may already be cached.
        // There should be only one openReport execution per page start or navigating
        fetchReportIfNeeded();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [route, isLinkedMessagePageReady, isLoadingReportOnyx, reportActionIDFromRoute]);

    // If a user has chosen to leave a thread, and then returns to it (e.g. with the back button), we need to call `openReport` again in order to allow the user to rejoin and to receive real-time updates
    useEffect(() => {
        if (
            !shouldUseNarrowLayout ||
            !isFocused ||
            prevIsFocused ||
            !ReportUtils.isChatThread(report) ||
            ReportUtils.getReportNotificationPreference(report) !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN ||
            isSingleTransactionView
        ) {
            return;
        }
        Report.openReport(reportID ?? '');

        // We don't want to run this useEffect every time `report` is changed
        // Excluding shouldUseNarrowLayout from the dependency list to prevent re-triggering on screen resize events.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [prevIsFocused, report?.participants, isFocused, isSingleTransactionView, reportID]);

    useEffect(() => {
        // We don't want this effect to run on the first render.
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }

        const onyxReportID = report?.reportID;
        const prevOnyxReportID = prevReport?.reportID;
        const wasReportRemoved = !!prevOnyxReportID && prevOnyxReportID === reportIDFromRoute && !onyxReportID;
        const isRemovalExpectedForReportType =
            isEmpty(report) &&
            (ReportUtils.isMoneyRequest(prevReport) || ReportUtils.isMoneyRequestReport(prevReport) || ReportUtils.isPolicyExpenseChat(prevReport) || ReportUtils.isGroupChat(prevReport));
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
            (prevIsDeletedParentAction && !isDeletedParentAction)
        ) {
            // Early return if the report we're passing isn't in a focused state. We only want to navigate to Concierge if the user leaves the room from another device or gets removed from the room while the report is in a focused state.
            // Prevent auto navigation for report in RHP
            if (!isFocused || isInNarrowPaneModal) {
                return;
            }
            Navigation.dismissModal();
            if (Navigation.getTopmostReportId() === prevOnyxReportID) {
                Navigation.setShouldPopAllStateOnUP(true);
                Navigation.goBack(undefined, false, true);
            }
            if (prevReport?.parentReportID) {
                // Prevent navigation to the IOU/Expense Report if it is pending deletion.
                if (ReportUtils.isMoneyRequestReportPendingDeletion(prevReport.parentReportID)) {
                    return;
                }
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(prevReport.parentReportID));
                return;
            }

            Report.navigateToConciergeChat();
            return;
        }

        // If you already have a report open and are deeplinking to a new report on native,
        // the ReportScreen never actually unmounts and the reportID in the route also doesn't change.
        // Therefore, we need to compare if the existing reportID is the same as the one in the route
        // before deciding that we shouldn't call OpenReport.
        if (onyxReportID === prevReport?.reportID && (!onyxReportID || onyxReportID === reportIDFromRoute)) {
            return;
        }

        fetchReportIfNeeded();
        ComposerActions.setShouldShowComposeInput(true);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [
        route,
        report,
        // errors,
        fetchReportIfNeeded,
        prevReport?.reportID,
        prevUserLeavingStatus,
        userLeavingStatus,
        prevReport?.statusNum,
        prevReport?.parentReportID,
        prevReport?.chatType,
        prevReport,
        reportIDFromRoute,
        isFocused,
        isDeletedParentAction,
        prevIsDeletedParentAction,
    ]);

    useEffect(() => {
        if (!ReportUtils.isValidReportIDFromPath(reportIDFromRoute)) {
            return;
        }
        // Ensures the optimistic report is created successfully
        if (reportIDFromRoute !== report?.reportID) {
            return;
        }
        // Ensures subscription event succeeds when the report/workspace room is created optimistically.
        // Check if the optimistic `OpenReport` or `AddWorkspaceRoom` has succeeded by confirming
        // any `pendingFields.createChat` or `pendingFields.addWorkspaceRoom` fields are set to null.
        // Existing reports created will have empty fields for `pendingFields`.
        const didCreateReportSuccessfully = !report?.pendingFields || (!report?.pendingFields.addWorkspaceRoom && !report?.pendingFields.createChat);
        let interactionTask: ReturnType<typeof InteractionManager.runAfterInteractions> | null = null;
        if (!didSubscribeToReportLeavingEvents.current && didCreateReportSuccessfully) {
            interactionTask = InteractionManager.runAfterInteractions(() => {
                Report.subscribeToReportLeavingEvents(reportIDFromRoute);
                didSubscribeToReportLeavingEvents.current = true;
            });
        }
        return () => {
            if (!interactionTask) {
                return;
            }
            interactionTask.cancel();
        };
    }, [report, didSubscribeToReportLeavingEvents, reportIDFromRoute]);

    const actionListValue = useMemo((): ActionListContextType => ({flatListRef, scrollPosition, setScrollPosition}), [flatListRef, scrollPosition, setScrollPosition]);

    // This helps in tracking from the moment 'route' triggers useMemo until isLoadingInitialReportActions becomes true. It prevents blinking when loading reportActions from cache.
    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            setIsLinkingToMessage(false);
        });
    }, [reportMetadata?.isLoadingInitialReportActions]);

    // If we deeplinked to the report after signing in, we need to fetch the report after the app is done loading
    useEffect(() => {
        if (!finishedLoadingApp) {
            return;
        }

        fetchReportIfNeeded();

        // This should only run once when the app is done loading
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [finishedLoadingApp]);

    const navigateToEndOfReport = useCallback(() => {
        Navigation.setParams({reportActionID: ''});
        fetchReport();
    }, [fetchReport]);

    useEffect(() => {
        // If the linked action is previously available but now deleted,
        // remove the reportActionID from the params to not link to the deleted action.
        if (!isLinkedActionBecomesDeleted) {
            return;
        }
        Navigation.setParams({reportActionID: ''});
    }, [isLinkedActionBecomesDeleted]);

    // If user redirects to an inaccessible whisper via a deeplink, on a report they have access to,
    // then we set reportActionID as empty string, so we display them the report and not the "Not found page".
    useEffect(() => {
        if (!isLinkedActionInaccessibleWhisper) {
            return;
        }
        Navigation.isNavigationReady().then(() => {
            Navigation.setParams({reportActionID: ''});
        });
    }, [isLinkedActionInaccessibleWhisper]);

    useEffect(() => {
        if (!!report?.lastReadTime || !ReportUtils.isTaskReport(report)) {
            return;
        }
        // After creating the task report then navigating to task detail we don't have any report actions and the last read time is empty so We need to update the initial last read time when opening the task report detail.
        Report.readNewestAction(report?.reportID ?? '');
    }, [report]);
    const mostRecentReportAction = reportActions.at(0);
    const isMostRecentReportIOU = mostRecentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU;
    const isSingleIOUReportAction = reportActions.filter((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU).length === 1;
    const isSingleExpenseReport = ReportUtils.isExpenseReport(report) && isMostRecentReportIOU && isSingleIOUReportAction;
    const isSingleInvoiceReport = ReportUtils.isInvoiceReport(report) && isMostRecentReportIOU && isSingleIOUReportAction;
    const shouldShowMostRecentReportAction =
        !!mostRecentReportAction &&
        !isSingleExpenseReport &&
        !isSingleInvoiceReport &&
        !ReportActionsUtils.isActionOfType(mostRecentReportAction, CONST.REPORT.ACTIONS.TYPE.CREATED) &&
        !ReportActionsUtils.isDeletedAction(mostRecentReportAction);

    const lastRoute = usePrevious(route);
    const lastReportActionIDFromRoute = usePrevious(reportActionIDFromRoute);

    // Define here because reportActions are recalculated before mount, allowing data to display faster than useEffect can trigger.
    // If we have cached reportActions, they will be shown immediately.
    // We aim to display a loader first, then fetch relevant reportActions, and finally show them.
    if ((lastRoute !== route || lastReportActionIDFromRoute !== reportActionIDFromRoute) && isLinkingToMessage !== !!reportActionIDFromRoute) {
        setIsLinkingToMessage(!!reportActionIDFromRoute);
        return null;
    }

    return (
        <ActionListContext.Provider value={actionListValue}>
            <ReactionListContext.Provider value={reactionListRef}>
                <ScreenWrapper
                    navigation={navigation}
                    style={screenWrapperStyle}
                    shouldEnableKeyboardAvoidingView={isTopMostReportId || isInNarrowPaneModal}
                    testID={`report-screen-${reportID ?? ''}`}
                >
                    <FullPageNotFoundView
                        shouldShow={shouldShowNotFoundPage}
                        subtitleKey={shouldShowNotFoundLinkedAction ? '' : 'notFound.noAccess'}
                        shouldShowBackButton={shouldUseNarrowLayout}
                        onBackButtonPress={shouldShowNotFoundLinkedAction ? navigateToEndOfReport : Navigation.goBack}
                        shouldShowLink={shouldShowNotFoundLinkedAction}
                        linkKey="notFound.noAccess"
                        onLinkPress={navigateToEndOfReport}
                    >
                        <OfflineWithFeedback
                            pendingAction={reportPendingAction}
                            errors={reportErrors}
                            shouldShowErrorMessages={false}
                            needsOffscreenAlphaCompositing
                        >
                            {headerView}
                            {report && ReportUtils.isTaskReport(report) && shouldUseNarrowLayout && ReportUtils.isOpenTaskReport(report, parentReportAction) && (
                                <View style={[styles.borderBottom]}>
                                    <View style={[styles.appBG, styles.pl0]}>
                                        <View style={[styles.ph5, styles.pb3]}>
                                            <TaskHeaderActionButton report={report} />
                                        </View>
                                    </View>
                                </View>
                            )}
                        </OfflineWithFeedback>
                        {!!accountManagerReportID && ReportUtils.isConciergeChatReport(report) && isBannerVisible && (
                            <Banner
                                containerStyles={[styles.mh4, styles.mt4, styles.p4, styles.bgDark]}
                                textStyles={[styles.colorReversed]}
                                text={translate('reportActionsView.chatWithAccountManager')}
                                onClose={dismissBanner}
                                onPress={chatWithAccountManager}
                                shouldShowCloseButton
                            />
                        )}
                        <DragAndDropProvider isDisabled={!isCurrentReportLoadedFromOnyx || !ReportUtils.canUserPerformWriteAction(report)}>
                            <View
                                style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                                testID="report-actions-view-wrapper"
                            >
                                {!shouldShowSkeleton && report && (
                                    <ReportActionsView
                                        reportActions={reportActions}
                                        hasNewerActions={hasNewerActions}
                                        hasOlderActions={hasOlderActions}
                                        report={report}
                                        parentReportAction={parentReportAction}
                                        isLoadingInitialReportActions={reportMetadata?.isLoadingInitialReportActions}
                                        isLoadingNewerReportActions={reportMetadata?.isLoadingNewerReportActions}
                                        hasLoadingNewerReportActionsError={reportMetadata?.hasLoadingNewerReportActionsError}
                                        isLoadingOlderReportActions={reportMetadata?.isLoadingOlderReportActions}
                                        hasLoadingOlderReportActionsError={reportMetadata?.hasLoadingOlderReportActionsError}
                                        transactionThreadReportID={transactionThreadReportID}
                                    />
                                )}

                                {/* Note: The ReportActionsSkeletonView should be allowed to mount even if the initial report actions are not loaded.
                                    If we prevent rendering the report while they are loading then
                                    we'll unnecessarily unmount the ReportActionsView which will clear the new marker lines initial state. */}
                                {shouldShowSkeleton && (
                                    <>
                                        <ReportActionsSkeletonView />
                                        {shouldShowMostRecentReportAction && (
                                            <ReportActionsListItemRenderer
                                                reportAction={mostRecentReportAction}
                                                reportActions={reportActions}
                                                parentReportAction={parentReportAction}
                                                parentReportActionForTransactionThread={undefined}
                                                transactionThreadReport={undefined}
                                                index={0}
                                                report={report}
                                                displayAsGroup={false}
                                                shouldHideThreadDividerLine
                                                shouldDisplayNewMarker={false}
                                                shouldDisplayReplyDivider={false}
                                                isFirstVisibleReportAction
                                                shouldUseThreadDividerLine={false}
                                            />
                                        )}
                                    </>
                                )}

                                {isCurrentReportLoadedFromOnyx ? (
                                    <ReportFooter
                                        onComposerFocus={() => setIsComposerFocus(true)}
                                        onComposerBlur={() => setIsComposerFocus(false)}
                                        report={report}
                                        reportMetadata={reportMetadata}
                                        policy={policy}
                                        pendingAction={reportPendingAction}
                                        isComposerFullSize={!!isComposerFullSize}
                                        isEmptyChat={isEmptyChat}
                                        lastReportAction={lastReportAction}
                                        workspaceTooltip={workspaceTooltip}
                                    />
                                ) : null}
                            </View>
                            <PortalHost name="suggestions" />
                        </DragAndDropProvider>
                    </FullPageNotFoundView>
                </ScreenWrapper>
            </ReactionListContext.Provider>
        </ActionListContext.Provider>
    );
}

ReportScreen.displayName = 'ReportScreen';
export default withCurrentReportID(memo(ReportScreen, (prevProps, nextProps) => prevProps.currentReportID === nextProps.currentReportID && lodashIsEqual(prevProps.route, nextProps.route)));
