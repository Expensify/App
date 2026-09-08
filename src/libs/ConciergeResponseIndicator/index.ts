import Log from '@libs/Log';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import Pusher from '@libs/Pusher';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import {setConciergeAttention} from '@libs/UnreadIndicatorUpdater/updateUnread';
import Visibility from '@libs/Visibility';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import type TrackConciergeResponse from './types';

// This state belongs to the requesting browser session, not to a mounted chat. Reopening the app
// falls back to ordinary unread indicators; ephemeral draft events cannot be recovered from history.
const requests = new Map<
    string,
    {
        accountID: number;
        responseReportID: string;
        streamSessionID?: string;
        sequence: number;
        status: 'pending' | 'streaming' | 'ready';
        hasFinalResponse: boolean;
        shouldShowPending: boolean;
        isQuestionPending: boolean;
        cleanups: Array<() => void>;
        timer?: ReturnType<typeof setTimeout>;
    }
>();

// Match the thinking indicator's safety window, renewed by each server streaming event.
const RESPONSE_TIMEOUT = 120000;

function updateIndicator() {
    setConciergeAttention([...requests.values()].some((request) => request.status !== 'pending' || (request.shouldShowPending && !request.hasFinalResponse)));
}

function removeRequest(responseReportActionID: string) {
    const request = requests.get(responseReportActionID);
    if (!request) {
        return;
    }
    requests.delete(responseReportActionID);
    clearTimeout(request.timer);
    for (const cleanup of request.cleanups) {
        cleanup();
    }
    updateIndicator();
}

function armTimeout(responseReportActionID: string) {
    const request = requests.get(responseReportActionID);
    if (!request) {
        return;
    }
    clearTimeout(request.timer);
    request.timer = setTimeout(() => {
        // Offline sends can remain queued indefinitely. Start the response deadline when the
        // question is saved, rather than expiring a request before it ever reaches Concierge.
        if (request.isQuestionPending) {
            armTimeout(responseReportActionID);
            return;
        }
        removeRequest(responseReportActionID);
    }, RESPONSE_TIMEOUT);
}

function isViewingResponse(reportID: string) {
    return Visibility.isVisible() && Visibility.hasFocus() && navigationRef.isReady() && Navigation.getTopmostReportId() === reportID;
}

function completeRequest(responseReportActionID: string) {
    const request = requests.get(responseReportActionID);
    if (!request) {
        return;
    }
    request.status = 'ready';
    clearTimeout(request.timer);
    if (isViewingResponse(request.responseReportID)) {
        removeRequest(responseReportActionID);
        return;
    }
    updateIndicator();
}

function handleDraftEvent(event: ConciergeDraftEvent) {
    const request = requests.get(event.reportActionID);
    if (!request || (event.actorAccountID ?? CONST.ACCOUNT_ID.CONCIERGE) !== CONST.ACCOUNT_ID.CONCIERGE) {
        return;
    }
    // Ignore delayed events from a previous attempt and replayed batches. A terminal event
    // may be the first event we receive after reconnecting, so don't require a start event.
    if (request.streamSessionID && request.streamSessionID !== event.streamSessionID) {
        return;
    }
    if (event.sequence <= request.sequence || request.status === 'ready') {
        return;
    }
    request.streamSessionID = event.streamSessionID;
    request.sequence = event.sequence;
    request.responseReportID = event.reportID;
    if (event.status === 'failed' || event.status === 'cleared') {
        removeRequest(event.reportActionID);
        return;
    }
    if (event.status === 'completed') {
        completeRequest(event.reportActionID);
        return;
    }
    request.isQuestionPending = false;
    request.status = 'streaming';
    armTimeout(event.reportActionID);
    // The final Onyx action may beat the completion event (or recover a missed completion).
    if (request.hasFinalResponse) {
        completeRequest(event.reportActionID);
        return;
    }
    updateIndicator();
}

function acknowledgeReadyResponses() {
    if (!Visibility.isVisible() || !Visibility.hasFocus()) {
        return;
    }
    for (const [id, request] of requests) {
        if (request.status !== 'ready') {
            continue;
        }
        removeRequest(id);
    }
}

Visibility.onVisibilityChange(acknowledgeReadyResponses);
window.addEventListener('focus', acknowledgeReadyResponses);
navigationRef.addListener('state', () => {
    for (const [id, request] of requests) {
        if (request.status === 'ready' && isViewingResponse(request.responseReportID)) {
            removeRequest(id);
        }
    }
});

// This imperative tracker owns browser subscriptions outside React. Session changes must release
// those subscriptions so a previous account's request cannot change the next account's favicon.
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        for (const [id, request] of requests) {
            if (session?.accountID === request.accountID) {
                continue;
            }
            removeRequest(id);
        }
    },
});

const trackConciergeResponse: TrackConciergeResponse = ({accountID, reportID, questionReportActionID, responseReportActionID, responseReportID = reportID, shouldShowPending = true}) => {
    if (requests.has(responseReportActionID)) {
        return;
    }
    const request: NonNullable<ReturnType<typeof requests.get>> = {
        accountID,
        responseReportID,
        sequence: 0,
        status: 'pending',
        hasFinalResponse: false,
        shouldShowPending,
        isQuestionPending: true,
        cleanups: [],
    };
    requests.set(responseReportActionID, request);
    const subscribedReports = new Set<string>();
    const subscribeToReport = (id: string) => {
        if (subscribedReports.has(id)) {
            return;
        }
        subscribedReports.add(id);
        const channelName = `${CONST.PUSHER.PRIVATE_REPORT_CHANNEL_PREFIX}${id}${CONFIG.PUSHER.SUFFIX}`;
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
            subscription.catch((error: unknown) => Log.hmmm('Failed to subscribe to Concierge favicon events', {reportID: id, error}));
            request.cleanups.push(() => subscription.unsubscribe());
        }

        // Watch only the question/response reports while a request is tracked. This non-render
        // subscription detects failed sends and reconciles durable replies after missed events.
        const connection = Onyx.connectWithoutView({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${id}`,
            callback: (actions) => {
                if (!requests.has(responseReportActionID)) {
                    return;
                }
                const question = actions?.[questionReportActionID];
                if (question?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || (question?.errors && Object.keys(question.errors).length > 0)) {
                    removeRequest(responseReportActionID);
                    return;
                }
                if (question && !question.pendingAction && request.isQuestionPending) {
                    request.isQuestionPending = false;
                    if (request.status !== 'ready') {
                        armTimeout(responseReportActionID);
                    }
                }
                // Auth may reuse an existing thread or fall back to the DM. Follow the actual
                // child report while retaining the source subscription for the fallback reply.
                if (question?.childReportID && !question.pendingAction) {
                    subscribeToReport(question.childReportID);
                }
                const response = actions?.[responseReportActionID];
                if (response?.actorAccountID !== CONST.ACCOUNT_ID.CONCIERGE || response.pendingAction) {
                    return;
                }
                request.hasFinalResponse = true;
                request.responseReportID = id;
                if (request.status === 'streaming') {
                    completeRequest(responseReportActionID);
                } else {
                    // An ordinary non-streamed reply ends the optimistic favicon, but retain
                    // correlation until timeout in case its draft events arrive after Onyx.
                    updateIndicator();
                }
            },
        });
        request.cleanups.push(() => Onyx.disconnect(connection));
    };
    subscribeToReport(reportID);
    armTimeout(responseReportActionID);
    updateIndicator();
};

export default trackConciergeResponse;
