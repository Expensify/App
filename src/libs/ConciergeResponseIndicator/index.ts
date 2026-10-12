/** Tracks requested Concierge replies and updates the browser favicon until they are read. */
import Log from '@libs/Log';
import Pusher from '@libs/Pusher';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import {setConciergeAttention} from '@libs/UnreadIndicatorUpdater/updateUnread';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type {TrackConciergeResponseParams} from './types';

type ConciergeResponseRequest = {
    accountID: number;
    reportID: string;
    questionReportActionID: string;
    responseReportID: string;
    streamSessionID?: string;
    sequence: number;
    status: 'pending' | 'streaming' | 'ready';
    hasStartedStreaming?: boolean;
    responseCreated?: string;
    isQuestionPending: boolean;
    subscribedReportIDs: Set<string>;
    timer?: ReturnType<typeof setTimeout>;
};

type ReportSubscription = {
    responseReportActionIDs: Set<string>;
    actions: OnyxEntry<ReportActions>;
    lastReadTime?: string;
    lastVisibleActionCreated?: string;
    cleanups: Array<() => void>;
};

const reportSubscriptions = new Map<string, ReportSubscription>();

// Open tabs share request identities, while each tab observes its own live events and read updates.
// Nothing is persisted: once all tabs close, the app falls back to ordinary unread indicators.
const requests = new Map<string, ConciergeResponseRequest>();

type RequestMessage = {type: 'sync'} | {type: 'request'; parameters: TrackConciergeResponseParams};
let requestChannel: BroadcastChannel | undefined;
let currentAccountID: number | undefined;

// Match the thinking indicator's safety window, renewed by each server streaming event.
const RESPONSE_TIMEOUT_MS = 120000;

function isAwaitingReportUpdate(request: ConciergeResponseRequest) {
    return (
        request.status === 'ready' &&
        request.hasStartedStreaming &&
        !!request.responseCreated &&
        (reportSubscriptions.get(request.responseReportID)?.lastVisibleActionCreated ?? '') < request.responseCreated
    );
}

function updateIndicator() {
    const activeRequests = [...requests.values()];
    setConciergeAttention(
        activeRequests.some((request) => request.status === 'streaming' || isAwaitingReportUpdate(request)),
        activeRequests.filter((request) => request.status === 'ready').map((request) => request.responseReportID),
    );
}

/** Release a report's listeners once no requested replies need them. */
function releaseReportSubscriptions(responseReportActionID: string, request: ConciergeResponseRequest) {
    for (const reportID of request.subscribedReportIDs) {
        const subscription = reportSubscriptions.get(reportID);
        if (!subscription) {
            continue;
        }
        subscription.responseReportActionIDs.delete(responseReportActionID);
        if (subscription.responseReportActionIDs.size > 0) {
            continue;
        }
        reportSubscriptions.delete(reportID);
        for (const cleanup of subscription.cleanups) {
            cleanup();
        }
    }
}

function removeRequest(responseReportActionID: string) {
    const request = requests.get(responseReportActionID);
    if (!request) {
        return;
    }
    requests.delete(responseReportActionID);
    clearTimeout(request.timer);
    releaseReportSubscriptions(responseReportActionID, request);
    updateIndicator();
}

function armTimeout(responseReportActionID: string) {
    const request = requests.get(responseReportActionID);
    // Offline questions can stay queued indefinitely. Start the deadline only after the server
    // saves the question or starts its reply, and retain completed replies until they are read.
    if (!request || request.isQuestionPending || request.status === 'ready') {
        return;
    }
    clearTimeout(request.timer);
    request.timer = setTimeout(() => removeRequest(responseReportActionID), RESPONSE_TIMEOUT_MS);
}

/** Use the same read timestamp as ordinary report actions, including reads before completion. */
function reconcileReadState(responseReportActionID: string) {
    const request = requests.get(responseReportActionID);
    if (!request || request.status !== 'ready') {
        return;
    }
    const lastReadTime = reportSubscriptions.get(request.responseReportID)?.lastReadTime;
    if (!lastReadTime || !request.responseCreated || lastReadTime < request.responseCreated) {
        return;
    }
    removeRequest(responseReportActionID);
}

function completeRequest(responseReportActionID: string) {
    const request = requests.get(responseReportActionID);
    if (!request) {
        return;
    }
    request.status = 'ready';
    clearTimeout(request.timer);
    // The terminal draft can precede the report update that makes the reply unread.
    // Retain streaming attention through that handoff, with the same stalled-response deadline.
    if (isAwaitingReportUpdate(request)) {
        request.timer = setTimeout(() => removeRequest(responseReportActionID), RESPONSE_TIMEOUT_MS);
    }
    reconcileReadState(responseReportActionID);
    updateIndicator();
}

function handleDraftEvent(event: ConciergeDraftEvent) {
    const request = requests.get(event.reportActionID);
    if (!request || (event.actorAccountID ?? CONST.ACCOUNT_ID.CONCIERGE) !== CONST.ACCOUNT_ID.CONCIERGE) {
        return;
    }
    // Allow replacement streams to start a new sequence, but ignore terminal events from old sessions.
    // A terminal event may still be the first event we receive after reconnecting.
    if (request.streamSessionID && request.streamSessionID !== event.streamSessionID && event.status !== 'started' && event.status !== 'updated') {
        return;
    }
    if ((request.streamSessionID === event.streamSessionID && event.sequence <= request.sequence) || request.status === 'ready') {
        return;
    }
    request.streamSessionID = event.streamSessionID;
    request.sequence = event.sequence;
    request.responseReportID = event.reportID;
    request.responseCreated ??= event.created;
    request.isQuestionPending = false;
    if (event.status === 'failed' || event.status === 'cleared') {
        removeRequest(event.reportActionID);
        return;
    }
    if (event.status === 'completed') {
        completeRequest(event.reportActionID);
        return;
    }
    // A draft with no response content is still thinking, not a visible answer.
    if ((event.bodyMarkdown || event.finalRenderedHTML) && request.status !== 'streaming') {
        request.status = 'streaming';
        request.hasStartedStreaming = true;
        updateIndicator();
    }
    armTimeout(event.reportActionID);
}

// This imperative tracker owns browser subscriptions outside React. Session changes must release
// those subscriptions so a previous account's request cannot change the next account's favicon.
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        if (session?.accountID === currentAccountID) {
            return;
        }
        currentAccountID = session?.accountID;
        requestChannel?.close();
        requestChannel = undefined;
        for (const [id, request] of requests) {
            if (currentAccountID === request.accountID) {
                continue;
            }
            removeRequest(id);
        }

        if (!currentAccountID || typeof BroadcastChannel === 'undefined') {
            return;
        }
        // Share only request IDs, never message content. Account-specific channels prevent requests
        // from following a user into another account, and peer snapshots support tabs opened later.
        requestChannel = new BroadcastChannel(`conciergeResponses_${currentAccountID}`);
        requestChannel.addEventListener('message', ({data}: MessageEvent<RequestMessage>) => {
            if (data?.type === 'sync') {
                for (const [responseReportActionID, request] of requests) {
                    const {accountID, reportID, questionReportActionID} = request;
                    requestChannel?.postMessage({type: 'request', parameters: {accountID, reportID, questionReportActionID, responseReportActionID}} satisfies RequestMessage);
                }
                return;
            }
            if (data?.type !== 'request' || data.parameters?.accountID !== currentAccountID) {
                return;
            }
            registerConciergeResponse(data.parameters);
        });
        requestChannel.postMessage({type: 'sync'} satisfies RequestMessage);
    },
});

/** Reconcile the requested reply with durable actions, including failed sends and server-selected threads. */
function handleReportActions(responseReportActionID: string, reportID: string, actions: OnyxEntry<ReportActions>) {
    const request = requests.get(responseReportActionID);
    if (!request) {
        return;
    }
    const question = actions?.[request.questionReportActionID];
    if (question?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || (question?.errors && Object.keys(question.errors).length > 0)) {
        removeRequest(responseReportActionID);
        return;
    }
    if (question && !question.pendingAction && request.isQuestionPending) {
        request.isQuestionPending = false;
        armTimeout(responseReportActionID);
    }

    // Auth may reuse an existing thread or fall back to the DM. Follow the actual
    // child report while retaining the source subscription for the fallback reply.
    if (question?.childReportID && !question.pendingAction) {
        subscribeToReport(responseReportActionID, question.childReportID);
    }
    const response = actions?.[responseReportActionID];
    if (response?.actorAccountID !== CONST.ACCOUNT_ID.CONCIERGE || response.pendingAction) {
        return;
    }
    if (request.status === 'ready' && request.responseReportID === reportID && request.responseCreated === response.created) {
        return;
    }
    request.isQuestionPending = false;
    request.responseReportID = reportID;
    request.responseCreated = response.created;
    // A durable requested answer also covers non-streamed replies and completely missed drafts.
    completeRequest(responseReportActionID);
}

/** Share report listeners across requested replies independently of the mounted report screen. */
function subscribeToReport(responseReportActionID: string, reportID: string) {
    const request = requests.get(responseReportActionID);
    if (!request || request.subscribedReportIDs.has(reportID)) {
        return;
    }
    request.subscribedReportIDs.add(reportID);
    const existingSubscription = reportSubscriptions.get(reportID);
    if (existingSubscription) {
        existingSubscription.responseReportActionIDs.add(responseReportActionID);
        // New requests also need the latest actions when this report is already being watched.
        handleReportActions(responseReportActionID, reportID, existingSubscription.actions);
        return;
    }
    const reportSubscription: ReportSubscription = {
        responseReportActionIDs: new Set([responseReportActionID]),
        actions: undefined,
        cleanups: [],
    };
    reportSubscriptions.set(reportID, reportSubscription);
    const channelName = `${CONST.PUSHER.PRIVATE_REPORT_CHANNEL_PREFIX}${reportID}${CONFIG.PUSHER.SUFFIX}`;
    const subscriptions = [
        Pusher.subscribe(channelName, Pusher.TYPE.CONCIERGE_DRAFT_EVENTS, ({events}) => {
            for (const event of events) {
                handleDraftEvent(event);
            }
        }),
        ...[
            Pusher.TYPE.CONCIERGE_DRAFT_STARTED,
            Pusher.TYPE.CONCIERGE_DRAFT_UPDATED,
            Pusher.TYPE.CONCIERGE_DRAFT_COMPLETED,
            Pusher.TYPE.CONCIERGE_DRAFT_FAILED,
            Pusher.TYPE.CONCIERGE_DRAFT_CLEARED,
        ].map((eventType) => Pusher.subscribe(channelName, eventType, handleDraftEvent)),
    ];
    for (const subscription of subscriptions) {
        subscription.catch((error: unknown) => Log.hmmm('Failed to subscribe to Concierge favicon events', {reportID, error}));
        reportSubscription.cleanups.push(() => subscription.unsubscribe());
    }

    // This tracker runs outside React. Observe durable read updates from side panels,
    // manual mark-as-read actions, and other sessions independently of navigation.
    const reportConnection = Onyx.connectWithoutView({
        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        callback: (report) => {
            const lastReadTime = report?.lastReadTime ?? '';
            const lastVisibleActionCreated = report?.lastVisibleActionCreated;
            if (reportSubscription.lastReadTime === lastReadTime && reportSubscription.lastVisibleActionCreated === lastVisibleActionCreated) {
                return;
            }
            reportSubscription.lastReadTime = lastReadTime;
            reportSubscription.lastVisibleActionCreated = lastVisibleActionCreated;
            for (const id of reportSubscription.responseReportActionIDs) {
                reconcileReadState(id);
                const trackedRequest = requests.get(id);
                if (trackedRequest?.status === 'ready' && !isAwaitingReportUpdate(trackedRequest)) {
                    clearTimeout(trackedRequest.timer);
                }
            }
            updateIndicator();
        },
    });
    if (reportSubscriptions.get(reportID) !== reportSubscription) {
        Onyx.disconnect(reportConnection);
        return;
    }
    reportSubscription.cleanups.push(() => Onyx.disconnect(reportConnection));

    // Watch only the question/response reports while a request is tracked. This non-render
    // subscription detects failed sends and reconciles durable replies after missed events.
    const connection = Onyx.connectWithoutView({
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        callback: (actions) => {
            reportSubscription.actions = actions;
            for (const id of reportSubscription.responseReportActionIDs) {
                handleReportActions(id, reportID, actions);
            }
        },
    });
    // The initial callback can finish the last request before connectWithoutView returns.
    if (reportSubscriptions.get(reportID) !== reportSubscription) {
        Onyx.disconnect(connection);
        return;
    }
    reportSubscription.cleanups.push(() => Onyx.disconnect(connection));
}

/** Register a local or peer request without broadcasting it back to other tabs. */
function registerConciergeResponse({accountID, reportID, questionReportActionID, responseReportActionID}: TrackConciergeResponseParams) {
    if (requests.has(responseReportActionID)) {
        return;
    }
    const request: ConciergeResponseRequest = {
        accountID,
        reportID,
        questionReportActionID,
        responseReportID: reportID,
        sequence: 0,
        status: 'pending',
        isQuestionPending: true,
        subscribedReportIDs: new Set(),
    };
    requests.set(responseReportActionID, request);
    subscribeToReport(responseReportActionID, reportID);
}

/** Track a question in this tab and the other open tabs for the same account. */
function trackConciergeResponse(parameters: TrackConciergeResponseParams) {
    registerConciergeResponse(parameters);
    requestChannel?.postMessage({type: 'request', parameters} satisfies RequestMessage);
}

export default trackConciergeResponse;
