import {PortalHost} from '@gorhom/portal';
import {useIsFocused} from '@react-navigation/native';
import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {FlatList, ViewStyle} from 'react-native';
import {DeviceEventEmitter, InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Banner from '@components/Banner';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import * as Expensicons from '@components/Icon/Expensicons';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useAppFocusEvent from '@hooks/useAppFocusEvent';
import useCurrentReportID from '@hooks/useCurrentReportID';
import useDeepCompareRef from '@hooks/useDeepCompareRef';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import {hideEmojiPicker} from '@libs/actions/EmojiPickerAction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Log from '@libs/Log';
import {selectAllTransactionsForReport, shouldDisplayReportTableView} from '@libs/MoneyRequestReportUtils';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import clearReportNotifications from '@libs/Notification/clearReportNotifications';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {
    getCombinedReportActions,
    getOneTransactionThreadReportID,
    isCreatedAction,
    isDeletedParentAction,
    isMoneyRequestAction,
    isWhisperAction,
    shouldReportActionBeVisible,
} from '@libs/ReportActionsUtils';
import {
    canEditReportAction,
    canUserPerformWriteAction,
    findLastAccessedReport,
    getParticipantsAccountIDsForDisplay,
    getReportOfflinePendingActionAndErrors,
    isChatThread,
    isConciergeChatReport,
    isGroupChat,
    isHiddenForCurrentUser,
    isInvoiceReport,
    isMoneyRequest,
    isMoneyRequestReport,
    isMoneyRequestReportPendingDeletion,
    isOneTransactionThread,
    isPolicyExpenseChat,
    isReportTransactionThread,
    isTaskReport,
    isValidReportIDFromPath,
} from '@libs/ReportUtils';
import {isNumeric} from '@libs/ValidationUtils';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import {setShouldShowComposeInput} from '@userActions/Composer';
import {
    clearDeleteTransactionNavigateBackUrl,
    navigateToConciergeChat,
    openReport,
    readNewestAction,
    subscribeToReportLeavingEvents,
    unsubscribeFromLeavingRoomReportChannel,
    updateLastVisitTime,
} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import HeaderView from './HeaderView';
import ReactionListWrapper from './ReactionListWrapper';
import ReportActionsView from './report/ReportActionsView';
import ReportFooter from './report/ReportFooter';
import type {ActionListContextType, ScrollPosition} from './ReportScreenContext';
import {ActionListContext} from './ReportScreenContext';

type ReportScreenNavigationProps = PlatformStackScreenProps<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>;

type ReportScreenProps = ReportScreenNavigationProps;

const defaultReportMetadata = {
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    isOptimisticReport: false,
};

const reportDetailScreens = [...Object.values(SCREENS.REPORT_DETAILS), ...Object.values(SCREENS.REPORT_SETTINGS), ...Object.values(SCREENS.PRIVATE_NOTES)];

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
    return parentReportActions[parentReportActionID];
}

function ReportScreen({route, navigation}: ReportScreenProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const reportActionIDFromRoute = route?.params?.reportActionID;
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    const firstRenderRef = useRef(true);
    const [firstRender, setFirstRender] = useState(true);
    const isSkippingOpenReport = useRef(false);
    const flatListRef = useRef<FlatList>(null);
    const {canUseDefaultRooms, canUseTableReportView} = usePermissions();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
    const {activeWorkspaceID} = useActiveWorkspace();
    const currentReportIDValue = useCurrentReportID();

    const [modal] = useOnyx(ONYXKEYS.MODAL, {canBeMissing: false});
    const [isComposerFullSize] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportIDFromRoute}`, {initialValue: false, canBeMissing: true});
    const [accountManagerReportID] = useOnyx(ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID, {canBeMissing: true});
    const [accountManagerReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(accountManagerReportID)}`, {canBeMissing: true});
    const [userLeavingStatus] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportIDFromRoute}`, {initialValue: false, canBeMissing: true});
    const [reportOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`, {allowStaleData: true, canBeMissing: true});
    const [reportNameValuePairsOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportIDFromRoute}`, {allowStaleData: true, canBeMissing: true});
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {allowStaleData: true, initialValue: {}, canBeMissing: false});
    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportOnyx?.parentReportID)}`, {
        canEvict: false,
        selector: (parentReportActions) => getParentReportAction(parentReportActions, reportOnyx?.parentReportActionID),
        canBeMissing: true,
    });
    const deletedParentAction = isDeletedParentAction(parentReportAction);
    const prevDeletedParentAction = usePrevious(deletedParentAction);

    const permissions = useDeepCompareRef(reportOnyx?.permissions);

    useEffect(() => {
        // Don't update if there is a reportID in the params already
        if (route.params.reportID) {
            const reportActionID = route?.params?.reportActionID;
            const isValidReportActionID = isNumeric(reportActionID);
            if (reportActionID && !isValidReportActionID) {
                navigation.setParams({reportActionID: ''});
            }
            return;
        }

        const lastAccessedReportID = findLastAccessedReport(!canUseDefaultRooms, !!route.params.openOnAdminRoom, activeWorkspaceID)?.reportID;

        // It's possible that reports aren't fully loaded yet
        // in that case the reportID is undefined
        if (!lastAccessedReportID) {
            return;
        }

        Log.info(`[ReportScreen] no reportID found in params, setting it to lastAccessedReportID: ${lastAccessedReportID}`);
        navigation.setParams({reportID: lastAccessedReportID});
    }, [activeWorkspaceID, canUseDefaultRooms, navigation, route]);

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const chatWithAccountManagerText = useMemo(() => {
        if (accountManagerReportID) {
            const participants = getParticipantsAccountIDsForDisplay(accountManagerReport, false, true);
            const participantPersonalDetails = getPersonalDetailsForAccountIDs([participants?.at(0) ?? -1], personalDetails);
            const participantPersonalDetail = Object.values(participantPersonalDetails).at(0);
            const displayName = getDisplayNameOrDefault(participantPersonalDetail);
            const login = participantPersonalDetail?.login;
            if (displayName && login) {
                return translate('common.chatWithAccountManager', {accountManagerDisplayName: `${displayName} (${login})`});
            }
        }
        return '';
    }, [accountManagerReportID, accountManagerReport, personalDetails, translate]);

    /**
     * Create a lightweight Report so as to keep the re-rendering as light as possible by
     * passing in only the required props.
     *
     * Also, this plays nicely in contrast with Onyx,
     * which creates a new object every time collection changes. Because of this we can't
     * put this into onyx selector as it will be the same.
     */
    const report = useMemo(
        () =>
            reportOnyx && {
                lastReadTime: reportOnyx.lastReadTime,
                reportID: reportOnyx.reportID,
                policyID: reportOnyx.policyID,
                lastVisibleActionCreated: reportOnyx.lastVisibleActionCreated,
                statusNum: reportOnyx.statusNum,
                stateNum: reportOnyx.stateNum,
                writeCapability: reportOnyx.writeCapability,
                type: reportOnyx.type,
                errorFields: reportOnyx.errorFields,
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
                unheldNonReimbursableTotal: reportOnyx.unheldNonReimbursableTotal,
                participants: reportOnyx.participants,
                isWaitingOnBankAccount: reportOnyx.isWaitingOnBankAccount,
                iouReportID: reportOnyx.iouReportID,
                isOwnPolicyExpenseChat: reportOnyx.isOwnPolicyExpenseChat,
                isPinned: reportOnyx.isPinned,
                chatReportID: reportOnyx.chatReportID,
                visibility: reportOnyx.visibility,
                oldPolicyName: reportOnyx.oldPolicyName,
                policyName: reportOnyx.policyName,
                private_isArchived: reportNameValuePairsOnyx?.private_isArchived,
                lastMentionedTime: reportOnyx.lastMentionedTime,
                avatarUrl: reportOnyx.avatarUrl,
                permissions,
                invoiceReceiver: reportOnyx.invoiceReceiver,
                policyAvatar: reportOnyx.policyAvatar,
            },
        [reportOnyx, reportNameValuePairsOnyx, permissions],
    );
    const reportID = report?.reportID;

    const prevReport = usePrevious(report);
    const prevUserLeavingStatus = usePrevious(userLeavingStatus);
    const lastReportIDFromRoute = usePrevious(reportIDFromRoute);
    const [isLinkingToMessage, setIsLinkingToMessage] = useState(!!reportActionIDFromRoute);

    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: (value) => value?.accountID, canBeMissing: false});
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {selector: (value) => value?.email, canBeMissing: false});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const {
        reportActions: reportActionsWithDeletedExpenses,
        linkedAction,
        sortedAllReportActions,
        hasNewerActions,
        hasOlderActions,
    } = usePaginatedReportActions(reportID, reportActionIDFromRoute);
    const reportActions = reportActionsWithDeletedExpenses.filter((value) => !isDeletedParentAction(value));

    const [isBannerVisible, setIsBannerVisible] = useState(true);
    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({});

    const wasReportAccessibleRef = useRef(false);

    const [isComposerFocus, setIsComposerFocus] = useState(false);
    const shouldAdjustScrollView = useMemo(() => isComposerFocus && !modal?.willAlertModalBecomeVisible, [isComposerFocus, modal]);
    const viewportOffsetTop = useViewportOffsetTop(shouldAdjustScrollView);

    const {reportPendingAction, reportErrors} = getReportOfflinePendingActionAndErrors(report);
    const screenWrapperStyle: ViewStyle[] = [styles.appContent, styles.flex1, {marginTop: viewportOffsetTop}];
    const isOptimisticDelete = report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;
    const indexOfLinkedMessage = useMemo(
        (): number => reportActions.findIndex((obj) => reportActionIDFromRoute && String(obj.reportActionID) === String(reportActionIDFromRoute)),
        [reportActions, reportActionIDFromRoute],
    );

    const doesCreatedActionExists = useCallback(() => !!reportActions?.findLast((action) => isCreatedAction(action)), [reportActions]);
    const isLinkedMessageAvailable = indexOfLinkedMessage > -1;

    // The linked report actions should have at least 15 messages (counting as 1 page) above them to fill the screen.
    // If the count is too high (equal to or exceeds the web pagination size / 50) and there are no cached messages in the report,
    // OpenReport will be called each time the user scrolls up the report a bit, clicks on report preview, and then goes back."
    const isLinkedMessagePageReady = isLinkedMessageAvailable && (reportActions.length - indexOfLinkedMessage >= CONST.REPORT.MIN_INITIAL_REPORT_ACTION_COUNT || doesCreatedActionExists());

    const [reportTransactions = []] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (allTransactions): OnyxTypes.Transaction[] => selectAllTransactionsForReport(allTransactions, reportIDFromRoute, reportActions),
        canBeMissing: false,
    });
    const transactionThreadReportID = getOneTransactionThreadReportID(reportID, reportActions ?? [], isOffline);
    const [transactionThreadReportActions = {}] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`, {canBeMissing: true});
    const combinedReportActions = getCombinedReportActions(reportActions, transactionThreadReportID ?? null, Object.values(transactionThreadReportActions));
    const lastReportAction = [...combinedReportActions, parentReportAction].find((action) => canEditReportAction(action) && !isMoneyRequestAction(action));
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
    const isTopMostReportId = currentReportIDValue?.currentReportID === reportIDFromRoute;
    const didSubscribeToReportLeavingEvents = useRef(false);
    const isTransactionThreadView = isReportTransactionThread(report);
    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);

    useEffect(() => {
        if (!prevIsFocused || isFocused) {
            return;
        }
        hideEmojiPicker(true);
    }, [prevIsFocused, isFocused]);

    useEffect(() => {
        if (!report?.reportID) {
            wasReportAccessibleRef.current = false;
            return;
        }
        wasReportAccessibleRef.current = true;
    }, [report]);

    const backTo = route?.params?.backTo as string;
    const onBackButtonPress = useCallback(() => {
        if (isInNarrowPaneModal && backTo !== SCREENS.SEARCH.REPORT_RHP) {
            Navigation.dismissModal();
            return;
        }
        if (Navigation.getShouldPopToSidebar()) {
            Navigation.popToSidebar();
            return;
        }
        if (backTo) {
            Navigation.goBack(backTo as Route);
            return;
        }
        Navigation.goBack();
    }, [isInNarrowPaneModal, backTo]);

    let headerView = (
        <HeaderView
            reportID={reportIDFromRoute}
            onNavigationMenuButtonClicked={onBackButtonPress}
            report={report}
            parentReportAction={parentReportAction}
            shouldUseNarrowLayout={shouldUseNarrowLayout}
        />
    );

    if (isTransactionThreadView) {
        headerView = (
            <MoneyRequestHeader
                report={report}
                policy={policy}
                parentReportAction={parentReportAction}
                onBackButtonPress={onBackButtonPress}
            />
        );
    }

    if (isMoneyRequestOrInvoiceReport) {
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

    useEffect(() => {
        if (!transactionThreadReportID || !route?.params?.reportActionID || !isOneTransactionThread(linkedAction?.childReportID, reportID, linkedAction)) {
            return;
        }
        navigation.setParams({reportActionID: ''});
    }, [transactionThreadReportID, route?.params?.reportActionID, linkedAction, reportID, navigation]);

    const {isEditingDisabled, isCurrentReportLoadedFromOnyx} = useIsReportReadyToDisplay(report, reportIDFromRoute);

    const isLinkedActionDeleted = useMemo(
        () => !!linkedAction && !shouldReportActionBeVisible(linkedAction, linkedAction.reportActionID, canUserPerformWriteAction(report)),
        [linkedAction, report],
    );

    const prevIsLinkedActionDeleted = usePrevious(linkedAction ? isLinkedActionDeleted : undefined);

    // eslint-disable-next-line react-compiler/react-compiler
    const lastReportActionIDFromRoute = usePrevious(!firstRenderRef.current ? reportActionIDFromRoute : undefined);

    const [isNavigatingToDeletedAction, setIsNavigatingToDeletedAction] = useState(false);

    const isLinkedActionInaccessibleWhisper = useMemo(
        () => !!linkedAction && isWhisperAction(linkedAction) && !(linkedAction?.whisperedToAccountIDs ?? []).includes(currentUserAccountID),
        [currentUserAccountID, linkedAction],
    );
    const [deleteTransactionNavigateBackUrl] = useOnyx(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL, {canBeMissing: true});

    useEffect(() => {
        if (!isFocused || !deleteTransactionNavigateBackUrl) {
            return;
        }
        // Clear the URL after all interactions are processed to ensure all updates are completed before hiding the skeleton
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                clearDeleteTransactionNavigateBackUrl();
            });
        });
    }, [isFocused, deleteTransactionNavigateBackUrl]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundLinkedAction =
        (!isLinkedActionInaccessibleWhisper && isLinkedActionDeleted && isNavigatingToDeletedAction) ||
        (!reportMetadata?.isLoadingInitialReportActions &&
            !!reportActionIDFromRoute &&
            !!sortedAllReportActions &&
            sortedAllReportActions?.length > 0 &&
            reportActions.length === 0 &&
            !isLinkingToMessage);

    const currentReportIDFormRoute = route.params?.reportID;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo(
        (): boolean => {
            if (shouldShowNotFoundLinkedAction) {
                return true;
            }

            if (isLoadingApp !== false) {
                return false;
            }

            // eslint-disable-next-line react-compiler/react-compiler
            if (!wasReportAccessibleRef.current && !firstRenderRef.current && !reportID && !isOptimisticDelete && !reportMetadata?.isLoadingInitialReportActions && !userLeavingStatus) {
                // eslint-disable-next-line react-compiler/react-compiler
                return true;
            }

            return !!currentReportIDFormRoute && !isValidReportIDFromPath(currentReportIDFormRoute);
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [firstRender, shouldShowNotFoundLinkedAction, reportID, isOptimisticDelete, reportMetadata?.isLoadingInitialReportActions, userLeavingStatus, currentReportIDFormRoute],
    );

    const fetchReport = useCallback(() => {
        if (reportMetadata.isOptimisticReport) {
            return;
        }

        const moneyRequestReportActionID: string | undefined = route.params?.moneyRequestReportActionID;
        const transactionID: string | undefined = route.params?.transactionID;

        // When we get here with a moneyRequestReportActionID and a transactionID from the route it means we don't have the transaction thread created yet
        // so we have to call OpenReport in a way that the transaction thread will be created and attached to the parentReportAction
        if (transactionID && currentUserEmail) {
            openReport(reportIDFromRoute, '', [currentUserEmail], undefined, moneyRequestReportActionID, false, [], undefined, undefined, transactionID);
            return;
        }
        openReport(reportIDFromRoute, reportActionIDFromRoute);
    }, [reportMetadata.isOptimisticReport, route.params?.moneyRequestReportActionID, route.params?.transactionID, reportIDFromRoute, reportActionIDFromRoute, currentUserEmail]);

    useEffect(() => {
        if (!reportID || !isFocused) {
            return;
        }
        updateLastVisitTime(reportID);
    }, [reportID, isFocused]);

    useEffect(() => {
        const skipOpenReportListener = DeviceEventEmitter.addListener(`switchToPreExistingReport_${reportID}`, ({preexistingReportID}: {preexistingReportID: string}) => {
            if (!preexistingReportID) {
                return;
            }
            isSkippingOpenReport.current = true;
        });

        return () => {
            skipOpenReportListener.remove();
        };
    }, [reportID]);

    const dismissBanner = useCallback(() => {
        setIsBannerVisible(false);
    }, []);

    const chatWithAccountManager = useCallback(() => {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(accountManagerReportID));
    }, [accountManagerReportID]);

    // Clear notifications for the current report when it's opened and re-focused
    const clearNotifications = useCallback(() => {
        // Check if this is the top-most ReportScreen since the Navigator preserves multiple at a time
        if (!isTopMostReportId) {
            return;
        }

        clearReportNotifications(reportID);
    }, [reportID, isTopMostReportId]);

    useEffect(clearNotifications, [clearNotifications]);
    useAppFocusEvent(clearNotifications);

    useEffect(() => {
        const interactionTask = InteractionManager.runAfterInteractions(() => {
            setShouldShowComposeInput(true);
        });
        return () => {
            interactionTask.cancel();
            if (!didSubscribeToReportLeavingEvents.current) {
                return;
            }

            unsubscribeFromLeavingRoomReportChannel(reportID);
        };

        // I'm disabling the warning, as it expects to use exhaustive deps, even though we want this useEffect to run only on the first render.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // This function is triggered when a user clicks on a link to navigate to a report.
        // For each link click, we retrieve the report data again, even though it may already be cached.
        // There should be only one openReport execution per page start or navigating
        fetchReport();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [route, isLinkedMessagePageReady, reportActionIDFromRoute]);

    const prevReportActions = usePrevious(reportActions);
    useEffect(() => {
        // This function is only triggered when a user is invited to a room after opening the link.
        // When a user opens a room they are not a member of, and the admin then invites them, only the INVITETOROOM action is available, so the background will be empty and room description is not available.
        // See https://github.com/Expensify/App/issues/57769 for more details
        if (prevReportActions.length !== 0 || reportActions.length !== 1 || reportActions.at(0)?.actionName !== CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM) {
            return;
        }
        fetchReport();
    }, [prevReportActions, reportActions, fetchReport]);

    // If a user has chosen to leave a thread, and then returns to it (e.g. with the back button), we need to call `openReport` again in order to allow the user to rejoin and to receive real-time updates
    useEffect(() => {
        if (!shouldUseNarrowLayout || !isFocused || prevIsFocused || !isChatThread(report) || !isHiddenForCurrentUser(report) || isTransactionThreadView) {
            return;
        }
        openReport(reportID);

        // We don't want to run this useEffect every time `report` is changed
        // Excluding shouldUseNarrowLayout from the dependency list to prevent re-triggering on screen resize events.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [prevIsFocused, report?.participants, isFocused, isTransactionThreadView, reportID]);

    useEffect(() => {
        // We don't want this effect to run on the first render.
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            setFirstRender(false);
            return;
        }

        const onyxReportID = report?.reportID;
        const prevOnyxReportID = prevReport?.reportID;
        const wasReportRemoved = !!prevOnyxReportID && prevOnyxReportID === reportIDFromRoute && !onyxReportID;
        const isRemovalExpectedForReportType =
            isEmpty(report) && (isMoneyRequest(prevReport) || isMoneyRequestReport(prevReport) || isPolicyExpenseChat(prevReport) || isGroupChat(prevReport));
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
            const currentRoute = navigationRef.getCurrentRoute();
            const isReportDetailOpenInRHP =
                isTopMostReportId &&
                reportDetailScreens.find((r) => r === currentRoute?.name) &&
                !!currentRoute?.params &&
                'reportID' in currentRoute.params &&
                reportIDFromRoute === currentRoute.params.reportID;
            // Early return if the report we're passing isn't in a focused state. We only want to navigate to Concierge if the user leaves the room from another device or gets removed from the room while the report is in a focused state.
            // Prevent auto navigation for report in RHP
            if ((!isFocused && !isReportDetailOpenInRHP) || isInNarrowPaneModal) {
                return;
            }
            Navigation.dismissModal();
            if (Navigation.getTopmostReportId() === prevOnyxReportID) {
                Navigation.isNavigationReady().then(() => {
                    Navigation.popToSidebar();
                });
            }
            if (prevReport?.parentReportID) {
                // Prevent navigation to the IOU/Expense Report if it is pending deletion.
                if (isMoneyRequestReportPendingDeletion(prevReport.parentReportID)) {
                    return;
                }
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(prevReport.parentReportID));
                return;
            }

            Navigation.isNavigationReady().then(() => {
                InteractionManager.runAfterInteractions(() => {
                    navigateToConciergeChat();
                });
            });
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [
        route,
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

    useEffect(() => {
        if (!isValidReportIDFromPath(reportIDFromRoute)) {
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
                subscribeToReportLeavingEvents(reportIDFromRoute);
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

    const navigateToEndOfReport = useCallback(() => {
        Navigation.setParams({reportActionID: ''});
        fetchReport();
    }, [fetchReport]);

    useEffect(() => {
        // Only handle deletion cases when there's a deleted action
        if (!isLinkedActionDeleted) {
            setIsNavigatingToDeletedAction(false);
            return;
        }

        // we want to do this destinguish between normal navigation and delete behavior
        if (lastReportActionIDFromRoute !== reportActionIDFromRoute) {
            setIsNavigatingToDeletedAction(true);
            return;
        }

        // Clear params when Action gets deleted while heighlighted
        if (!isNavigatingToDeletedAction && prevIsLinkedActionDeleted === false) {
            Navigation.setParams({reportActionID: ''});
        }
    }, [isLinkedActionDeleted, prevIsLinkedActionDeleted, lastReportActionIDFromRoute, reportActionIDFromRoute, isNavigatingToDeletedAction]);

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
        if (!!report?.lastReadTime || !isTaskReport(report)) {
            return;
        }
        // After creating the task report then navigating to task detail we don't have any report actions and the last read time is empty so We need to update the initial last read time when opening the task report detail.
        readNewestAction(report?.reportID);
    }, [report]);

    const lastRoute = usePrevious(route);

    const onComposerFocus = useCallback(() => setIsComposerFocus(true), []);
    const onComposerBlur = useCallback(() => setIsComposerFocus(false), []);

    // Define here because reportActions are recalculated before mount, allowing data to display faster than useEffect can trigger.
    // If we have cached reportActions, they will be shown immediately.
    // We aim to display a loader first, then fetch relevant reportActions, and finally show them.
    if ((lastRoute !== route || lastReportActionIDFromRoute !== reportActionIDFromRoute) && isLinkingToMessage !== !!reportActionIDFromRoute) {
        setIsLinkingToMessage(!!reportActionIDFromRoute);
        return null;
    }

    // If true reports that are considered MoneyRequest | InvoiceReport will get the new report table view
    const shouldDisplayMoneyRequestActionsList = canUseTableReportView && isMoneyRequestOrInvoiceReport && shouldDisplayReportTableView(report, reportTransactions);

    return (
        <ActionListContext.Provider value={actionListValue}>
            <ReactionListWrapper>
                <ScreenWrapper
                    navigation={navigation}
                    style={screenWrapperStyle}
                    shouldEnableKeyboardAvoidingView={isTopMostReportId || isInNarrowPaneModal}
                    testID={`report-screen-${reportID}`}
                >
                    <FullPageNotFoundView
                        shouldShow={shouldShowNotFoundPage}
                        subtitleKey={shouldShowNotFoundLinkedAction ? '' : 'notFound.noAccess'}
                        subtitleStyle={[styles.textSupporting]}
                        shouldShowBackButton={shouldUseNarrowLayout}
                        onBackButtonPress={shouldShowNotFoundLinkedAction ? navigateToEndOfReport : Navigation.goBack}
                        shouldShowLink={shouldShowNotFoundLinkedAction}
                        linkKey="notFound.noAccess"
                        onLinkPress={navigateToEndOfReport}
                        shouldDisplaySearchRouter
                    >
                        <OfflineWithFeedback
                            pendingAction={reportPendingAction}
                            errors={reportErrors}
                            shouldShowErrorMessages={false}
                            needsOffscreenAlphaCompositing
                        >
                            {headerView}
                        </OfflineWithFeedback>
                        {!!accountManagerReportID && isConciergeChatReport(report) && isBannerVisible && (
                            <Banner
                                containerStyles={[styles.mh4, styles.mt4, styles.p4, styles.br2]}
                                text={chatWithAccountManagerText}
                                onClose={dismissBanner}
                                onButtonPress={chatWithAccountManager}
                                shouldShowCloseButton
                                icon={Expensicons.Lightbulb}
                                shouldShowIcon
                                shouldShowButton
                            />
                        )}
                        <DragAndDropProvider isDisabled={isEditingDisabled}>
                            <View
                                style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                                testID="report-actions-view-wrapper"
                            >
                                {!report && <ReportActionsSkeletonView />}
                                {!!report && !shouldDisplayMoneyRequestActionsList ? (
                                    <ReportActionsView
                                        report={report}
                                        reportActions={reportActions}
                                        isLoadingInitialReportActions={reportMetadata?.isLoadingInitialReportActions}
                                        hasNewerActions={hasNewerActions}
                                        hasOlderActions={hasOlderActions}
                                        parentReportAction={parentReportAction}
                                        transactionThreadReportID={transactionThreadReportID}
                                    />
                                ) : null}
                                {!!report && shouldDisplayMoneyRequestActionsList ? (
                                    <MoneyRequestReportActionsList
                                        report={report}
                                        policy={policy}
                                        reportActions={reportActions}
                                        transactions={reportTransactions}
                                        hasOlderActions={hasOlderActions}
                                        hasNewerActions={hasNewerActions}
                                    />
                                ) : null}
                                {isCurrentReportLoadedFromOnyx ? (
                                    <ReportFooter
                                        onComposerFocus={onComposerFocus}
                                        onComposerBlur={onComposerBlur}
                                        report={report}
                                        reportMetadata={reportMetadata}
                                        policy={policy}
                                        pendingAction={reportPendingAction}
                                        isComposerFullSize={!!isComposerFullSize}
                                        lastReportAction={lastReportAction}
                                    />
                                ) : null}
                            </View>
                            <PortalHost name="suggestions" />
                        </DragAndDropProvider>
                    </FullPageNotFoundView>
                </ScreenWrapper>
            </ReactionListWrapper>
        </ActionListContext.Provider>
    );
}

ReportScreen.displayName = 'ReportScreen';
export default memo(ReportScreen, (prevProps, nextProps) => lodashIsEqual(prevProps.route, nextProps.route));
