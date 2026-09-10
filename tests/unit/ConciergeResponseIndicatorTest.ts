import trackConciergeResponse from '@libs/ConciergeResponseIndicator';
import Pusher from '@libs/Pusher';
import type EventType from '@libs/Pusher/EventType';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import updateUnread, {setPageTitle} from '@libs/UnreadIndicatorUpdater/updateUnread';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Exercise the web implementations even when Jest resolves native platform files.
jest.mock('@libs/ConciergeResponseIndicator', () => jest.requireActual<{default: typeof trackConciergeResponse}>('../../src/libs/ConciergeResponseIndicator/index.ts'));
jest.mock('@libs/UnreadIndicatorUpdater/updateUnread', () =>
    jest.requireActual<{default: typeof updateUnread; setPageTitle: typeof setPageTitle}>('../../src/libs/UnreadIndicatorUpdater/updateUnread/index.ts'),
);
jest.mock('@libs/Log', () => ({__esModule: true, default: {hmmm: jest.fn()}}));
jest.mock('@libs/Pusher', () => ({
    __esModule: true,
    default: {
        TYPE: jest.requireActual<{default: typeof EventType}>('../../src/libs/Pusher/EventType').default,
        subscribe: jest.fn(),
    },
}));

type DraftListener = (event: ConciergeDraftEvent | {events: ConciergeDraftEvent[]}) => void;
const listeners = new Map<string, Set<DraftListener>>();
const questionID = '100';
const responseID = '200';
const reportID = '300';
const threadID = '400';
const accountID = 10;
const beforeResponse = '2026-09-08 11:00:00.000';
const responseCreated = '2026-09-08 12:00:00.000';
const partialReadTime = '2026-09-08 12:00:01.000';
const finalReadTime = '2026-09-08 12:01:00.000';

function favicon() {
    return document.getElementById('favicon')?.getAttribute('href');
}

function emit(overrides: Partial<ConciergeDraftEvent> = {}, batch = false) {
    const event: ConciergeDraftEvent = {
        reportID,
        reportActionID: responseID,
        streamSessionID: 'session',
        sequence: 1,
        status: 'started',
        actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
        created: responseCreated,
        bodyMarkdown: 'An answer',
        ...overrides,
    };
    const eventType = batch ? 'conciergeDraftEvents' : `conciergeDraft${event.status[0].toUpperCase()}${event.status.slice(1)}`;
    const channel = `${CONST.PUSHER.PRIVATE_REPORT_CHANNEL_PREFIX}${event.reportID}${CONFIG.PUSHER.SUFFIX}`;
    for (const listener of [...(listeners.get(`${channel}:${eventType}`) ?? [])]) {
        listener(batch ? {events: [event]} : event);
    }
}

async function start(overrides: Partial<Parameters<typeof trackConciergeResponse>[0]> = {}) {
    trackConciergeResponse({accountID, reportID, questionReportActionID: questionID, responseReportActionID: responseID, ...overrides});
    await new Promise<void>((resolve) => {
        setImmediate(resolve);
    });
}

async function saveQuestion(extra = {}) {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[questionID]: {reportActionID: questionID, pendingAction: null, ...extra}});
    await new Promise<void>((resolve) => {
        setImmediate(resolve);
    });
}

async function saveResponse(id = reportID, actionID = responseID, created = responseCreated) {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${id}`, {
        [actionID]: {reportActionID: actionID, actorAccountID: CONST.ACCOUNT_ID.CONCIERGE, pendingAction: null, created},
    });
}

async function markRead(lastReadTime = finalReadTime, id = reportID) {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${id}`, {reportID: id, lastReadTime});
}

describe('Concierge response favicon', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID});
        await markRead(beforeResponse);
        await waitForBatchedUpdates();
        listeners.clear();
        jest.useFakeTimers();
        jest.mocked(Pusher.subscribe).mockImplementation((channel, event, callback) => {
            const key = `${channel}:${event}`;
            const callbacks = listeners.get(key) ?? new Set<DraftListener>();
            listeners.set(key, callbacks);
            const listener: DraftListener = (data) => callback?.(data);
            callbacks.add(listener);
            return Object.assign(Promise.resolve(), {unsubscribe: () => callbacks.delete(listener)});
        });
        document.head.innerHTML = '<link id="favicon" rel="icon">';
        setPageTitle('Inbox');
        updateUnread(0);
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('preserves ordinary unread counts while thinking, and Concierge priority while streaming', async () => {
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        await start();
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        updateUnread(2);
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
        emit({bodyMarkdown: ''});
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
        emit({status: 'updated', sequence: 2});
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        setPageTitle('Settings');
        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(document.title).toContain('(2) Settings');
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        emit({status: 'failed', sequence: 3});
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
    });

    it('retains a completed unread response when focus returns to another page or its report', async () => {
        updateUnread(1, [reportID]);
        await start();
        emit({}, true);
        emit({status: 'completed', sequence: 2, bodyMarkdown: undefined}, true);
        jest.advanceTimersByTime(300000);
        window.dispatchEvent(new Event('focus'));
        document.dispatchEvent(new Event('visibilitychange'));
        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await saveResponse();
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
    });

    it('does not rewrite the browser title for unchanged streaming attention', async () => {
        await start();
        emit();
        const titleSetter = jest.spyOn(document, 'title', 'set');
        emit({status: 'updated', sequence: 2, bodyMarkdown: 'More of the answer'});
        expect(titleSetter).not.toHaveBeenCalled();
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
    });

    it('clears a completed reply through synced read state without a navigation event', async () => {
        await start();
        emit();
        emit({status: 'completed', sequence: 2});
        updateUnread(2, [reportID, 'other-report']);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await markRead();
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it.each(['completion first', 'final action first'])('uses an existing read immediately after streaming ends with %s', async (order) => {
        await start();
        emit();
        await markRead(partialReadTime);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        emit({status: 'updated', sequence: 2, bodyMarkdown: 'An answer with more content'});
        if (order === 'completion first') {
            emit({status: 'completed', sequence: 3});
        } else {
            await saveResponse();
        }
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        if (order === 'completion first') {
            await saveResponse();
        } else {
            emit({status: 'completed', sequence: 3});
        }
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
    });

    it('does not revive a read durable response through delayed drafts or marking it unread again', async () => {
        await start();
        await markRead(responseCreated);
        await saveResponse();
        emit();
        emit({status: 'completed', sequence: 2});
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        await markRead(beforeResponse);
        updateUnread(1, [reportID]);
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
    });

    it('only shows completed Concierge attention for reports eligible for the ordinary unread icon', async () => {
        await start();
        await saveResponse();
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        updateUnread(1, ['unrelated-report']);
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
        updateUnread(2, ['unrelated-report', reportID]);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        // Muting or hiding the report removes it from the existing unread report list.
        updateUnread(1, ['unrelated-report']);
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('clears completed attention when the normal unread update arrives before the read subscription', async () => {
        await start();
        await saveResponse();
        updateUnread(1, [reportID]);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        await markRead();
        expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
    });

    it('shares report listeners until the last response is read', async () => {
        updateUnread(1, [reportID]);
        const connect = jest.spyOn(Onyx, 'connectWithoutView');
        const disconnect = jest.spyOn(Onyx, 'disconnect');
        await start();
        await start({responseReportActionID: '201', questionReportActionID: '101'});
        expect(connect).toHaveBeenCalledTimes(2);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 1)).toBe(true);
        emit({status: 'completed'});
        emit({reportActionID: '201', status: 'completed', created: finalReadTime});
        await markRead(partialReadTime);
        expect(disconnect).not.toHaveBeenCalled();
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await markRead();
        updateUnread(0);
        expect(disconnect).toHaveBeenCalledTimes(2);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('clears two completed replies with the same timestamp when both become read', async () => {
        updateUnread(1, [reportID]);
        await start();
        await start({responseReportActionID: '201', questionReportActionID: '101'});
        await saveResponse();
        await saveResponse(reportID, '201');
        await markRead(responseCreated);
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
    });

    it('keeps a shared report subscribed when one send fails', async () => {
        const disconnect = jest.spyOn(Onyx, 'disconnect');
        await start();
        await start({responseReportActionID: '201', questionReportActionID: '101'});
        emit({reportActionID: '201'});
        await saveQuestion({errors: {error: 'Unable to send'}});
        expect(disconnect).not.toHaveBeenCalled();
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        emit({reportActionID: '201', status: 'failed', sequence: 2});
        expect(disconnect).toHaveBeenCalledTimes(2);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('follows the actual reply thread and ignores reads of the question report', async () => {
        updateUnread(1, [threadID]);
        await start();
        await markRead(beforeResponse, threadID);
        await saveQuestion({childReportID: threadID});
        emit({reportID: threadID});
        await saveResponse(threadID);
        await markRead();
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await markRead(finalReadTime, threadID);
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it("uses the latest shared actions to find a new request's reply thread", async () => {
        updateUnread(1, [threadID]);
        const connect = jest.spyOn(Onyx, 'connectWithoutView');
        await start();
        const secondQuestionID = '101';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
            [secondQuestionID]: {reportActionID: secondQuestionID, pendingAction: null, childReportID: threadID},
        });
        await start({responseReportActionID: '201', questionReportActionID: '101'});
        expect(connect).toHaveBeenCalledTimes(4);
        emit({reportID: threadID, reportActionID: '201', status: 'completed'});
        emit({status: 'failed'});
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await markRead(finalReadTime, threadID);
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
    });

    it('allows a DM fallback even when the server assigned a response thread', async () => {
        await start({responseReportID: threadID});
        await saveQuestion({childReportID: threadID});
        emit();
        await saveResponse();
        await markRead();
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('ignores unrelated actors, unsolicited responses, stale events, and old terminal sessions', async () => {
        emit();
        await start();
        emit({actorAccountID: 999});
        emit({reportActionID: 'other'});
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        emit({sequence: 5});
        emit({status: 'failed', sequence: 4});
        emit({status: 'failed', sequence: 6, streamSessionID: 'old-stream'});
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        emit({status: 'failed', sequence: 6});
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('shows an unread requested durable reply even when no draft events were received', async () => {
        updateUnread(1, [reportID]);
        await start();
        await saveQuestion();
        await saveResponse();
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        emit({status: 'completed', bodyMarkdown: undefined});
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await markRead();
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('expires stalled responses after a send succeeds, but retains queued offline sends without attention', async () => {
        await start();
        jest.advanceTimersByTime(300000);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 1)).toBe(true);
        await saveQuestion();
        jest.advanceTimersByTime(120000);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
        emit();
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('does not expire an unread completion when the saved question arrives later', async () => {
        updateUnread(1, [reportID]);
        await start();
        emit({status: 'completed', bodyMarkdown: undefined});
        await saveQuestion();
        jest.advanceTimersByTime(300000);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await markRead();
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('retains a saved unread reply even when its question update was missed', async () => {
        updateUnread(1, [reportID]);
        await start();
        await saveResponse();
        jest.advanceTimersByTime(300000);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await markRead();
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
    });

    it('cleans up stalled streaming requests', async () => {
        await start();
        emit();
        jest.advanceTimersByTime(120000);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
    });

    it('clears subscriptions and attention when the account changes', async () => {
        await start();
        emit({status: 'completed'});
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 20});
        await waitForBatchedUpdates();
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
    });
});
