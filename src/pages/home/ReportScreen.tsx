import {useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {FlatList, ViewStyle} from 'react-native';
import {InteractionManager, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOnyx, withOnyx} from 'react-native-onyx';
import type {LayoutChangeEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import Banner from '@components/Banner';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import * as Illustrations from '@components/Icon/Illustrations';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import TaskHeaderActionButton from '@components/TaskHeaderActionButton';
import type {CurrentReportIDContextValue} from '@components/withCurrentReportID';
import withCurrentReportID from '@components/withCurrentReportID';
import useAppFocusEvent from '@hooks/useAppFocusEvent';
import useIsReportOpenInRHP from '@hooks/useIsReportOpenInRHP';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Timing from '@libs/actions/Timing';
import Navigation from '@libs/Navigation/Navigation';
import clearReportNotifications from '@libs/Notification/clearReportNotifications';
import Performance from '@libs/Performance';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import shouldFetchReport from '@libs/shouldFetchReport';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
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
import ReportActionsView from './report/ReportActionsView';
import ReportFooter from './report/ReportFooter';
import type {ActionListContextType, ReactionListRef, ScrollPosition} from './ReportScreenContext';
import {ActionListContext, ReactionListContext} from './ReportScreenContext';

type ReportScreenOnyxProps = {
    /** Tells us if the sidebar has rendered */
    isSidebarLoaded: OnyxEntry<boolean>;

    /** Beta features list */
    betas: OnyxEntry<OnyxTypes.Beta[]>;

    /** The policies which the user has access to */
    policies: OnyxCollection<OnyxTypes.Policy>;

    /** An array containing all report actions related to this report, sorted based on a date criterion */
    sortedAllReportActions: OnyxTypes.ReportAction[];

    reportNameValuePairs: OnyxEntry<OnyxTypes.ReportNameValuePairs>;

    /** The report metadata loading states */
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>;
};

type OnyxHOCProps = {
    /** Onyx function that marks the component ready for hydration */
    markReadyForHydration?: () => void;
};

type ReportScreenNavigationProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.REPORT>;

type ReportScreenProps = OnyxHOCProps & CurrentReportIDContextValue & ReportScreenOnyxProps & ReportScreenNavigationProps;

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
function isEmpty(report: OnyxTypes.Report): boolean {
    if (isEmptyObject(report)) {
        return true;
    }
    return !Object.values(report).some((value) => value !== undefined && value !== '');
}

function getParentReportAction(parentReportActions: OnyxEntry<OnyxTypes.ReportActions>, parentReportActionID: string | undefined): OnyxEntry<OnyxTypes.ReportAction> {
    if (!parentReportActions || !parentReportActionID) {
        return null;
    }
    return parentReportActions[parentReportActionID ?? '0'];
}

function ReportScreen({
    betas = [],
    route,
    reportNameValuePairs,
    sortedAllReportActions,
    reportMetadata = {
        isLoadingInitialReportActions: true,
        isLoadingOlderReportActions: false,
        hasLoadingOlderReportActionsError: false,
        isLoadingNewerReportActions: false,
        hasLoadingNewerReportActionsError: false,
    },
    markReadyForHydration,
    policies = {},
    isSidebarLoaded = false,
    currentReportID = '',
    navigation,
}: ReportScreenProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const reportIDFromRoute = getReportID(route);
    const reportActionIDFromRoute = route?.params?.reportActionID ?? '';
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    const firstRenderRef = useRef(true);
    const flatListRef = useRef<FlatList>(null);
    const reactionListRef = useRef<ReactionListRef>(null);
    const {isOffline} = useNetwork();
    const isReportOpenInRHP = useIsReportOpenInRHP();
    const {isSmallScreenWidth} = useWindowDimensions();
    const shouldUseNarrowLayout = isSmallScreenWidth || isReportOpenInRHP;

    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const [isComposerFullSize] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${getReportID(route)}`, {initialValue: false});
    const [accountManagerReportID] = useOnyx(ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID, {initialValue: ''});
    const [userLeavingStatus] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${getReportID(route)}`, {initialValue: false});
    const [reportOnyx, reportResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getReportID(route)}`, {allowStaleData: true});
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportOnyx?.parentReportID || 0}`, {
        canEvict: false,
        selector: (parentReportActions) => getParentReportAction(parentReportActions, reportOnyx?.parentReportActionID ?? ''),
    });

    const isLoadingReportOnyx = isLoadingOnyxValue(reportResult);

    /**
     * Create a lightweight Report so as to keep the re-rendering as light as possible by
     * passing in only the required props.
     *
     * Also, this plays nicely in contrast with Onyx,
     * which creates a new object every time collection changes. Because of this we can't
     * put this into onyx selector as it will be the same.
     */
    const report = useMemo(
        (): OnyxTypes.Report => ({
            lastReadTime: reportOnyx?.lastReadTime,
            reportID: reportOnyx?.reportID ?? '',
            policyID: reportOnyx?.policyID,
            lastVisibleActionCreated: reportOnyx?.lastVisibleActionCreated,
            statusNum: reportOnyx?.statusNum,
            stateNum: reportOnyx?.stateNum,
            writeCapability: reportOnyx?.writeCapability,
            type: reportOnyx?.type,
            errorFields: reportOnyx?.errorFields,
            isPolicyExpenseChat: reportOnyx?.isPolicyExpenseChat,
            parentReportID: reportOnyx?.parentReportID,
            parentReportActionID: reportOnyx?.parentReportActionID,
            chatType: reportOnyx?.chatType,
            pendingFields: reportOnyx?.pendingFields,
            isDeletedParentAction: reportOnyx?.isDeletedParentAction,
            reportName: reportOnyx?.reportName,
            description: reportOnyx?.description,
            managerID: reportOnyx?.managerID,
            total: reportOnyx?.total,
            nonReimbursableTotal: reportOnyx?.nonReimbursableTotal,
            fieldList: reportOnyx?.fieldList,
            ownerAccountID: reportOnyx?.ownerAccountID,
            currency: reportOnyx?.currency,
            unheldTotal: reportOnyx?.unheldTotal,
            participants: reportOnyx?.participants,
            isWaitingOnBankAccount: reportOnyx?.isWaitingOnBankAccount,
            iouReportID: reportOnyx?.iouReportID,
            isOwnPolicyExpenseChat: reportOnyx?.isOwnPolicyExpenseChat,
            notificationPreference: reportOnyx?.notificationPreference,
            isPinned: reportOnyx?.isPinned,
            chatReportID: reportOnyx?.chatReportID,
            visibility: reportOnyx?.visibility,
            oldPolicyName: reportOnyx?.oldPolicyName,
            policyName: reportOnyx?.policyName,
            isOptimisticReport: reportOnyx?.isOptimisticReport,
            lastMentionedTime: reportOnyx?.lastMentionedTime,
            avatarUrl: reportOnyx?.avatarUrl,
            permissions: reportOnyx?.permissions,
            invoiceReceiver: reportOnyx?.invoiceReceiver,
        }),
        [
            reportOnyx?.lastReadTime,
            reportOnyx?.reportID,
            reportOnyx?.policyID,
            reportOnyx?.lastVisibleActionCreated,
            reportOnyx?.statusNum,
            reportOnyx?.stateNum,
            reportOnyx?.writeCapability,
            reportOnyx?.type,
            reportOnyx?.errorFields,
            reportOnyx?.isPolicyExpenseChat,
            reportOnyx?.parentReportID,
            reportOnyx?.parentReportActionID,
            reportOnyx?.chatType,
            reportOnyx?.pendingFields,
            reportOnyx?.isDeletedParentAction,
            reportOnyx?.reportName,
            reportOnyx?.description,
            reportOnyx?.managerID,
            reportOnyx?.total,
            reportOnyx?.nonReimbursableTotal,
            reportOnyx?.fieldList,
            reportOnyx?.ownerAccountID,
            reportOnyx?.currency,
            reportOnyx?.unheldTotal,
            reportOnyx?.participants,
            reportOnyx?.isWaitingOnBankAccount,
            reportOnyx?.iouReportID,
            reportOnyx?.isOwnPolicyExpenseChat,
            reportOnyx?.notificationPreference,
            reportOnyx?.isPinned,
            reportOnyx?.chatReportID,
            reportOnyx?.visibility,
            reportOnyx?.oldPolicyName,
            reportOnyx?.policyName,
            reportOnyx?.isOptimisticReport,
            reportOnyx?.lastMentionedTime,
            reportOnyx?.avatarUrl,
            reportOnyx?.permissions,
            reportOnyx?.invoiceReceiver,
        ],
    );

    const prevReport = usePrevious(report);
    const prevUserLeavingStatus = usePrevious(userLeavingStatus);
    const [isLinkingToMessage, setIsLinkingToMessage] = useState(!!reportActionIDFromRoute);
    const reportActions = useMemo(() => {
        if (!sortedAllReportActions.length) {
            return [];
        }
        return ReportActionsUtils.getContinuousReportActionChain(sortedAllReportActions, reportActionIDFromRoute);
    }, [reportActionIDFromRoute, sortedAllReportActions]);

    // Define here because reportActions are recalculated before mount, allowing data to display faster than useEffect can trigger.
    // If we have cached reportActions, they will be shown immediately.
    // We aim to display a loader first, then fetch relevant reportActions, and finally show them.
    useLayoutEffect(() => {
        setIsLinkingToMessage(!!reportActionIDFromRoute);
    }, [route, reportActionIDFromRoute]);

    const [isBannerVisible, setIsBannerVisible] = useState(true);
    const [listHeight, setListHeight] = useState(0);
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
    const isEmptyChat = useMemo((): boolean => reportActions.length === 0, [reportActions]);
    const isOptimisticDelete = report.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;
    const isLinkedMessageAvailable = useMemo(
        (): boolean => sortedAllReportActions.findIndex((obj) => String(obj.reportActionID) === String(reportActionIDFromRoute)) > -1,
        [sortedAllReportActions, reportActionIDFromRoute],
    );

    // If there's a non-404 error for the report we should show it instead of blocking the screen
    const hasHelpfulErrors = Object.keys(report?.errorFields ?? {}).some((key) => key !== 'notFound');
    const shouldHideReport = !hasHelpfulErrors && !ReportUtils.canAccessReport(report, policies, betas);

    const lastReportAction: OnyxEntry<OnyxTypes.ReportAction> = useMemo(
        () =>
            reportActions.length
                ? [...reportActions, parentReportAction].find((action) => ReportUtils.canEditReportAction(action) && !ReportActionsUtils.isMoneyRequestAction(action)) ?? null
                : null,
        [reportActions, parentReportAction],
    );
    const isSingleTransactionView = ReportUtils.isMoneyRequest(report) || ReportUtils.isTrackExpenseReport(report);
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] ?? null;
    const isTopMostReportId = currentReportID === reportIDFromRoute;
    const didSubscribeToReportLeavingEvents = useRef(false);

    useEffect(() => {
        if (!report.reportID || shouldHideReport) {
            wasReportAccessibleRef.current = false;
            return;
        }
        wasReportAccessibleRef.current = true;
    }, [shouldHideReport, report]);

    const onBackButtonPress = useCallback(() => {
        if (isReportOpenInRHP) {
            Navigation.dismissModal();
            return;
        }
        Navigation.goBack(undefined, false, true);
    }, [isReportOpenInRHP]);

    let headerView = (
        <HeaderView
            reportID={reportIDFromRoute}
            onNavigationMenuButtonClicked={onBackButtonPress}
            report={report}
            parentReportAction={parentReportAction}
            shouldUseNarrowLayout={shouldUseNarrowLayout}
        />
    );

    const transactionThreadReportID = useMemo(
        () => ReportActionsUtils.getOneTransactionThreadReportID(report.reportID, reportActions ?? [], false, isOffline),
        [report.reportID, reportActions, isOffline],
    );

    if (isSingleTransactionView) {
        headerView = (
            <MoneyRequestHeader
                report={report}
                policy={policy}
                parentReportAction={parentReportAction}
                shouldUseNarrowLayout={shouldUseNarrowLayout}
                onBackButtonPress={onBackButtonPress}
            />
        );
    }

    useEffect(() => {
        if (!transactionThreadReportID || !route.params.reportActionID) {
            return;
        }
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(route.params.reportID));
    }, [transactionThreadReportID, route.params.reportActionID, route.params.reportID]);

    if (ReportUtils.isMoneyRequestReport(report) || ReportUtils.isInvoiceReport(report)) {
        headerView = (
            <MoneyReportHeader
                report={report}
                policy={policy}
                transactionThreadReportID={transactionThreadReportID}
                reportActions={reportActions}
                shouldUseNarrowLayout={shouldUseNarrowLayout}
                onBackButtonPress={onBackButtonPress}
            />
        );
    }

    /**
     * When false the ReportActionsView will completely unmount and we will show a loader until it returns true.
     */
    const isCurrentReportLoadedFromOnyx = useMemo((): boolean => {
        // This is necessary so that when we are retrieving the next report data from Onyx the ReportActionsView will remount completely
        const isTransitioning = report && report.reportID !== reportIDFromRoute;
        return reportIDFromRoute !== '' && !!report.reportID && !isTransitioning;
    }, [report, reportIDFromRoute]);

    const isLoading = !reportIDFromRoute || (!isSidebarLoaded && !isReportOpenInRHP) || PersonalDetailsUtils.isPersonalDetailsEmpty();
    const shouldShowSkeleton =
        !isLinkedMessageAvailable &&
        (isLinkingToMessage ||
            !isCurrentReportLoadedFromOnyx ||
            (reportActions.length === 0 && !!reportMetadata?.isLoadingInitialReportActions) ||
            isLoading ||
            (!!reportActionIDFromRoute && reportMetadata?.isLoadingInitialReportActions));
    const shouldShowReportActionList = isCurrentReportLoadedFromOnyx && !isLoading;
    const currentReportIDFormRoute = route.params?.reportID;
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo(
        (): boolean =>
            (!wasReportAccessibleRef.current && !firstRenderRef.current && !report.reportID && !isOptimisticDelete && !reportMetadata?.isLoadingInitialReportActions && !userLeavingStatus) ||
            shouldHideReport ||
            (!!currentReportIDFormRoute && !ReportUtils.isValidReportIDFromPath(currentReportIDFormRoute)),
        [report.reportID, isOptimisticDelete, reportMetadata?.isLoadingInitialReportActions, userLeavingStatus, shouldHideReport, currentReportIDFormRoute],
    );

    const fetchReport = useCallback(() => {
        Report.openReport(reportIDFromRoute, reportActionIDFromRoute);
    }, [reportIDFromRoute, reportActionIDFromRoute]);

    useEffect(() => {
        if (!report.reportID) {
            return;
        }

        if (report?.errorFields?.notFound) {
            Report.clearReportNotFoundErrors(report.reportID);
        }
    }, [report?.errorFields?.notFound, report.reportID]);

    useEffect(() => {
        if (!report.reportID || !isFocused) {
            return;
        }
        Report.updateLastVisitTime(report.reportID);
    }, [report.reportID, isFocused]);

    const fetchReportIfNeeded = useCallback(() => {
        // Report ID will be empty when the reports collection is empty.
        // This could happen when we are loading the collection for the first time after logging in.
        if (!ReportUtils.isValidReportIDFromPath(reportIDFromRoute)) {
            return;
        }

        if (!shouldFetchReport(report)) {
            return;
        }

        fetchReport();
    }, [report, fetchReport, reportIDFromRoute]);

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

        clearReportNotifications(report.reportID);
    }, [report.reportID, isTopMostReportId]);

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

            Report.unsubscribeFromLeavingRoomReportChannel(report.reportID);
        };

        // I'm disabling the warning, as it expects to use exhaustive deps, even though we want this useEffect to run only on the first render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Call OpenReport only if we are not linking to a message or the report is not available yet
        if (isLoadingReportOnyx || (reportActionIDFromRoute && report.reportID)) {
            return;
        }

        fetchReportIfNeeded();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoadingReportOnyx]);

    // If a user has chosen to leave a thread, and then returns to it (e.g. with the back button), we need to call `openReport` again in order to allow the user to rejoin and to receive real-time updates
    useEffect(() => {
        if (!shouldUseNarrowLayout || !isFocused || prevIsFocused || !ReportUtils.isChatThread(report) || report.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN) {
            return;
        }
        Report.openReport(report.reportID);

        // We don't want to run this useEffect every time `report` is changed
        // Excluding shouldUseNarrowLayout from the dependency list to prevent re-triggering on screen resize events.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prevIsFocused, report.notificationPreference, isFocused]);

    useEffect(() => {
        // We don't want this effect to run on the first render.
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }

        const onyxReportID = report.reportID;
        const prevOnyxReportID = prevReport.reportID;
        const wasReportRemoved = !!prevOnyxReportID && prevOnyxReportID === reportIDFromRoute && !onyxReportID;
        const isRemovalExpectedForReportType =
            isEmpty(report) &&
            (ReportUtils.isMoneyRequest(prevReport) || ReportUtils.isMoneyRequestReport(prevReport) || ReportUtils.isPolicyExpenseChat(prevReport) || ReportUtils.isGroupChat(prevReport));
        const didReportClose = wasReportRemoved && prevReport.statusNum === CONST.REPORT.STATUS_NUM.OPEN && report.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;
        const isTopLevelPolicyRoomWithNoStatus = !report.statusNum && !prevReport.parentReportID && prevReport.chatType === CONST.REPORT.CHAT_TYPE.POLICY_ROOM;
        const isClosedTopLevelPolicyRoom = wasReportRemoved && prevReport.statusNum === CONST.REPORT.STATUS_NUM.OPEN && isTopLevelPolicyRoomWithNoStatus;
        // Navigate to the Concierge chat if the room was removed from another device (e.g. user leaving a room or removed from a room)
        if (
            // non-optimistic case
            (!prevUserLeavingStatus && !!userLeavingStatus) ||
            didReportClose ||
            isRemovalExpectedForReportType ||
            isClosedTopLevelPolicyRoom
        ) {
            // Early return if the report we're passing isn't in a focused state. We only want to navigate to Concierge if the user leaves the room from another device or gets removed from the room while the report is in a focused state.
            if (!isFocused) {
                return;
            }
            Navigation.dismissModal();
            if (Navigation.getTopmostReportId() === prevOnyxReportID) {
                Navigation.setShouldPopAllStateOnUP();
                Navigation.goBack(undefined, false, true);
            }
            if (prevReport.parentReportID) {
                // Prevent navigation to the IOU/Expense Report if it is pending deletion.
                const parentReport = ReportUtils.getReport(prevReport.parentReportID);
                if (ReportUtils.isMoneyRequestReportPendingDeletion(parentReport)) {
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
        if (onyxReportID === prevReport.reportID && (!onyxReportID || onyxReportID === reportIDFromRoute)) {
            return;
        }

        fetchReportIfNeeded();
        ComposerActions.setShouldShowComposeInput(true);
    }, [
        route,
        report,
        // errors,
        fetchReportIfNeeded,
        prevReport.reportID,
        prevUserLeavingStatus,
        userLeavingStatus,
        prevReport.statusNum,
        prevReport.parentReportID,
        prevReport.chatType,
        prevReport,
        reportIDFromRoute,
        isFocused,
    ]);

    useEffect(() => {
        if (!ReportUtils.isValidReportIDFromPath(reportIDFromRoute)) {
            return;
        }
        // Ensures the optimistic report is created successfully
        if (reportIDFromRoute !== report.reportID) {
            return;
        }
        // Ensures subscription event succeeds when the report/workspace room is created optimistically.
        // Check if the optimistic `OpenReport` or `AddWorkspaceRoom` has succeeded by confirming
        // any `pendingFields.createChat` or `pendingFields.addWorkspaceRoom` fields are set to null.
        // Existing reports created will have empty fields for `pendingFields`.
        const didCreateReportSuccessfully = !report.pendingFields || (!report.pendingFields.addWorkspaceRoom && !report.pendingFields.createChat);
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

    const onListLayout = useCallback((event: LayoutChangeEvent) => {
        setListHeight((prev) => event.nativeEvent?.layout?.height ?? prev);
        if (!markReadyForHydration) {
            return;
        }

        markReadyForHydration();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const actionListValue = useMemo((): ActionListContextType => ({flatListRef, scrollPosition, setScrollPosition}), [flatListRef, scrollPosition, setScrollPosition]);

    // This helps in tracking from the moment 'route' triggers useMemo until isLoadingInitialReportActions becomes true. It prevents blinking when loading reportActions from cache.
    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            setIsLinkingToMessage(false);
        });
    }, [reportMetadata?.isLoadingInitialReportActions]);

    const navigateToEndOfReport = useCallback(() => {
        Navigation.setParams({reportActionID: ''});
        fetchReport();
    }, [fetchReport]);

    const isLinkedReportActionDeleted = useMemo(() => {
        if (!reportActionIDFromRoute || !sortedAllReportActions) {
            return false;
        }
        const action = sortedAllReportActions.find((item) => item.reportActionID === reportActionIDFromRoute);
        return action && !ReportActionsUtils.shouldReportActionBeVisible(action, action.reportActionID);
    }, [reportActionIDFromRoute, sortedAllReportActions]);

    if (isLinkedReportActionDeleted ?? (!shouldShowSkeleton && reportActionIDFromRoute && reportActions?.length === 0 && !isLinkingToMessage)) {
        return (
            <BlockingView
                icon={Illustrations.ToddBehindCloud}
                iconWidth={variables.modalTopIconWidth}
                iconHeight={variables.modalTopIconHeight}
                title={translate('notFound.notHere')}
                shouldShowLink
                linkKey="notFound.noAccess"
                onLinkPress={navigateToEndOfReport}
            />
        );
    }

    return (
        <ActionListContext.Provider value={actionListValue}>
            <ReactionListContext.Provider value={reactionListRef}>
                <ScreenWrapper
                    navigation={navigation}
                    style={screenWrapperStyle}
                    shouldEnableKeyboardAvoidingView={isTopMostReportId}
                    testID={ReportScreen.displayName}
                >
                    <FullPageNotFoundView
                        shouldShow={shouldShowNotFoundPage}
                        subtitleKey="notFound.noAccess"
                        shouldShowBackButton={shouldUseNarrowLayout}
                        onBackButtonPress={Navigation.goBack}
                        shouldShowLink={false}
                    >
                        <OfflineWithFeedback
                            pendingAction={reportPendingAction}
                            errors={reportErrors}
                            shouldShowErrorMessages={false}
                            needsOffscreenAlphaCompositing
                        >
                            {headerView}
                            {ReportUtils.isTaskReport(report) && shouldUseNarrowLayout && ReportUtils.isOpenTaskReport(report, parentReportAction) && (
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
                                onLayout={onListLayout}
                            >
                                {shouldShowReportActionList && (
                                    <ReportActionsView
                                        reportActions={reportActions}
                                        report={report}
                                        parentReportAction={parentReportAction}
                                        isLoadingInitialReportActions={reportMetadata?.isLoadingInitialReportActions}
                                        isLoadingNewerReportActions={reportMetadata?.isLoadingNewerReportActions}
                                        hasLoadingNewerReportActionsError={reportMetadata?.hasLoadingNewerReportActionsError}
                                        isLoadingOlderReportActions={reportMetadata?.isLoadingOlderReportActions}
                                        hasLoadingOlderReportActionsError={reportMetadata?.hasLoadingOlderReportActionsError}
                                        isReadyForCommentLinking={!shouldShowSkeleton}
                                        transactionThreadReportID={transactionThreadReportID}
                                    />
                                )}

                                {/* Note: The ReportActionsSkeletonView should be allowed to mount even if the initial report actions are not loaded.
                                    If we prevent rendering the report while they are loading then
                                    we'll unnecessarily unmount the ReportActionsView which will clear the new marker lines initial state. */}
                                {shouldShowSkeleton && <ReportActionsSkeletonView />}

                                {isCurrentReportLoadedFromOnyx ? (
                                    <ReportFooter
                                        onComposerFocus={() => setIsComposerFocus(true)}
                                        onComposerBlur={() => setIsComposerFocus(false)}
                                        report={report}
                                        reportNameValuePairs={reportNameValuePairs}
                                        pendingAction={reportPendingAction}
                                        isComposerFullSize={!!isComposerFullSize}
                                        listHeight={listHeight}
                                        isEmptyChat={isEmptyChat}
                                        lastReportAction={lastReportAction}
                                    />
                                ) : null}
                            </View>
                        </DragAndDropProvider>
                    </FullPageNotFoundView>
                </ScreenWrapper>
            </ReactionListContext.Provider>
        </ActionListContext.Provider>
    );
}

ReportScreen.displayName = 'ReportScreen';

export default withCurrentReportID(
    withOnyx<ReportScreenProps, ReportScreenOnyxProps>(
        {
            isSidebarLoaded: {
                key: ONYXKEYS.IS_SIDEBAR_LOADED,
            },
            sortedAllReportActions: {
                key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getReportID(route)}`,
                canEvict: false,
                selector: (allReportActions: OnyxEntry<OnyxTypes.ReportActions>) => ReportActionsUtils.getSortedReportActionsForDisplay(allReportActions, true),
            },
            reportNameValuePairs: {
                key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getReportID(route)}`,
                allowStaleData: true,
            },
            reportMetadata: {
                key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_METADATA}${getReportID(route)}`,
                initialValue: {
                    isLoadingInitialReportActions: true,
                    isLoadingOlderReportActions: false,
                    hasLoadingOlderReportActionsError: false,
                    isLoadingNewerReportActions: false,
                    hasLoadingNewerReportActionsError: false,
                },
            },
            betas: {
                key: ONYXKEYS.BETAS,
            },
            policies: {
                key: ONYXKEYS.COLLECTION.POLICY,
                allowStaleData: true,
            },
        },
        true,
    )(
        memo(
            ReportScreen,
            (prevProps, nextProps) =>
                prevProps.isSidebarLoaded === nextProps.isSidebarLoaded &&
                lodashIsEqual(prevProps.sortedAllReportActions, nextProps.sortedAllReportActions) &&
                lodashIsEqual(prevProps.reportMetadata, nextProps.reportMetadata) &&
                lodashIsEqual(prevProps.betas, nextProps.betas) &&
                lodashIsEqual(prevProps.policies, nextProps.policies) &&
                prevProps.currentReportID === nextProps.currentReportID &&
                lodashIsEqual(prevProps.route, nextProps.route),
        ),
    ),
);
