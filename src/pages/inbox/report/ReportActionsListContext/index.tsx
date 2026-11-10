/** Own list subscriptions, preparation, and remembered choices so content consumes finished rows. */
import useCopySelectionEvent from '@hooks/useCopySelectionEvent';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useIsAppLoadPending, useIsReportLoadPending} from '@hooks/useInFlightRequests';
import useInitial from '@hooks/useInitial';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePendingConciergeResponse from '@hooks/usePendingConciergeResponse';
import {useAllPersonalDetails, usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import usePrevious from '@hooks/usePrevious';
import useSidePanelState from '@hooks/useSidePanelState';

import {getReportPreviewReportAction} from '@libs/actions/IOU/MoneyRequestBuilder';
import DateUtils from '@libs/DateUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getReportActionsCursors from '@libs/getReportActionsCursors';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {
    getCombinedReportActions,
    getFilteredReportActionsForReportView,
    getOneTransactionThreadReportID,
    getSortedReportActionsForDisplay,
    isCreatedAction,
    isCurrentUserPendingAddAction,
    isReportActionFromCurrentUser,
    isTransactionThread,
    wasMessageReceivedWhileOffline,
    getFeedbackPromptActionIDs,
    getFirstVisibleReportActionID,
} from '@libs/ReportActionsUtils';
import {
    canUserPerformWriteAction,
    isArchivedReport,
    isConciergeChatReport,
    isExpenseReport,
    isInvoiceReport,
    isMoneyRequestReport,
    isReportTransactionThread,
    shouldReportAlignToTop,
} from '@libs/ReportUtils';
import Visibility from '@libs/Visibility';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import {useActionListContext} from '@pages/inbox/ActionListContext';
import {useConciergeChatHistoryActions, useConciergeChatHistoryState} from '@pages/inbox/ConciergeChatHistoryContext';
import {useConciergeDraft, useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import AskConciergeWelcome from '@pages/inbox/report/AskConciergeWelcome';
import getReportActionsToDisplay from '@pages/inbox/report/getReportActionsToDisplay';
import ReportActionsLoadingSkeleton from '@pages/inbox/report/ReportActionsLoadingSkeleton';
import {getUnreadMarkerReportAction} from '@pages/inbox/report/shouldDisplayNewMarkerOnReportAction';

import type {ReportHierarchyInfo} from '@userActions/ClearReportActionErrors';
import {getNewerActions, getOlderActions} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {getStableReportSelector, reportParentChainSelector} from '@src/selectors/Report';
import {reportActionsListLoadingStateSelector} from '@src/selectors/ReportMetaData';
import type {
    Report,
    ReportAction,
    ReportActions,
    ReportAttributesDerivedValue,
    ReportNameValuePairs,
    PersonalDetailsList,
    ReportTransactionsAndViolationsDerivedValue,
    Session,
    Transaction,
} from '@src/types/onyx';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {ReactNode} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useIsFocused, useRoute} from '@react-navigation/native';
import {delegateEmailSelector} from '@selectors/Account';
import {getCustomAgentAccountIDs} from '@selectors/AgentZeroChat';
import {getParentReportActionSelector, reportVisibleActionsSelector} from '@selectors/ReportAction';
import React, {createContext, useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';

import type {ReportActionsReadinessSignals} from './getReportActionsLoadingState';

import getConciergeChatHistoryAndWelcome from './getConciergeChatHistoryAndWelcome';
import getReportActionsLoadingState from './getReportActionsLoadingState';
import getReportActionsPage from './getReportActionsPage';
import getReportActionsRows from './getReportActionsRows';
import {getDisplayReportActions, getVisibleReportActions} from './getVisibleReportActions';

type ListReportMetadata = Pick<ReportNameValuePairs, 'private_isArchived' | 'origin' | 'originalID' | 'billID' | 'conciergeFeedbackForReportActionID'>;
type ListRows = Omit<ReturnType<typeof getReportActionsRows>, 'persistedDraftAction' | 'isSyntheticDraftVisible' | 'revealedActionIDs'>;
type ReportActionsListState = ListRows & {
    report: OnyxEntry<Report>;
    reportStable: OnyxEntry<Report>;
    chatReportStable: OnyxEntry<Report>;
    reportNameValuePairs: ListReportMetadata;
    reportAttributes: Pick<NonNullable<ReportAttributesDerivedValue['reports'][string]>, 'actionBadge' | 'actionTargetReportActionID' | 'brickRoadStatus'> | undefined;
    reportsParentHierarchy: OnyxCollection<ReportHierarchyInfo>;
    isReportArchived: boolean;
    isOffline: boolean;
    shouldShowOfflineSkeleton: boolean;
    linkedReportActionID: string | undefined;
    hasOnceLoadedReportActions: boolean | undefined;
    hasNewerActions: boolean;
    sortedAllReportActions: ReportAction[] | undefined;
    oldestUnreadReportAction: ReportAction | undefined;
    transactionThreadReport: OnyxEntry<Report>;
    parentReportActionForTransactionThread: OnyxEntry<ReportAction>;
    parentReportAction: OnyxEntry<ReportAction>;
    treatAsNoPaginationAnchor: boolean;
    isConciergeHiddenHistory: boolean;
    isConciergeHistoryExpanded: boolean;
    showFullHistory: boolean;
    hasPreviousMessages: boolean;
    shouldShowConciergeWelcome: boolean;
    hasScrolledOverThreshold: boolean;
    unreadMarkerReportActionID: string | null;
    expandedSystemMessageReportActionIDs: ReadonlySet<string>;
    focusRequestedReportActionID: string | undefined;
    readReportActions: ReportAction[];
    scrollReportActions: ReportAction[];
    firstVisibleReportActionID: string | undefined;
    latestConciergeFeedbackActionIDs: string[];
};
type ReportActionsListActions = {
    loadOlderChats: (force?: boolean) => void;
    loadNewerChats: (force?: boolean) => void;
    setTreatAsNoPaginationAnchor: (value: boolean) => void;
    handleShowPreviousMessages: () => void;
    collapseConciergeHistory: () => void;
    setHasScrolledOverThreshold: (value: boolean) => void;
    expandSystemMessageRun: (actionIDs: string[]) => void;
    consumeSystemMessageFocusRequest: (actionID: string) => boolean;
};
type ReportActionsListProviderProps = {reportID: string; children: ReactNode};

const ReportActionsListStateContext = createContext<ReportActionsListState | null>(null);
const ReportActionsListActionsContext = createContext<ReportActionsListActions | null>(null);

const reportMetadataSelector = (value: OnyxEntry<ReportNameValuePairs>) => ({
    private_isArchived: value?.private_isArchived,
    origin: value?.origin,
    originalID: value?.originalID,
    billID: value?.billID,
    conciergeFeedbackForReportActionID: value?.conciergeFeedbackForReportActionID,
    reopenedAsReportID: value?.reopenedAsReportID,
});
const sessionSelector = (value: OnyxEntry<Session>) => ({accountID: value?.accountID, authTokenType: value?.authTokenType});

function ReportActionsListProvider({reportID, children}: ReportActionsListProviderProps) {
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const linkedReportActionID = route.params?.reportActionID;
    const isFocused = useIsFocused();
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const {isOffline, lastOfflineAt: lastOfflineTime} = useNetwork();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const isInSidePanel = useIsInSidePanel();
    const {sessionStartTime} = useSidePanelState();
    const {getScrollOffset} = useActionListContext();
    const mainHistory = useConciergeChatHistoryState();
    const {setShowFullHistory: setMainHistoryExpanded, collapseHistory} = useConciergeChatHistoryActions();
    const {draftReportAction, isDraftPendingCompletion} = useConciergeDraft();
    const {clearDraft, revealDraftFromReportAction} = useConciergeDraftActions();

    // Shared report inputs stay here; helpers receive these values rather than reading the store again.
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {selector: reportMetadataSelector});
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: sessionSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`, {selector: reportActionsListLoadingStateSelector});
    const [paginationState] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_PAGINATION_STATE}${reportID}`);
    const isReportLoadPending = useIsReportLoadPending(reportID);
    const isLoadingApp = useIsAppLoadPending();
    const isReportArchived = !!isArchivedReport(reportMetadata);
    const canWrite = !!canUserPerformWriteAction(report, isReportArchived);
    const parentActionSelector = (actions: OnyxEntry<ReportActions>) => getParentReportActionSelector(actions, report?.parentReportActionID);
    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {selector: parentActionSelector});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`);
    const previewSelector = (actions: OnyxEntry<ReportActions>) => getReportPreviewReportAction(report?.chatReportID, reportID, actions);
    const [reportPreviewAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.chatReportID)}`, {selector: previewSelector});
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const delegateSelector = (details: OnyxEntry<PersonalDetailsList>) =>
        delegateEmail ? Object.values(details ?? {}).find((detail) => detail?.login?.toLowerCase() === delegateEmail.toLowerCase())?.accountID : undefined;
    const [delegateAccountID] = useAllPersonalDetails(delegateSelector);

    const [rawReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const cachedActions = rawReportActions ? getSortedReportActionsForDisplay(rawReportActions, canWrite, true, undefined, reportID) : undefined;
    const [pages] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${reportID}`);
    const [firstRenderLastReadTime] = useState(report?.lastReadTime);
    const firstDefinedLastReadTime = useInitial(report?.lastReadTime);
    const [treatAsNoPaginationAnchor, setTreatAsNoPaginationAnchor] = useState(false);
    const isConciergeChat = isConciergeChatReport(report, conciergeReportID);
    const shouldBeAlignedToTop = shouldReportAlignToTop(report, parentReportAction);
    const selectedPage = getReportActionsPage({
        cachedActions,
        pages,
        linkedActionID: linkedReportActionID,
        initialLastReadTime: isConciergeChat ? firstDefinedLastReadTime : firstRenderLastReadTime,
        shouldLinkToUnread: !shouldBeAlignedToTop,
        shouldIgnoreAnchor: treatAsNoPaginationAnchor,
    });
    const reportPageActions = getFilteredReportActionsForReportView(selectedPage.pageActions);
    const transactionsSelector = (value: OnyxEntry<ReportTransactionsAndViolationsDerivedValue>) => ({transactions: value?.[reportID]?.transactions, isLoaded: value !== undefined});
    const [transactionsData] = useOnyx(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS, {selector: transactionsSelector});
    const transactions = transactionsData?.transactions ?? getEmptyObject<Record<string, Transaction>>();
    const threadTransactions = getAllNonDeletedTransactions(transactions, reportPageActions, isOffline, true).filter(
        (transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );
    const transactionThreadReportID = getOneTransactionThreadReportID(
        report,
        chatReport,
        reportPageActions,
        isOffline,
        threadTransactions.map((transaction) => transaction.transactionID),
    );
    const [rawThreadActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`);
    const threadActions = rawThreadActions ? getSortedReportActionsForDisplay(rawThreadActions, canWrite, true, undefined, transactionThreadReportID) : undefined;
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
    const parentReportActionForTransactionThread = isEmptyObject(threadActions)
        ? undefined
        : reportPageActions.find((action) => action.reportActionID === transactionThreadReport?.parentReportActionID);

    const attributesSelector = (value: OnyxEntry<ReportAttributesDerivedValue>) => {
        const attrs = value?.reports?.[reportID];
        return attrs
            ? {isEmpty: attrs.isEmpty, actionBadge: attrs.actionBadge, actionTargetReportActionID: attrs.actionTargetReportActionID, brickRoadStatus: attrs.brickRoadStatus}
            : undefined;
    };
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: attributesSelector});
    const [visibleActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {selector: reportVisibleActionsSelector(reportID)});
    const hasFailedSend = isConciergeChat && !isInSidePanel && Object.values(rawReportActions ?? {}).some((action) => !isEmptyObject(action.errors));
    // Rows need a stable projection even when read timestamps update the full report above.
    const [reportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getStableReportSelector});
    const [chatReportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`, {selector: getStableReportSelector});
    const [reportsParentHierarchy] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: reportParentChainSelector(reportID)});

    // Recompute page-derived values below the dependent thread subscriptions so the compiler can cache them.
    const page = getReportActionsPage({
        cachedActions,
        pages,
        linkedActionID: linkedReportActionID,
        initialLastReadTime: isConciergeChat ? firstDefinedLastReadTime : firstRenderLastReadTime,
        shouldLinkToUnread: !shouldBeAlignedToTop,
        shouldIgnoreAnchor: treatAsNoPaginationAnchor,
    });
    const savedPageActions = getFilteredReportActionsForReportView(page.pageActions);
    const lastPageAction = savedPageActions.at(-1);
    const shouldAddCreatedAction = !isCreatedAction(lastPageAction) && (isMoneyRequestReport(report) || isInvoiceReport(report) || isReportTransactionThread(report) || isConciergeChat);
    const pageWithOfflineActions = getReportActionsToDisplay(
        savedPageActions,
        lastPageAction,
        report,
        reportPreviewAction,
        transactionThreadReport,
        shouldAddCreatedAction,
        getCurrencyDecimals,
        delegateAccountID,
    );
    const pageActions = getCombinedReportActions(pageWithOfflineActions, transactionThreadReportID ?? null, threadActions ?? []);
    const ownActionIDs = savedPageActions.map((action) => action.reportActionID);
    const persistedReportActionIDs = [...ownActionIDs, ...(threadActions ?? []).map((action) => action.reportActionID)];
    const cursors = getReportActionsCursors(pageActions, ownActionIDs);
    const oldestReportActionID = cursors.oldestReportAction?.reportActionID;
    const newestReportActionID = cursors.newestReportAction?.reportActionID;
    const oldestThreadActionID = cursors.oldestThreadAction?.reportActionID;
    const newestThreadActionID = cursors.newestThreadAction?.reportActionID;
    const isRealThread = !!transactionThreadReportID && transactionThreadReportID !== CONST.FAKE_REPORT_ID;
    const newestFetchedActionID = paginationState?.newestFetchedReportActionID;
    const newestPageActionID = pageActions.at(0)?.reportActionID;
    const canLoadNewer = isFocused && pageActions.length > 0 && page.hasNewerActions && !isOffline && pageActions.at(0)?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const loadOlderChats = (force = false) => {
        if ((!force && isOffline) || pageActions.length === 0 || !page.hasOlderActions) {
            return;
        }
        getOlderActions(reportID, oldestReportActionID);
        if (isRealThread) {
            getOlderActions(transactionThreadReportID, oldestThreadActionID);
        }
    };
    const loadNewerChats = (force = false) => {
        if (!force && !canLoadNewer) {
            return;
        }
        if (newestFetchedActionID || isRealThread) {
            getNewerActions(reportID, newestFetchedActionID ?? newestReportActionID);
            if (isRealThread) {
                getNewerActions(transactionThreadReportID, newestThreadActionID);
            }
        } else if (newestPageActionID) {
            getNewerActions(reportID, newestPageActionID);
        }
    };
    const transactionIDs = transactionsData?.isLoaded ? getAllNonDeletedTransactions(transactions, savedPageActions).map((transaction) => transaction.transactionID) : undefined;
    const visiblePageActions = getVisibleReportActions({
        reportID,
        report,
        actions: pageActions,
        reportActions: rawReportActions,
        threadReport: transactionThreadReport,
        threadActions: rawThreadActions,
        visibleActionsData,
        transactionIDs,
        canWrite,
        currentUserAccountID: session?.accountID ?? currentUserAccountID,
        isOffline,
    });

    const isConciergeSidePanel = isConciergeChat && isInSidePanel;
    const isConciergeMainChat = isConciergeChat && !isInSidePanel;
    const hasUserSentMessage =
        isConciergeSidePanel &&
        !!sessionStartTime &&
        savedPageActions.some(
            (action) =>
                !isCreatedAction(action) &&
                action.actorAccountID === currentUserAccountID &&
                (isCurrentUserPendingAddAction(action, currentUserAccountID) || action.created >= sessionStartTime),
        );
    const hasUnreadConciergeMessageFromOthers =
        isConciergeMainChat && !!report?.lastReadTime && (report.lastVisibleActionCreated ?? '') > report.lastReadTime && report.lastActorAccountID !== currentUserAccountID;
    const [showSidePanelHistory, setShowSidePanelHistory] = useState(false);
    const [previousSessionTime, setPreviousSessionTime] = useState(sessionStartTime);
    const [previousHasUserSentMessage, setPreviousHasUserSentMessage] = useState(hasUserSentMessage);
    const [sessionSentActionIDs, setSessionSentActionIDs] = useState<ReadonlySet<string>>(() => new Set());
    if (previousSessionTime !== sessionStartTime) {
        setPreviousSessionTime(sessionStartTime);
        setShowSidePanelHistory(false);
        setSessionSentActionIDs(new Set());
    } else if (previousHasUserSentMessage !== hasUserSentMessage) {
        setPreviousHasUserSentMessage(hasUserSentMessage);
        if (previousHasUserSentMessage) {
            setShowSidePanelHistory(false);
        }
    }
    const pendingSentIDs =
        isConciergeSidePanel && sessionStartTime
            ? visiblePageActions.filter((action) => isCurrentUserPendingAddAction(action, currentUserAccountID)).map((action) => action.reportActionID)
            : [];
    if (pendingSentIDs.some((id) => !sessionSentActionIDs.has(id))) {
        setSessionSentActionIDs(new Set([...sessionSentActionIDs, ...pendingSentIDs]));
    }
    const conversation = getConciergeChatHistoryAndWelcome({
        reportID,
        reportActions: pageActions,
        visibleActions: visiblePageActions,
        isMainChat: isConciergeMainChat,
        isSidePanel: isConciergeSidePanel,
        isMainHistoryExpanded: mainHistory.showFullHistory,
        isMainHistoryCollapsedByUser: mainHistory.isHistoryCollapsedByUser,
        hasFailedSend: !!hasFailedSend,
        hasUnreadMessageFromOthers: hasUnreadConciergeMessageFromOthers,
        linkedActionID: linkedReportActionID,
        showSidePanelHistory,
        hasUserSentMessage,
        hasOlderActions: page.hasOlderActions,
        sessionStartTime,
        sessionSentActionIDs,
        currentUserAccountID,
        greetingText: translate('common.concierge.greeting'),
        greetingCreated: report?.lastReadTime ?? DateUtils.getDBTime(),
    });
    const handleShowPreviousMessages = () => {
        if (isConciergeMainChat) {
            setMainHistoryExpanded(true);
        } else {
            setShowSidePanelHistory(true);
        }
        loadOlderChats(true);
    };
    const collapseConciergeHistory = () => {
        collapseHistory();
        if (linkedReportActionID) {
            Navigation.setParams({reportActionID: ''}, route.key);
        }
    };

    const readinessSignals: ReportActionsReadinessSignals = {
        report,
        isOffline,
        reportActionIDFromRoute: linkedReportActionID,
        transactionThreadReport,
        isReportArchived,
        isReportTransactionThread: isReportTransactionThread(report),
        shouldBeAlignedToTop,
        isReportLoadPending,
        isLoadingOlderReportActions: reportLoadingState?.isLoadingOlderReportActions,
        hasLoadingOlderReportActionsError: reportLoadingState?.hasLoadingOlderReportActionsError,
        hasOnceLoadedReportActions: reportLoadingState?.hasOnceLoadedReportActions,
        isLoadingInitialReportActions: reportLoadingState?.isLoadingInitialReportActions,
        isLoadingApp,
        reportActionsLength: pageActions.length,
        oldestReportActionID,
        hasOlderActions: page.hasOlderActions,
        hasNewerActions: page.hasNewerActions,
        oldestUnreadReportAction: page.oldestUnreadReportAction,
        isSingleExpenseReport: reportPreviewAction?.childMoneyRequestCount === 1,
        isMissingReportActions: conversation.visibleConversationActions.length === 0,
        isConciergeHiddenHistory: isConciergeSidePanel,
        showConciergeSidePanelWelcome: conversation.shouldShowSidePanelWelcome,
        derivedIsEmptyReport: reportAttributes?.isEmpty,
        hasUnreadConciergeMessageFromOthers,
    };
    const loading = getReportActionsLoadingState(readinessSignals);
    const isReady = !loading.shouldShowLoadingSkeleton && !loading.shouldShowDerivedTimingSkeleton;
    const display = getDisplayReportActions({
        actions: conversation.conversationActions,
        visibleActions: conversation.visibleConversationActions,
        cachedActions,
        report,
        reopenedAsReportID: reportMetadata?.reopenedAsReportID,
    });

    // UI state starts when content becomes ready, not while an unloaded report is behind its skeleton.
    const [wasReady, setWasReady] = useState(false);
    const [hasScrolledOverThreshold, setHasScrolledOverThreshold] = useState(false);
    const [unreadMarkerTime, setUnreadMarkerTime] = useState('');
    const [previousUnreadActionID, setPreviousUnreadActionID] = useState<string | null>(null);
    const [expandedSystemMessageReportActionIDs, setExpandedIDs] = useState<ReadonlySet<string>>(() => new Set());
    const [focusRequestedReportActionID, setFocusRequestedActionID] = useState<string>();
    const pendingFocusActionID = useRef<string | undefined>(undefined);
    const [unreadNetworkTimes, setUnreadNetworkTimes] = useState<{ready: boolean; offline: boolean; lastOfflineAt: Date | undefined; lastOnlineAt: Date | undefined}>(() => ({
        ready: false,
        offline: isOffline,
        lastOfflineAt: undefined,
        lastOnlineAt: undefined,
    }));
    if (unreadNetworkTimes.ready !== isReady || unreadNetworkTimes.offline !== isOffline) {
        let offlineAt = unreadNetworkTimes.lastOfflineAt;
        let onlineAt = unreadNetworkTimes.lastOnlineAt;
        if (!isReady) {
            offlineAt = undefined;
            onlineAt = undefined;
        } else if (!unreadNetworkTimes.ready) {
            offlineAt = isOffline ? getLocalDateFromDatetime(lastOfflineTime) : undefined;
            onlineAt = isOffline ? undefined : getLocalDateFromDatetime();
        } else if (isOffline) {
            offlineAt = getLocalDateFromDatetime();
        } else {
            onlineAt = getLocalDateFromDatetime();
        }
        setUnreadNetworkTimes({ready: isReady, offline: isOffline, lastOfflineAt: offlineAt, lastOnlineAt: onlineAt});
    }
    if (wasReady !== isReady) {
        setWasReady(isReady);
        setUnreadMarkerTime(isReady ? (report?.lastReadTime ?? '') : '');
        setPreviousUnreadActionID(null);
        setExpandedIDs(new Set());
        setFocusRequestedActionID(undefined);
        if (isReady) {
            setHasScrolledOverThreshold(getScrollOffset() >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);
        }
    }
    const isAnonymousUser = session?.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS;
    const visibleActionsRecord: ReportActions = Object.fromEntries(display.visibleActions.map((action) => [action.reportActionID, action]));
    // A newly ready list starts with its loaded messages already present, rather than treating them as live arrivals.
    const previousVisibleActions = usePrevious(isReady ? visibleActionsRecord : undefined) ?? visibleActionsRecord;
    const newestCreated = display.visibleActions.at(0)?.created ?? '';
    const previousNewestCreated = usePrevious(isReady ? newestCreated : undefined) ?? newestCreated;
    let earliestReceivedOfflineMessageIndex: number | undefined;
    for (let i = display.actionsForUnread.length - 1; i >= 0; i--) {
        const action = display.actionsForUnread[i];
        if (wasMessageReceivedWhileOffline(action, isOffline, unreadNetworkTimes.lastOfflineAt, unreadNetworkTimes.lastOnlineAt, getLocalDateFromDatetime, currentUserAccountID)) {
            earliestReceivedOfflineMessageIndex = i;
            break;
        }
    }
    const initialUnreadMarkerTime = wasReady ? unreadMarkerTime : (report?.lastReadTime ?? '');
    const scanned = getUnreadMarkerReportAction({
        visibleReportActions: display.visibleActions,
        earliestReceivedOfflineMessageIndex,
        currentUserAccountID,
        prevSortedVisibleReportActionsObjects: previousVisibleActions,
        unreadMarkerTime: initialUnreadMarkerTime,
        isScrolledOverThreshold: hasScrolledOverThreshold,
        isOffline,
        isReversed: false,
        prevUnreadMarkerReportActionID: previousUnreadActionID,
        manuallyMarkedUnreadReportActionID: report?.manuallyMarkedUnreadReportActionID,
        hasWindowFocus: Visibility.hasFocus(),
        isAnonymousUser,
        newMessageBoundaryTime: isConciergeSidePanel ? sessionStartTime : undefined,
    });
    const anchorIndex =
        page.oldestUnreadReportAction && !reportLoadingState?.hasOnceLoadedReportActions
            ? display.visibleActions.findIndex((action) => action.reportActionID === page.oldestUnreadReportAction?.reportActionID)
            : -1;
    const shouldUseUnreadAnchor =
        anchorIndex >= 0 &&
        !isReportActionFromCurrentUser(display.visibleActions[anchorIndex], currentUserAccountID) &&
        (scanned[0] === null || scanned[0] === page.oldestUnreadReportAction?.reportActionID);
    let unreadMarkerReportActionID: string | null = null;
    if (isReady) {
        unreadMarkerReportActionID = shouldUseUnreadAnchor ? (page.oldestUnreadReportAction?.reportActionID ?? null) : scanned[0];
    }
    if (isReady && previousUnreadActionID !== unreadMarkerReportActionID) {
        setPreviousUnreadActionID(unreadMarkerReportActionID);
    }

    const newestRealCreated = display.visibleActions.find((action) => action.reportActionID !== CONST.CONCIERGE_GREETING_ACTION_ID)?.created ?? '';
    if (isReady && wasReady && !isAnonymousUser && !unreadMarkerReportActionID && newestRealCreated > unreadMarkerTime && newestCreated > previousNewestCreated) {
        setUnreadMarkerTime(newestRealCreated);
    }

    const rows = isReady
        ? getReportActionsRows({
              visibleActions: display.visibleActions,
              cachedActions,
              draftAction: draftReportAction,
              isDraftPendingCompletion,
              shouldHideDraft: !!(isConciergeSidePanel && !showSidePanelHistory && sessionStartTime && draftReportAction && draftReportAction.created < sessionStartTime),
              shouldCollapseSystemMessages: isExpenseReport(report) || isMoneyRequestReport(report) || isInvoiceReport(report) || isTransactionThread(parentReportAction),
              expandedActionIDs: expandedSystemMessageReportActionIDs,
              linkedActionID: linkedReportActionID,
              unreadActionID: unreadMarkerReportActionID,
          })
        : undefined;
    const newlyRevealedIDs = rows?.revealedActionIDs.filter((id) => !expandedSystemMessageReportActionIDs.has(id)) ?? [];
    if (newlyRevealedIDs.length > 0) {
        setExpandedIDs(new Set([...expandedSystemMessageReportActionIDs, ...newlyRevealedIDs]));
    }
    const actorAccountIDs = [...new Set(rows?.renderedVisibleReportActions.map((action) => action.actorAccountID) ?? [])].filter((id) => id !== session?.accountID);
    const [customAgentAccountIDs = getEmptyArray<number>()] = usePersonalDetailsByIDs(actorAccountIDs, getCustomAgentAccountIDs);
    const latestConciergeFeedbackActionIDs =
        reportMetadata?.conciergeFeedbackForReportActionID || isDraftPendingCompletion || page.hasNewerActions
            ? getEmptyArray<string>()
            : getFeedbackPromptActionIDs(rows?.renderedVisibleReportActions ?? [], persistedReportActionIDs, customAgentAccountIDs);
    const expandSystemMessageRun = (actionIDs: string[]) => {
        pendingFocusActionID.current = actionIDs.at(0);
        setFocusRequestedActionID(actionIDs.at(0));
        setExpandedIDs((previous) => new Set([...previous, ...actionIDs]));
    };
    const consumeSystemMessageFocusRequest = (actionID: string) => {
        if (pendingFocusActionID.current !== actionID) {
            return false;
        }
        pendingFocusActionID.current = undefined;
        setFocusRequestedActionID(undefined);
        return true;
    };

    useCopySelectionEvent();
    // Reply delivery is an upstream integration; its pacing and transport remain independent of row preparation.
    usePendingConciergeResponse(reportID);
    const lastRequestedCursor = useRef<string | undefined>(undefined);
    const retriedCursor = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (!hasUnreadConciergeMessageFromOthers) {
            return;
        }
        setMainHistoryExpanded(true);
    }, [hasUnreadConciergeMessageFromOthers, setMainHistoryExpanded]);
    useEffect(() => {
        if (!readinessSignals.isMissingReportActions || !page.hasOlderActions || page.hasNewerActions || isOffline || isReportLoadPending) {
            return;
        }
        if (reportLoadingState?.hasLoadingOlderReportActionsError && oldestReportActionID && retriedCursor.current !== oldestReportActionID) {
            retriedCursor.current = oldestReportActionID;
            lastRequestedCursor.current = undefined;
        }
        if (reportLoadingState?.isLoadingOlderReportActions || !oldestReportActionID || lastRequestedCursor.current === oldestReportActionID) {
            return;
        }
        lastRequestedCursor.current = oldestReportActionID;
        loadOlderChats(false);
    }, [
        readinessSignals.isMissingReportActions,
        page.hasOlderActions,
        page.hasNewerActions,
        isOffline,
        isReportLoadPending,
        reportLoadingState?.hasLoadingOlderReportActionsError,
        reportLoadingState?.isLoadingOlderReportActions,
        oldestReportActionID,
        loadOlderChats,
    ]);
    // Install listeners before content's passive mark-as-read effects can emit their first event.
    useLayoutEffect(() => {
        if (!isReady || isAnonymousUser) {
            return;
        }
        const unreadSubscription = DeviceEventEmitter.addListener(`unreadAction_${reportID}`, setUnreadMarkerTime);
        const readSubscription = DeviceEventEmitter.addListener(`readNewestAction_${reportID}`, setUnreadMarkerTime);
        return () => {
            unreadSubscription.remove();
            readSubscription.remove();
        };
    }, [isReady, isAnonymousUser, reportID]);
    useEffect(() => {
        if (isReady) {
            return;
        }
        pendingFocusActionID.current = undefined;
    }, [isReady]);
    const draftIsVisible = rows?.isSyntheticDraftVisible;
    const savedDraftAction = rows?.persistedDraftAction;
    useEffect(() => {
        if (!isReady || !draftReportAction || draftIsVisible !== false) {
            return;
        }
        clearDraft();
    }, [isReady, draftReportAction, draftIsVisible, clearDraft]);
    useEffect(() => {
        if (!isReady || !isDraftPendingCompletion || !draftReportAction || !savedDraftAction) {
            return;
        }
        revealDraftFromReportAction(savedDraftAction);
    }, [isReady, isDraftPendingCompletion, draftReportAction, savedDraftAction, revealDraftFromReportAction]);

    if ((!isReady || !rows) && conversation.shouldShowMainChatWelcome) {
        return (
            <AskConciergeWelcome
                reportID={reportID}
                onShowPreviousMessages={handleShowPreviousMessages}
            />
        );
    }
    if (loading.shouldShowLoadingSkeleton) {
        return (
            <ReportActionsLoadingSkeleton
                reportID={reportID}
                skeletonName={CONST.TELEMETRY.CANCELED_BY_SKELETON.SKELETON_GUARD_LOADING}
            />
        );
    }
    if (!rows) {
        return (
            <ReportActionsLoadingSkeleton
                reportID={reportID}
                skeletonName={CONST.TELEMETRY.CANCELED_BY_SKELETON.SKELETON_GUARD_DERIVED_TIMING}
                shouldAnimate={false}
            />
        );
    }

    const {persistedDraftAction, isSyntheticDraftVisible, revealedActionIDs, ...rowData} = rows;
    const state: ReportActionsListState = {
        ...rowData,
        report,
        reportStable,
        chatReportStable,
        reportNameValuePairs: {
            private_isArchived: reportMetadata?.private_isArchived,
            origin: reportMetadata?.origin,
            originalID: reportMetadata?.originalID,
            billID: reportMetadata?.billID,
            conciergeFeedbackForReportActionID: reportMetadata?.conciergeFeedbackForReportActionID,
        },
        reportAttributes,
        reportsParentHierarchy,
        isReportArchived,
        isOffline,
        shouldShowOfflineSkeleton: isOffline && !display.visibleActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED),
        linkedReportActionID,
        hasOnceLoadedReportActions: reportLoadingState?.hasOnceLoadedReportActions,
        hasNewerActions: page.hasNewerActions,
        sortedAllReportActions: cachedActions,
        oldestUnreadReportAction: page.oldestUnreadReportAction,
        transactionThreadReport,
        parentReportActionForTransactionThread,
        parentReportAction,
        treatAsNoPaginationAnchor,
        isConciergeHiddenHistory: isConciergeSidePanel,
        isConciergeHistoryExpanded: conversation.isMainChatHistoryExpanded,
        showFullHistory: showSidePanelHistory,
        hasPreviousMessages: conversation.hasPreviousMessages,
        shouldShowConciergeWelcome: conversation.shouldShowMainChatWelcome,
        hasScrolledOverThreshold,
        unreadMarkerReportActionID,
        expandedSystemMessageReportActionIDs,
        focusRequestedReportActionID,
        readReportActions: display.visibleActions,
        scrollReportActions: display.scrollActions,
        firstVisibleReportActionID: getFirstVisibleReportActionID(display.actionsForUnread, isOffline),
        latestConciergeFeedbackActionIDs,
    };
    const actions: ReportActionsListActions = {
        loadOlderChats,
        loadNewerChats,
        setTreatAsNoPaginationAnchor,
        handleShowPreviousMessages,
        collapseConciergeHistory,
        setHasScrolledOverThreshold,
        expandSystemMessageRun,
        consumeSystemMessageFocusRequest,
    };
    return (
        <ReportActionsListActionsContext.Provider value={actions}>
            <ReportActionsListStateContext.Provider value={state}>{children}</ReportActionsListStateContext.Provider>
        </ReportActionsListActionsContext.Provider>
    );
}

function useReportActionsListState(): ReportActionsListState {
    const value = useContext(ReportActionsListStateContext);
    if (!value) {
        throw new Error('useReportActionsListState must be used within ReportActionsListProvider');
    }
    return value;
}

function useReportActionsListActions(): ReportActionsListActions {
    const value = useContext(ReportActionsListActionsContext);
    if (!value) {
        throw new Error('useReportActionsListActions must be used within ReportActionsListProvider');
    }
    return value;
}

export {ReportActionsListProvider, ReportActionsListStateContext, ReportActionsListActionsContext, useReportActionsListState, useReportActionsListActions};
export type {ReportActionsListState, ReportActionsListActions};
