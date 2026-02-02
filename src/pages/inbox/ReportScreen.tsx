import {PortalHost} from '@gorhom/portal';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {accountIDSelector} from '@selectors/Session';
import {deepEqual} from 'fast-equals';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {FlatList, ViewStyle} from 'react-native';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated, DeviceEventEmitter, InteractionManager, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Banner from '@components/Banner';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import MoneyRequestReceiptView from '@components/ReportActionItem/MoneyRequestReceiptView';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useShowWideRHPVersion from '@components/WideRHPContextProvider/useShowWideRHPVersion';
import WideRHPOverlayWrapper from '@components/WideRHPOverlayWrapper';
import useAppFocusEvent from '@hooks/useAppFocusEvent';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useDeepCompareRef from '@hooks/useDeepCompareRef';
import useIsAnonymousUser from '@hooks/useIsAnonymousUser';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useNewTransactions from '@hooks/useNewTransactions';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanel from '@hooks/useSidePanel';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import {hideEmojiPicker} from '@libs/actions/EmojiPickerAction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Log from '@libs/Log';
import {getAllNonDeletedTransactions, shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import clearReportNotifications from '@libs/Notification/clearReportNotifications';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {
    getCombinedReportActions,
    getFilteredReportActionsForReportView,
    getIOUActionForReportID,
    getOneTransactionThreadReportID,
    isCreatedAction,
    isDeletedParentAction,
    isMoneyRequestAction,
    isReportActionVisible,
    isSentMoneyReportAction,
    isTransactionThread,
    isWhisperAction,
} from '@libs/ReportActionsUtils';
import {
    canEditReportAction,
    canUserPerformWriteAction,
    findLastAccessedReport,
    getParticipantsAccountIDsForDisplay,
    getReportOfflinePendingActionAndErrors,
    getReportTransactions,
    isAdminRoom,
    isAnnounceRoom,
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
import {cancelSpan} from '@libs/telemetry/activeSpans';
import {isNumeric} from '@libs/ValidationUtils';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@navigation/types';
import {setShouldShowComposeInput} from '@userActions/Composer';
import {
    clearDeleteTransactionNavigateBackUrl,
    createTransactionThreadReport,
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
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';
import HeaderView from './HeaderView';
import useReportWasDeleted from './hooks/useReportWasDeleted';
import ReactionListWrapper from './ReactionListWrapper';
import ReportActionsView from './report/ReportActionsView';
import ReportFooter from './report/ReportFooter';
import type {ActionListContextType, ScrollPosition} from './ReportScreenContext';
import {ActionListContext} from './ReportScreenContext';

type ReportScreenNavigationProps =
    | PlatformStackScreenProps<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackScreenProps<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>;

type ReportScreenProps = ReportScreenNavigationProps & {
    /** Whether the report screen is being displayed in the side panel */
    isInSidePanel?: boolean;
};

const defaultReportMetadata = {
    hasOnceLoadedReportActions: false,
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    isOptimisticReport: false,
};

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
 *
 * @param report
 */
function isEmpty(report: OnyxEntry<OnyxTypes.Report>): boolean {
    if (isEmptyObject(report)) {
        return true;
    }
    return !Object.values(report).some((value) => value !== undefined && value !== '');
}

function ReportScreen({route, navigation, isInSidePanel = false}: ReportScreenProps) {
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lightbulb']);
    const {translate} = useLocalize();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const reportActionIDFromRoute = route?.params?.reportActionID;
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    const [firstRender, setFirstRender] = useState(true);
    const isSkippingOpenReport = useRef(false);
    const flatListRef = useRef<FlatList>(null);
    const hasCreatedLegacyThreadRef = useRef(false);
    const {isBetaEnabled} = usePermissions();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();

    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();

    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportIDFromRoute}`, {canBeMissing: true});
    const [accountManagerReportID] = useOnyx(ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID, {canBeMissing: true});
    const [accountManagerReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(accountManagerReportID)}`, {canBeMissing: true});
    const [userLeavingStatus = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportIDFromRoute}`, {canBeMissing: true});
    const [reportOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`, {allowStaleData: true, canBeMissing: true});
    const [reportNameValuePairsOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportIDFromRoute}`, {allowStaleData: true, canBeMissing: true});
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {canBeMissing: true, allowStaleData: true});
    const [policies = getEmptyObject<NonNullable<OnyxCollection<OnyxTypes.Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {allowStaleData: true, canBeMissing: false});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: false});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});

    const parentReportAction = useParentReportAction(reportOnyx);

    const deletedParentAction = isDeletedParentAction(parentReportAction);
    const prevDeletedParentAction = usePrevious(deletedParentAction);

    const permissions = useDeepCompareRef(reportOnyx?.permissions);

    const isAnonymousUser = useIsAnonymousUser();
    const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {canBeMissing: true});
    const prevIsLoadingReportData = usePrevious(isLoadingReportData);
    const prevIsAnonymousUser = useRef(false);

    useFocusEffect(
        useCallback(() => {
            // Don't update if there is a reportID in the params already
            if (route.params.reportID) {
                const reportActionID = route?.params?.reportActionID;
                const isValidReportActionID = reportActionID && isNumeric(reportActionID);
                if (reportActionID && !isValidReportActionID) {
                    Navigation.isNavigationReady().then(() => navigation.setParams({reportActionID: ''}));
                }
                return;
            }

            const lastAccessedReportID = findLastAccessedReport(!isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS), 'openOnAdminRoom' in route.params && !!route.params.openOnAdminRoom)?.reportID;

            // It's possible that reports aren't fully loaded yet
            // in that case the reportID is undefined
            if (!lastAccessedReportID) {
                return;
            }
            Navigation.isNavigationReady().then(() => {
                Log.info(`[ReportScreen] no reportID found in params, setting it to lastAccessedReportID: ${lastAccessedReportID}`);
                navigation.setParams({reportID: lastAccessedReportID});
            });
        }, [isBetaEnabled, navigation, route.params]),
    );

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const chatWithAccountManagerText = useMemo(() => {
        if (accountManagerReportID) {
            const participants = getParticipantsAccountIDsForDisplay(accountManagerReport, false, true);
            const participantPersonalDetails = getPersonalDetailsForAccountIDs([participants?.at(0) ?? -1], personalDetails);
            const participantPersonalDetail = Object.values(participantPersonalDetails).at(0);
            const displayName = getDisplayNameOrDefault(participantPersonalDetail);
            const login = participantPersonalDetail?.login;
            if (displayName && login) {
                return translate('common.chatWithAccountManager', `${displayName} (${login})`);
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
                created: reportOnyx.created,
                hasParentAccess: reportOnyx.hasParentAccess,
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
                nextStep: reportOnyx.nextStep,
            },
        [reportOnyx, reportNameValuePairsOnyx?.private_isArchived, permissions],
    );
    const reportID = report?.reportID;

    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`, {canBeMissing: true});
    const prevReport = usePrevious(report);
    const prevUserLeavingStatus = usePrevious(userLeavingStatus);
    const lastReportIDFromRoute = usePrevious(reportIDFromRoute);
    const [isLinkingToMessage, setIsLinkingToMessage] = useState(!!reportActionIDFromRoute);

    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector, canBeMissing: false});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {canBeMissing: true});
    const {reportActions: unfilteredReportActions, linkedAction, sortedAllReportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID, reportActionIDFromRoute);
    // wrapping in useMemo because this is array operation and can cause performance issues
    const reportActions = useMemo(() => getFilteredReportActionsForReportView(unfilteredReportActions), [unfilteredReportActions]);
    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${linkedAction?.childReportID}`, {canBeMissing: true});

    const [isBannerVisible, setIsBannerVisible] = useState(true);
    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({});

    const viewportOffsetTop = useViewportOffsetTop();

    const {reportPendingAction, reportErrors} = getReportOfflinePendingActionAndErrors(report);
    const screenWrapperStyle: ViewStyle[] = [styles.appContent, styles.flex1, {marginTop: viewportOffsetTop}];
    const isOptimisticDelete = report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;

    const {wasDeleted: reportWasDeleted, parentReportID: deletedReportParentID} = useReportWasDeleted(reportIDFromRoute, report, isOptimisticDelete, userLeavingStatus);

    const indexOfLinkedMessage = useMemo(
        (): number => reportActions.findIndex((obj) => reportActionIDFromRoute && String(obj.reportActionID) === String(reportActionIDFromRoute)),
        [reportActions, reportActionIDFromRoute],
    );

    const doesCreatedActionExists = useCallback(() => !!reportActions?.findLast((action) => isCreatedAction(action)), [reportActions]);
    const isLinkedMessageAvailable = indexOfLinkedMessage > -1;

    // The linked report actions should have at least 15 messages (counting as 1 page) above them to fill the screen.
    // If the count is too high (equal to or exceeds the web pagination size / 50) and there are no cached messages in the report,
    // OpenReport will be called each time the user scrolls up the report a bit, clicks on report preview, and then goes back.
    const isLinkedMessagePageReady = isLinkedMessageAvailable && (reportActions.length - indexOfLinkedMessage >= CONST.REPORT.MIN_INITIAL_REPORT_ACTION_COUNT || doesCreatedActionExists());
    const {transactions: allReportTransactions, violations: allReportViolations} = useTransactionsAndViolationsForReport(reportIDFromRoute);
    const hasPendingDeletionTransaction = Object.values(allReportTransactions ?? {}).some((transaction) => transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const reportTransactions = useMemo(() => getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true), [allReportTransactions, reportActions, isOffline]);
    // wrapping in useMemo because this is array operation and can cause performance issues
    const visibleTransactions = useMemo(
        () => reportTransactions?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
        [reportTransactions, isOffline],
    );
    const reportTransactionIDs = useMemo(() => visibleTransactions?.map((transaction) => transaction.transactionID), [visibleTransactions]);

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, {canBeMissing: true});
    const [transactionThreadReportActions = getEmptyObject<OnyxTypes.ReportActions>()] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`, {
        canBeMissing: true,
    });
    const combinedReportActions = getCombinedReportActions(reportActions, transactionThreadReportID ?? null, Object.values(transactionThreadReportActions));
    const isSentMoneyReport = useMemo(() => reportActions.some((action) => isSentMoneyReportAction(action)), [reportActions]);
    const lastReportAction = [...combinedReportActions, parentReportAction].find((action) => canEditReportAction(action) && !isMoneyRequestAction(action));
    // wrapping in useMemo to stabilize children re-rendering
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
    const isTopMostReportId = currentReportIDValue === reportIDFromRoute;
    const didSubscribeToReportLeavingEvents = useRef(false);
    const isTransactionThreadView = isReportTransactionThread(report);
    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    // Prevent the empty state flash by ensuring transaction data is fully loaded before deciding which view to render
    // We need to wait for both the selector to finish AND ensure we're not in a loading state where transactions could still populate
    const shouldWaitForTransactions = shouldWaitForTransactionsUtil(report, reportTransactions, reportMetadata, isOffline);

    const newTransactions = useNewTransactions(reportMetadata?.hasOnceLoadedReportActions, reportTransactions);

    const {closeSidePanel} = useSidePanel();

    useEffect(() => {
        if (
            !isFocused ||
            !reportIDFromRoute ||
            report?.reportID ||
            reportMetadata?.isLoadingInitialReportActions ||
            reportMetadata?.isOptimisticReport ||
            isLoadingApp ||
            userLeavingStatus
        ) {
            return;
        }

        Navigation.goBack();
    }, [isFocused, reportIDFromRoute, report?.reportID, reportMetadata?.isLoadingInitialReportActions, reportMetadata?.isOptimisticReport, isLoadingApp, userLeavingStatus]);

    useEffect(() => {
        if (!prevIsFocused || isFocused) {
            return;
        }
        hideEmojiPicker(true);
    }, [prevIsFocused, isFocused]);

    const backTo = route?.params?.backTo as string;
    const onBackButtonPress = useCallback(
        (prioritizeBackTo = false) => {
            if (isInSidePanel) {
                closeSidePanel();
                return;
            }
            if (backTo === SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
                Navigation.goBack();
                return;
            }
            if (prioritizeBackTo && backTo) {
                Navigation.goBack(backTo as Route);
                return;
            }
            if (isInNarrowPaneModal) {
                Navigation.goBack();
                return;
            }
            if (backTo) {
                Navigation.goBack(backTo as Route);
                return;
            }
            if (Navigation.getShouldPopToSidebar()) {
                Navigation.popToSidebar();
                return;
            }
            Navigation.goBack();
        },
        [isInSidePanel, backTo, isInNarrowPaneModal, closeSidePanel],
    );

    const headerView = useMemo(() => {
        if (isTransactionThreadView) {
            return (
                <MoneyRequestHeader
                    report={report}
                    policy={policy}
                    parentReportAction={parentReportAction}
                    onBackButtonPress={onBackButtonPress}
                />
            );
        }

        if (isMoneyRequestOrInvoiceReport) {
            return (
                <MoneyReportHeader
                    report={report}
                    policy={policy}
                    transactionThreadReportID={transactionThreadReportID}
                    isLoadingInitialReportActions={reportMetadata.isLoadingInitialReportActions}
                    reportActions={reportActions}
                    onBackButtonPress={onBackButtonPress}
                />
            );
        }

        return (
            <HeaderView
                reportID={reportIDFromRoute}
                onNavigationMenuButtonClicked={onBackButtonPress}
                report={report}
                parentReportAction={parentReportAction}
                shouldUseNarrowLayout={shouldUseNarrowLayout}
                isInSidePanel={isInSidePanel}
            />
        );
    }, [
        isTransactionThreadView,
        isMoneyRequestOrInvoiceReport,
        report,
        policy,
        parentReportAction,
        onBackButtonPress,
        transactionThreadReportID,
        reportMetadata.isLoadingInitialReportActions,
        reportActions,
        reportIDFromRoute,
        shouldUseNarrowLayout,
        isInSidePanel,
    ]);

    useEffect(() => {
        if (!transactionThreadReportID || !route?.params?.reportActionID || !isOneTransactionThread(childReport, report, linkedAction)) {
            return;
        }
        navigation.setParams({reportActionID: ''});
    }, [transactionThreadReportID, route?.params?.reportActionID, linkedAction, reportID, navigation, report, childReport]);

    const isReportArchived = useReportIsArchived(report?.reportID);
    const {isEditingDisabled, isCurrentReportLoadedFromOnyx} = useIsReportReadyToDisplay(report, reportIDFromRoute, isReportArchived);

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
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
    const shouldShowNotFoundPage = useMemo((): boolean => {
        const isInvalidReportPath = !!currentReportIDFormRoute && !isValidReportIDFromPath(currentReportIDFormRoute);
        const isLoading = isLoadingApp !== false || isLoadingReportData || !!reportMetadata?.isLoadingInitialReportActions;
        const reportExists = !!reportID || isOptimisticDelete || userLeavingStatus;

        if (shouldShowNotFoundLinkedAction) {
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
    ]);

    const createOneTransactionThreadReport = useCallback(() => {
        const currentReportTransaction = getReportTransactions(reportID).filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        const oneTransactionID = currentReportTransaction.at(0)?.transactionID;
        const iouAction = getIOUActionForReportID(reportID, oneTransactionID);
        createTransactionThreadReport(report, iouAction, currentReportTransaction.at(0));
    }, [report, reportID]);

    const isInviteOnboardingComplete = introSelected?.isInviteOnboardingComplete ?? false;
    const isOnboardingCompleted = onboarding?.hasCompletedGuidedSetupFlow ?? false;

    const fetchReport = useCallback(() => {
        if (reportMetadata.isOptimisticReport && report?.type === CONST.REPORT.TYPE.CHAT && !isPolicyExpenseChat(report)) {
            return;
        }

        if (report?.errorFields?.notFound && isOffline) {
            return;
        }

        // If there is one transaction thread that has not yet been created, we should create it.
        if (transactionThreadReportID === CONST.FAKE_REPORT_ID && !transactionThreadReport) {
            createOneTransactionThreadReport();
            return;
        }

        // When a user goes through onboarding for the first time, various tasks are created for chatting with Concierge.
        // If this function is called too early (while the application is still loading), we will not have information about policies,
        // which means we will not be able to obtain the correct link for one of the tasks.
        // More information here: https://github.com/Expensify/App/issues/71742
        if (isLoadingApp && introSelected && !isOnboardingCompleted && !isInviteOnboardingComplete) {
            const {choice, inviteType} = introSelected;
            const isInviteIOUorInvoice = inviteType === CONST.ONBOARDING_INVITE_TYPES.IOU || inviteType === CONST.ONBOARDING_INVITE_TYPES.INVOICE;
            const isInviteChoiceCorrect = choice === CONST.ONBOARDING_CHOICES.ADMIN || choice === CONST.ONBOARDING_CHOICES.SUBMIT || choice === CONST.ONBOARDING_CHOICES.CHAT_SPLIT;

            if (isInviteChoiceCorrect && !isInviteIOUorInvoice) {
                return;
            }
        }

        openReport(reportIDFromRoute, introSelected, reportActionIDFromRoute);
    }, [
        reportMetadata.isOptimisticReport,
        report,
        isOffline,
        transactionThreadReportID,
        transactionThreadReport,
        reportIDFromRoute,
        reportActionIDFromRoute,
        createOneTransactionThreadReport,
        isLoadingApp,
        introSelected,
        isOnboardingCompleted,
        isInviteOnboardingComplete,
    ]);

    useEffect(() => {
        if (!isAnonymousUser) {
            return;
        }
        prevIsAnonymousUser.current = true;
    }, [isAnonymousUser]);

    useEffect(() => {
        if (isLoadingReportData || !prevIsLoadingReportData || !prevIsAnonymousUser.current || isAnonymousUser) {
            return;
        }
        // Re-fetch public report data after user signs in and OpenApp API is called to
        // avoid reportActions data being empty for public rooms.
        fetchReport();
    }, [isLoadingReportData, prevIsLoadingReportData, prevIsAnonymousUser, isAnonymousUser, fetchReport]);

    const prevTransactionThreadReportID = usePrevious(transactionThreadReportID);
    useEffect(() => {
        // If transactionThreadReportID is undefined or CONST.FAKE_REPORT_ID, we do not call fetchReport.
        // Only when transactionThreadReportID changes to a valid value, the fetchReport will be called to fetch the data again for the current report.
        // Since fetchReport is always called once when opening a report,
        // if that initial call is used to create a transactionThreadReport,
        // then fetchReport needs to be called again after the transactionThreadReport has been fully created.
        const prevTransactionThreadReportIDWasValid = !!prevTransactionThreadReportID && prevTransactionThreadReportID !== CONST.FAKE_REPORT_ID;
        const transactionThreadReportIDUpdatedFromValidToFake = transactionThreadReportID === CONST.FAKE_REPORT_ID && !!prevTransactionThreadReportID;

        if (prevTransactionThreadReportIDWasValid || !transactionThreadReportID || transactionThreadReportIDUpdatedFromValidToFake) {
            return;
        }

        fetchReport();
    }, [fetchReport, prevTransactionThreadReportID, transactionThreadReportID]);

    useEffect(() => {
        if (!reportID || !isFocused || isInSidePanel) {
            return;
        }
        updateLastVisitTime(reportID);
    }, [reportID, isFocused, isInSidePanel]);

    useEffect(() => {
        const skipOpenReportListener = DeviceEventEmitter.addListener(`switchToPreExistingReport_${reportID}`, ({preexistingReportID}: {preexistingReportID: string}) => {
            if (!preexistingReportID) {
                return;
            }
            isSkippingOpenReport.current = true;
        });

        return () => {
            skipOpenReportListener.remove();

            // We need to cancel telemetry span when user leaves the screen before full report data is loaded
            cancelSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`);
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
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // This function is triggered when a user clicks on a link to navigate to a report.
        // For each link click, we retrieve the report data again, even though it may already be cached.
        // There should be only one openReport execution per page start or navigating
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route, isLinkedMessagePageReady, reportActionIDFromRoute]);

    const prevReportActions = usePrevious(reportActions);
    useEffect(() => {
        // This function is only triggered when a user is invited to a room after opening the link.
        // When a user opens a room they are not a member of, and the admin then invites them, only the INVITE_TO_ROOM action is available, so the background will be empty and room description is not available.
        // See https://github.com/Expensify/App/issues/57769 for more details
        if (prevReportActions.length !== 0 || reportActions.length !== 1 || reportActions.at(0)?.actionName !== CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM) {
            return;
        }
        fetchReport();
    }, [prevReportActions.length, reportActions, fetchReport]);

    // If a user has chosen to leave a thread, and then returns to it (e.g. with the back button), we need to call `openReport` again in order to allow the user to rejoin and to receive real-time updates
    useEffect(() => {
        if (!shouldUseNarrowLayout || !isFocused || prevIsFocused || !isChatThread(report) || !isHiddenForCurrentUser(report) || isTransactionThreadView) {
            return;
        }
        openReport(reportID, introSelected);

        // We don't want to run this useEffect every time `report` is changed
        // Excluding shouldUseNarrowLayout from the dependency list to prevent re-triggering on screen resize events.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prevIsFocused, report?.participants, isFocused, isTransactionThreadView, reportID]);

    useEffect(() => {
        // We don't want this effect to run on the first render.
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
            if (prevReport?.parentReportID) {
                // Prevent navigation to the IOU/Expense Report if it is pending deletion.
                if (isMoneyRequestReportPendingDeletion(prevReport.parentReportID)) {
                    return;
                }
                Navigation.isNavigationReady().then(() => {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(prevReport.parentReportID));
                });
                return;
            }

            Navigation.isNavigationReady().then(() => {
                navigateToConciergeChat(conciergeReportID, false);
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

    useEffect(() => {
        if (!reportWasDeleted) {
            return;
        }

        // Only redirect if focused
        if (!isFocused) {
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
            navigateToConciergeChat(conciergeReportID);
        });
    }, [reportWasDeleted, isFocused, deletedReportParentID, conciergeReportID]);

    useEffect(() => {
        if (!isValidReportIDFromPath(reportIDFromRoute)) {
            return;
        }
        // Ensures the optimistic report is created successfully
        if (reportIDFromRoute !== report?.reportID || report?.pendingFields?.createChat) {
            return;
        }
        // Ensures subscription event succeeds when the report/workspace room is created optimistically.
        // Check if the optimistic `OpenReport` or `AddWorkspaceRoom` has succeeded by confirming
        // any `pendingFields.createChat` or `pendingFields.addWorkspaceRoom` fields are set to null.
        // Existing reports created will have empty fields for `pendingFields`.
        const didCreateReportSuccessfully = !report?.pendingFields || (!report?.pendingFields.addWorkspaceRoom && !report?.pendingFields.createChat);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        let interactionTask: ReturnType<typeof InteractionManager.runAfterInteractions> | null = null;
        if (!didSubscribeToReportLeavingEvents.current && didCreateReportSuccessfully) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            interactionTask = InteractionManager.runAfterInteractions(() => {
                subscribeToReportLeavingEvents(reportIDFromRoute, currentUserAccountID);
                didSubscribeToReportLeavingEvents.current = true;
            });
        }
        return () => {
            if (!interactionTask) {
                return;
            }
            interactionTask.cancel();
        };
    }, [report?.reportID, didSubscribeToReportLeavingEvents, reportIDFromRoute, report?.pendingFields, currentUserAccountID]);

    const actionListValue = useMemo((): ActionListContextType => ({flatListRef, scrollPosition, setScrollPosition}), [flatListRef, scrollPosition, setScrollPosition]);

    // This helps in tracking from the moment 'route' triggers useMemo until isLoadingInitialReportActions becomes true. It prevents blinking when loading reportActions from cache.
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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

        // we want to do this distinguish between normal navigation and delete behavior
        if (lastReportActionIDFromRoute !== reportActionIDFromRoute) {
            setIsNavigatingToDeletedAction(true);
            return;
        }

        // Clear params when action gets deleted while highlighting
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

    // Reset the ref when navigating to a different report
    useEffect(() => {
        hasCreatedLegacyThreadRef.current = false;
    }, [reportID]);

    // When opening IOU report for single transaction, we will create IOU action and transaction thread
    // for legacy transaction that doesn't have IOU action
    useEffect(() => {
        // Skip if already created, coming from Search page, or thread already exists
        if (
            hasCreatedLegacyThreadRef.current ||
            route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT ||
            transactionThreadReport ||
            (transactionThreadReportID && transactionThreadReportID !== '0')
        ) {
            return;
        }

        // Only handle single transaction expense reports that are fully loaded
        const transaction = visibleTransactions?.at(0);
        if (!reportID || visibleTransactions?.length !== 1 || report?.type !== CONST.REPORT.TYPE.EXPENSE || !transaction?.transactionID) {
            return;
        }

        // Skip legacy transaction handling if:
        // - IOU action already exists (not a legacy transaction)
        // - Transaction is pending addition (new transaction, not legacy)
        const iouAction = getIOUActionForReportID(reportID, transaction.transactionID);
        if (iouAction || transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || !!transaction.linkedTrackedExpenseReportAction?.childReportID) {
            return;
        }

        // Mark as created BEFORE calling to prevent race conditions
        hasCreatedLegacyThreadRef.current = true;

        // For legacy transactions, pass undefined as IOU action and the transaction object
        // It will be created optimistically and in the backend when call openReport
        createTransactionThreadReport(report, undefined, transaction);
    }, [report, visibleTransactions, transactionThreadReport, transactionThreadReportID, reportID, route.name]);

    const lastRoute = usePrevious(route);

    // wrapping into useMemo to stabilize children re-renders as reportMetadata is changed frequently
    const showReportActionsLoadingState = useMemo(
        () => reportMetadata?.isLoadingInitialReportActions && !reportMetadata?.hasOnceLoadedReportActions,
        [reportMetadata?.isLoadingInitialReportActions, reportMetadata?.hasOnceLoadedReportActions],
    );

    // In this case we want to use this value. The  shouldUseNarrowLayout will always be true as this case is handled when we display ReportScreen in RHP.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    // If true reports that are considered MoneyRequest | InvoiceReport will get the new report table view
    const shouldDisplayMoneyRequestActionsList = isMoneyRequestOrInvoiceReport && shouldDisplayReportTableView(report, visibleTransactions ?? []);

    // WideRHP should be visible only on wide layout when report is opened in RHP and contains only one expense.
    // This view is only available for reports of type CONST.REPORT.TYPE.EXPENSE or CONST.REPORT.TYPE.IOU.
    const shouldShowWideRHP =
        route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT &&
        !isSmallScreenWidth &&
        !shouldDisplayMoneyRequestActionsList &&
        (isTransactionThread(parentReportAction) ||
            parentReportAction?.childType === CONST.REPORT.TYPE.EXPENSE ||
            parentReportAction?.childType === CONST.REPORT.TYPE.IOU ||
            report?.type === CONST.REPORT.TYPE.EXPENSE ||
            report?.type === CONST.REPORT.TYPE.IOU);

    useShowWideRHPVersion(shouldShowWideRHP);

    // Define here because reportActions are recalculated before mount, allowing data to display faster than useEffect can trigger.
    // If we have cached reportActions, they will be shown immediately.
    // We aim to display a loader first, then fetch relevant reportActions, and finally show them.
    if ((lastRoute !== route || lastReportActionIDFromRoute !== reportActionIDFromRoute) && isLinkingToMessage !== !!reportActionIDFromRoute) {
        setIsLinkingToMessage(!!reportActionIDFromRoute);
        return null;
    }

    return (
        // Wide RHP overlays should be rendered only for the report screen displayed in RHP
        <WideRHPOverlayWrapper shouldWrap={route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT}>
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
                            <DragAndDropProvider isDisabled={isEditingDisabled}>
                                <OfflineWithFeedback
                                    pendingAction={reportPendingAction ?? report?.pendingFields?.reimbursed}
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
                                        icon={expensifyIcons.Lightbulb}
                                        shouldShowIcon
                                        shouldShowButton
                                    />
                                )}
                                <View style={[styles.flex1, styles.flexRow]}>
                                    {shouldShowWideRHP && (
                                        <Animated.View style={styles.wideRHPMoneyRequestReceiptViewContainer}>
                                            <ScrollView contentContainerStyle={styles.wideRHPMoneyRequestReceiptViewScrollViewContainer}>
                                                <MoneyRequestReceiptView
                                                    allReports={allReports}
                                                    report={transactionThreadReport ?? report}
                                                    fillSpace
                                                    isDisplayedInWideRHP
                                                />
                                            </ScrollView>
                                        </Animated.View>
                                    )}
                                    <View
                                        style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                                        testID="report-actions-view-wrapper"
                                    >
                                        {(!report || shouldWaitForTransactions) && <ReportActionsSkeletonView />}
                                        {!!report && !shouldDisplayMoneyRequestActionsList && !shouldWaitForTransactions ? (
                                            <ReportActionsView
                                                report={report}
                                                reportActions={reportActions}
                                                isLoadingInitialReportActions={reportMetadata?.isLoadingInitialReportActions}
                                                hasNewerActions={hasNewerActions}
                                                hasOlderActions={hasOlderActions}
                                                parentReportAction={parentReportAction}
                                                transactionThreadReportID={transactionThreadReportID}
                                                isReportTransactionThread={isTransactionThreadView}
                                            />
                                        ) : null}
                                        {!!report && shouldDisplayMoneyRequestActionsList && !shouldWaitForTransactions ? (
                                            <MoneyRequestReportActionsList
                                                report={report}
                                                hasPendingDeletionTransaction={hasPendingDeletionTransaction}
                                                policy={policy}
                                                reportActions={reportActions}
                                                transactions={visibleTransactions}
                                                newTransactions={newTransactions}
                                                violations={allReportViolations}
                                                hasOlderActions={hasOlderActions}
                                                hasNewerActions={hasNewerActions}
                                                showReportActionsLoadingState={showReportActionsLoadingState}
                                                reportPendingAction={reportPendingAction}
                                            />
                                        ) : null}
                                        {isCurrentReportLoadedFromOnyx ? (
                                            <ReportFooter
                                                report={report}
                                                reportMetadata={reportMetadata}
                                                policy={policy}
                                                pendingAction={reportPendingAction}
                                                isComposerFullSize={!!isComposerFullSize}
                                                lastReportAction={lastReportAction}
                                                reportTransactions={reportTransactions}
                                                // If the report is from the 'Send Money' flow, we add the comment to the `iou` report because for these we don't combine reportActions even if there is a single transaction (they always have a single transaction)
                                                transactionThreadReportID={isSentMoneyReport ? undefined : transactionThreadReportID}
                                                isInSidePanel={isInSidePanel}
                                            />
                                        ) : null}
                                    </View>
                                </View>
                                <PortalHost name="suggestions" />
                            </DragAndDropProvider>
                        </FullPageNotFoundView>
                    </ScreenWrapper>
                </ReactionListWrapper>
            </ActionListContext.Provider>
        </WideRHPOverlayWrapper>
    );
}

// eslint-disable-next-line rulesdir/no-deep-equal-in-memo
export default memo(ReportScreen, (prevProps, nextProps) => deepEqual(prevProps.route, nextProps.route));
