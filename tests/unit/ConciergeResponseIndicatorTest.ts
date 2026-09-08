import trackConciergeResponse from '@libs/ConciergeResponseIndicator';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import Pusher from '@libs/Pusher';
import type EventType from '@libs/Pusher/EventType';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import updateUnread, {setPageTitle} from '@libs/UnreadIndicatorUpdater/updateUnread';
import Visibility from '@libs/Visibility';

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
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {getTopmostReportId: jest.fn()},
    navigationRef: {isReady: jest.fn(() => true), addListener: jest.fn()},
}));
jest.mock('@libs/Visibility', () => ({
    __esModule: true,
    default: {isVisible: jest.fn(() => false), hasFocus: jest.fn(() => false), onVisibilityChange: jest.fn()},
}));
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
        created: '2026-09-08 12:00:00.000',
        ...overrides,
    };
    const eventType = batch ? 'conciergeDraftEvents' : `conciergeDraft${event.status[0].toUpperCase()}${event.status.slice(1)}`;
    const channel = `${CONST.PUSHER.PRIVATE_REPORT_CHANNEL_PREFIX}${event.reportID}${CONFIG.PUSHER.SUFFIX}`;
    for (const listener of [...(listeners.get(`${channel}:${eventType}`) ?? [])]) {
        listener(batch ? {events: [event]} : event);
    }
}

function start(overrides: Partial<Parameters<typeof trackConciergeResponse>[0]> = {}) {
    trackConciergeResponse({accountID, reportID, questionReportActionID: questionID, responseReportActionID: responseID, ...overrides});
}

async function saveQuestion(extra = {}) {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[questionID]: {reportActionID: questionID, pendingAction: null, ...extra}});
}

async function saveResponse(id = reportID) {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${id}`, {
        [responseID]: {reportActionID: responseID, actorAccountID: CONST.ACCOUNT_ID.CONCIERGE, pendingAction: null},
    });
}

describe('Concierge response favicon', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID});
        await waitForBatchedUpdates();
        listeners.clear();
        jest.useFakeTimers();
        jest.mocked(Pusher.subscribe).mockImplementation((channel, event, callback) => {
            const key = `${channel}:${event}`;
            const callbacks = listeners.get(key) ?? new Set<DraftListener>();
            listeners.set(key, callbacks);
            // Pusher wraps callbacks independently, even when two requests share a handler.
            const listener: DraftListener = (data) => callback?.(data);
            callbacks.add(listener);
            return Object.assign(Promise.resolve(), {unsubscribe: () => callbacks.delete(listener)});
        });
        jest.mocked(Visibility.isVisible).mockReturnValue(false);
        jest.mocked(Visibility.hasFocus).mockReturnValue(false);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        jest.mocked(navigationRef.isReady).mockReturnValue(true);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue(reportID);
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

    it('preserves unread counts and keeps Concierge priority through title updates and back navigation', () => {
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        updateUnread(2);
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
        start();
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        setPageTitle('Settings');
        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(document.title).toContain('(2) Settings');
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        emit({status: 'failed'});
        expect(favicon()).toBe(CONFIG.FAVICON.UNREAD);
    });

    it('waits for a confirmed stream in shared rooms', () => {
        start({shouldShowPending: false});
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        emit();
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
    });

    it('retains a background completion until the user returns, even on a different page', () => {
        start();
        emit({}, true);
        emit({status: 'completed', sequence: 2}, true);
        jest.advanceTimersByTime(300000);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        jest.mocked(Visibility.isVisible).mockReturnValue(true);
        jest.mocked(Visibility.hasFocus).mockReturnValue(true);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue('settings');
        window.dispatchEvent(new Event('focus'));
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('does not acknowledge an unfinished response on focus', () => {
        start();
        emit();
        jest.mocked(Visibility.isVisible).mockReturnValue(true);
        jest.mocked(Visibility.hasFocus).mockReturnValue(true);
        window.dispatchEvent(new Event('focus'));
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        emit({status: 'completed', sequence: 2});
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('acknowledges only ready requests when another question is still streaming', () => {
        start();
        start({responseReportActionID: '201', questionReportActionID: '101'});
        emit({status: 'completed'});
        jest.mocked(Visibility.isVisible).mockReturnValue(true);
        jest.mocked(Visibility.hasFocus).mockReturnValue(true);
        window.dispatchEvent(new Event('focus'));
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        emit({reportActionID: '201', status: 'cleared'});
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('shares report listeners and keeps them until the last unfinished request completes', () => {
        const connect = jest.spyOn(Onyx, 'connectWithoutView');
        const disconnect = jest.spyOn(Onyx, 'disconnect');
        start();
        start({responseReportActionID: '201', questionReportActionID: '101'});
        expect(connect).toHaveBeenCalledTimes(1);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 1)).toBe(true);

        emit({status: 'completed'});
        expect(disconnect).not.toHaveBeenCalled();
        expect([...listeners.values()].every((callbacks) => callbacks.size === 1)).toBe(true);

        emit({reportActionID: '201', status: 'completed'});
        expect(disconnect).toHaveBeenCalledTimes(1);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);

        // A new question can subscribe again while earlier replies still await acknowledgement.
        start({responseReportActionID: '202', questionReportActionID: '102'});
        expect(connect).toHaveBeenCalledTimes(2);
        emit({reportActionID: '202', status: 'failed'});
        expect(disconnect).toHaveBeenCalledTimes(2);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
    });

    it('keeps a shared report subscribed when one send fails', async () => {
        const disconnect = jest.spyOn(Onyx, 'disconnect');
        start();
        start({responseReportActionID: '201', questionReportActionID: '101'});
        await saveQuestion({errors: {error: 'Unable to send'}});
        expect(disconnect).not.toHaveBeenCalled();
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        emit({reportActionID: '201', status: 'failed'});
        expect(disconnect).toHaveBeenCalledTimes(1);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it("uses the latest shared actions to find a new request's reply thread", async () => {
        const connect = jest.spyOn(Onyx, 'connectWithoutView');
        const disconnect = jest.spyOn(Onyx, 'disconnect');
        start();
        const secondQuestionID = '101';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
            [secondQuestionID]: {reportActionID: secondQuestionID, pendingAction: null, childReportID: threadID},
        });
        start({responseReportActionID: '201', questionReportActionID: '101'});
        expect(connect).toHaveBeenCalledTimes(2);
        emit({reportID: threadID, reportActionID: '201', status: 'completed'});
        expect(disconnect).toHaveBeenCalledTimes(1);
        emit({status: 'failed'});
        expect(disconnect).toHaveBeenCalledTimes(2);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
    });

    it('ignores unsolicited, custom-agent, stale, and mismatched stream events', () => {
        emit();
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        start();
        emit({status: 'failed', actorAccountID: 999});
        emit({status: 'failed', reportActionID: 'other'});
        emit({sequence: 5});
        emit({status: 'failed', sequence: 4});
        emit({status: 'failed', sequence: 6, streamSessionID: 'old-stream'});
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        emit({status: 'failed', sequence: 6});
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('tracks the response thread without a mounted report and releases only its own listeners', async () => {
        start({responseReportID: threadID});
        await saveQuestion({childReportID: '401'});
        emit({reportID: '401'});
        emit({reportID: '401', status: 'failed', sequence: 2});
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
    });

    it('removes a failed send', async () => {
        start();
        await saveQuestion({errors: {error: 'Unable to send'}});
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('ends the provisional indicator for a non-streamed response, but accepts late draft events', async () => {
        start();
        await saveQuestion();
        await saveResponse();
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        emit({status: 'completed'});
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
    });

    it('recovers a missing completion from the durable reply after streaming has started', async () => {
        const disconnect = jest.spyOn(Onyx, 'disconnect');
        start();
        emit();
        await saveResponse();
        expect(disconnect).toHaveBeenCalledTimes(1);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
        jest.advanceTimersByTime(300000);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
    });

    it('expires stalled responses after the send succeeds, but retains queued offline sends', async () => {
        start();
        jest.advanceTimersByTime(300000);
        expect(favicon()).toBe(CONFIG.FAVICON.CONCIERGE_UNREAD);
        await saveQuestion();
        jest.advanceTimersByTime(120000);
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
    });

    it('clears subscriptions and attention when the account changes', async () => {
        start();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 20});
        await waitForBatchedUpdates();
        expect(favicon()).toBe(CONFIG.FAVICON.DEFAULT);
        expect([...listeners.values()].every((callbacks) => callbacks.size === 0)).toBe(true);
    });
});
