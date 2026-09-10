import trackConciergeResponse from '@libs/ConciergeResponseIndicator';
import Pusher from '@libs/Pusher';
import type EventType from '@libs/Pusher/EventType';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import updateUnread, {setPageTitle, setUnreadUpdateCallback} from '@libs/UnreadIndicatorUpdater/updateUnread';

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
const originalBroadcastChannel = globalThis.BroadcastChannel;
const requestChannels: MockRequestChannel[] = [];

class MockRequestChannel {
    name: string;

    postMessage = jest.fn();

    close = jest.fn();

    listener?: (event: MessageEvent) => void;

    constructor(name: string) {
        this.name = name;
        requestChannels.push(this);
    }

    addEventListener(_type: string, listener: (event: MessageEvent) => void) {
        this.listener = listener;
    }

    receive(data: unknown) {
        this.listener?.(new MessageEvent('message', {data}));
    }
}

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
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${id}`, {reportID: id, lastVisibleActionCreated: created});
}

async function markRead(lastReadTime = finalReadTime, id = reportID) {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${id}`, {reportID: id, lastReadTime});
}

describe('Concierge response favicon', () => {
    beforeEach(async () => {
        await Onyx.clear();
        requestChannels.length = 0;
        Object.defineProperty(globalThis, 'BroadcastChannel', {value: MockRequestChannel, configurable: true, writable: true});
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
        setUnreadUpdateCallback(jest.fn());
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.useRealTimers();
        jest.restoreAllMocks();
        Object.defineProperty(globalThis, 'BroadcastChannel', {value: originalBroadcastChannel, configurable: true, writable: true});
    });

    it('preserves ordinary unread counts while thinking and prioritizes Concierge once streaming starts', async () => {
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
    });

    it.each(['draft completion', 'the durable reply'])('honors an existing read when %s arrives first', async (completion) => {
        updateUnread(1, [reportID]);
        await start();
        emit();
        await markRead(responseCreated);
        emit({status: 'updated', sequence: 2, bodyMarkdown: 'More of the answer'});
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        if (completion === 'draft completion') {
            emit({status: 'completed', sequence: 3});
        } else {
            await saveResponse();
        }
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        await saveResponse();
        emit({status: 'completed', sequence: 4});
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('recovers a missed draft and follows the same unread report eligibility as the ordinary favicon', async () => {
        await start();
        await saveResponse();
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        updateUnread(1, ['other-report']);
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
        updateUnread(2, ['other-report', reportID]);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        jest.advanceTimersByTime(300000);
        await saveQuestion();
        jest.advanceTimersByTime(300000);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        // Muting, hiding, or reading the report removes it from the existing unread report list.
        updateUnread(1, ['other-report']);
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it.each(['before', 'after'])('keeps the icon through completion when the report update arrives %s the terminal event', async (order) => {
        const requestUnreadUpdate = jest.fn();
        setUnreadUpdateCallback(requestUnreadUpdate);
        await start();
        emit({}, true);
        if (order === 'before') {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {lastVisibleActionCreated: responseCreated});
        }
        emit({status: 'completed', sequence: 2}, true);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        if (order === 'after') {
            // An unrelated unread calculation can still contain the report state from before the reply.
            updateUnread(0);
            expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {lastVisibleActionCreated: responseCreated});
        }
        expect(requestUnreadUpdate).toHaveBeenCalled();
        setPageTitle('Settings');
        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        updateUnread(1, [reportID]);
        jest.advanceTimersByTime(300000);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        // A fresh snapshot still applies ordinary unread eligibility, including muted and hidden reports.
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('tracks a question from another tab and clears its reply through shared read state', async () => {
        const channel = requestChannels.at(-1);
        channel?.postMessage.mockClear();
        channel?.receive({type: 'request', parameters: {accountID, reportID, questionReportActionID: questionID, responseReportActionID: responseID}});
        await new Promise<void>((resolve) => {
            setImmediate(resolve);
        });
        expect(channel?.postMessage).not.toHaveBeenCalled();
        emit();
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await saveResponse();
        updateUnread(1, [reportID]);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await markRead();
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        channel?.receive({type: 'sync'});
        expect(channel?.postMessage).not.toHaveBeenCalled();
    });

    it('shares active request IDs with existing and newly opened tabs only for the same account', async () => {
        await start();
        const channel = requestChannels.at(-1);
        const message = {type: 'request', parameters: {accountID, reportID, questionReportActionID: questionID, responseReportActionID: responseID}};
        expect(channel?.name).toBe(`conciergeResponses_${accountID}`);
        expect(channel?.postMessage).toHaveBeenCalledWith(message);
        channel?.postMessage.mockClear();
        channel?.receive({type: 'sync'});
        expect(channel?.postMessage).toHaveBeenCalledWith(message);
        emit();
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 20});
        expect(channel?.close).toHaveBeenCalled();
        expect(requestChannels.at(-1)?.name).toBe('conciergeResponses_20');
        requestChannels.at(-1)?.receive(message);
        emit();
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('clears each requested reply when read and does not revive it through late events or marking it unread again', async () => {
        updateUnread(1, [reportID]);
        await start();
        await start({responseReportActionID: '201', questionReportActionID: '101'});
        await saveResponse();
        await saveResponse(reportID, '201', finalReadTime);
        await markRead(partialReadTime);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await markRead(finalReadTime);
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        await saveResponse();
        emit({status: 'completed', sequence: 3});
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        await markRead(beforeResponse);
        updateUnread(1, [reportID]);
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
    });

    it.each([
        {name: 'thread', replyReportID: threadID, otherReportID: reportID},
        {name: 'DM fallback', replyReportID: reportID, otherReportID: threadID},
    ])('follows the actual $name reply and ignores reads of other reports', async ({replyReportID, otherReportID}) => {
        updateUnread(1, [replyReportID]);
        await markRead(beforeResponse, threadID);
        await start();
        await saveQuestion({childReportID: threadID});
        emit({reportID: replyReportID});
        await saveResponse(replyReportID);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await markRead(finalReadTime, otherReportID);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await markRead(finalReadTime, replyReportID);
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
        updateUnread(0);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('isolates failed requests and ignores unrelated or stale response events', async () => {
        await start();
        await start({responseReportActionID: '201', questionReportActionID: '101'});
        emit({reportActionID: '201', actorAccountID: 999});
        emit({reportActionID: 'other'});
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        emit({reportActionID: '201', sequence: 5});
        await saveQuestion({errors: {error: 'Unable to send'}});
        emit();
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        emit({reportActionID: '201', status: 'failed', sequence: 4});
        emit({reportActionID: '201', status: 'failed', sequence: 6, streamSessionID: 'old-stream'});
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        emit({reportActionID: '201', status: 'failed', sequence: 6});
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('retains queued offline questions without attention and expires a stalled response after sending', async () => {
        await start();
        jest.advanceTimersByTime(300000);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        await saveQuestion();
        jest.advanceTimersByTime(119999);
        emit();
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        jest.advanceTimersByTime(119999);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        jest.advanceTimersByTime(1);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        emit({status: 'updated', sequence: 2});
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });
});
