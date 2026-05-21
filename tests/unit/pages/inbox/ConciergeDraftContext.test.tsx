import {act, renderHook, waitFor} from '@testing-library/react-native';
import type {PropsWithChildren} from 'react';
import Onyx from 'react-native-onyx';
import Pusher from '@libs/Pusher';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import {ConciergeDraftProvider, useConciergeDraft} from '@pages/inbox/ConciergeDraftContext';
import {applyConciergeDraftEvent, getCachedDraft, setCachedDraft} from '@pages/inbox/conciergeDraftState';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

jest.mock('@libs/Pusher', () => ({
    TYPE: {
        CONCIERGE_DRAFT_STARTED: 'conciergeDraftStarted',
        CONCIERGE_DRAFT_UPDATED: 'conciergeDraftUpdated',
        CONCIERGE_DRAFT_COMPLETED: 'conciergeDraftCompleted',
        CONCIERGE_DRAFT_FAILED: 'conciergeDraftFailed',
        CONCIERGE_DRAFT_CLEARED: 'conciergeDraftCleared',
    },
    subscribe: jest.fn(() => Object.assign(Promise.resolve(), {unsubscribe: jest.fn()})),
}));

jest.mock('@libs/actions/Report', () => ({
    getReportChannelName: (reportID: string) => `private-report-${reportID}`,
}));

const REPORT_ID = '123';
const REPORT_ACTION_ID = '456';
const CREATED = '2026-04-03 10:00:00.000';
const STREAM_SESSION_ID = 'stream-session-1';
const TARGET_BODY_MARKDOWN = 'Hello';
const COMPLETED_BODY_MARKDOWN = 'Hello world';
const FINAL_RENDERED_HTML = '<comment>Server final response</comment>';

type MockPusherSubscribe = jest.MockedFunction<
    (channelName: string, eventName?: string, eventCallback?: (event: ConciergeDraftEvent) => void, onResubscribe?: () => void) => ReturnType<typeof Pusher.subscribe>
>;

function getMockPusherSubscribe(): MockPusherSubscribe {
    return Pusher.subscribe as MockPusherSubscribe;
}

function getFirstMessageText(reportAction: ReportAction | null): string | undefined {
    const message = reportAction?.message;

    if (!Array.isArray(message)) {
        return undefined;
    }

    return message.at(0)?.text;
}

function createDraftEvent(bodyMarkdown: string, overrides: Partial<ConciergeDraftEvent> = {}): ConciergeDraftEvent {
    return {
        reportID: REPORT_ID,
        reportActionID: REPORT_ACTION_ID,
        streamSessionID: STREAM_SESSION_ID,
        sequence: 1,
        status: 'updated' as const,
        created: CREATED,
        bodyMarkdown,
        ...overrides,
    };
}

function emitPusherEvent(eventType: string, event: ConciergeDraftEvent) {
    const subscriptionCall = getMockPusherSubscribe().mock.calls.find(([, subscribedEventType]) => subscribedEventType === eventType);
    const callback = subscriptionCall?.[2];

    if (typeof callback !== 'function') {
        throw new Error(`Expected subscription callback for ${eventType}`);
    }

    callback(event);
}

describe('ConciergeDraftContext', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        getMockPusherSubscribe().mockClear();
        setCachedDraft(REPORT_ID, null);
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, REPORT_ID);
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        setCachedDraft(REPORT_ID, null);
        await Onyx.clear();
    });

    it('resumes pending completion after remount and applies the cached final HTML', async () => {
        // Given a cached draft with pending completion
        const visibleDraft = applyConciergeDraftEvent(null, createDraftEvent('H'), REPORT_ID);
        if (!visibleDraft) {
            throw new Error('Expected visible draft to be created');
        }
        setCachedDraft(REPORT_ID, {
            ...visibleDraft,
            pusherTargetBodyMarkdown: TARGET_BODY_MARKDOWN,
            pusherTargetSequence: 1,
            pusherPendingCompletionEvent: createDraftEvent('', {
                sequence: 2,
                status: 'completed',
                bodyMarkdown: undefined,
                finalRenderedHTML: FINAL_RENDERED_HTML,
            }),
        });

        const wrapper = ({children}: PropsWithChildren) => <ConciergeDraftProvider reportID={REPORT_ID}>{children}</ConciergeDraftProvider>;
        // When the provider remounts
        const {result, unmount} = renderHook(() => useConciergeDraft(), {wrapper});

        // Then the cached completion applies final HTML after pacing catches up
        await waitFor(() => {
            expect(getCachedDraft(REPORT_ID)?.status).toBe('completed');
            expect(getFirstMessageText(result.current.draftReportAction)).toBe('Server final response');
        });
        expect(getCachedDraft(REPORT_ID)?.pusherPendingCompletionEvent).toBeUndefined();

        unmount();
    });

    it('does not apply completed final HTML until the paced Pusher target is fully visible', async () => {
        const wrapper = ({children}: PropsWithChildren) => <ConciergeDraftProvider reportID={REPORT_ID}>{children}</ConciergeDraftProvider>;
        const {result, unmount} = renderHook(() => useConciergeDraft(), {wrapper});

        await waitFor(() => {
            expect(Pusher.subscribe).toHaveBeenCalledTimes(5);
        });

        // Given an active paced Pusher target
        act(() => {
            emitPusherEvent(Pusher.TYPE.CONCIERGE_DRAFT_UPDATED, createDraftEvent(TARGET_BODY_MARKDOWN));
        });
        expect(getFirstMessageText(result.current.draftReportAction)).toBe('H');

        // When completion arrives before the visible body reaches the target
        act(() => {
            emitPusherEvent(
                Pusher.TYPE.CONCIERGE_DRAFT_COMPLETED,
                createDraftEvent('', {
                    sequence: 2,
                    status: 'completed',
                    bodyMarkdown: undefined,
                    finalRenderedHTML: FINAL_RENDERED_HTML,
                }),
            );
        });

        // Then final HTML waits until the banked text is visible
        expect(getFirstMessageText(result.current.draftReportAction)).toBe('He');
        expect(getFirstMessageText(result.current.draftReportAction)).not.toBe('Server final response');
        expect(result.current.isDraftPendingCompletion).toBe(true);

        unmount();
    });

    it('paces bodyMarkdown from a completed Pusher event before applying final HTML', async () => {
        const wrapper = ({children}: PropsWithChildren) => <ConciergeDraftProvider reportID={REPORT_ID}>{children}</ConciergeDraftProvider>;
        const {result, unmount} = renderHook(() => useConciergeDraft(), {wrapper});

        await waitFor(() => {
            expect(Pusher.subscribe).toHaveBeenCalledTimes(5);
        });

        // Given an in-progress Pusher target
        act(() => {
            emitPusherEvent(Pusher.TYPE.CONCIERGE_DRAFT_UPDATED, createDraftEvent(TARGET_BODY_MARKDOWN));
        });
        expect(getFirstMessageText(result.current.draftReportAction)).toBe('H');

        // When completion includes final markdown and server HTML
        act(() => {
            emitPusherEvent(
                Pusher.TYPE.CONCIERGE_DRAFT_COMPLETED,
                createDraftEvent(COMPLETED_BODY_MARKDOWN, {
                    sequence: 2,
                    status: 'completed',
                    finalRenderedHTML: FINAL_RENDERED_HTML,
                }),
            );
        });

        // Then the completed markdown paces before final HTML is applied
        expect(getFirstMessageText(result.current.draftReportAction)).toBe('Hell');
        expect(getFirstMessageText(result.current.draftReportAction)).not.toBe('Server final response');
        expect(getCachedDraft(REPORT_ID)?.pusherTargetBodyMarkdown).toBe(COMPLETED_BODY_MARKDOWN);

        await waitFor(() => {
            expect(getCachedDraft(REPORT_ID)?.status).toBe('completed');
            expect(getFirstMessageText(result.current.draftReportAction)).toBe('Server final response');
            expect(result.current.isDraftPendingCompletion).toBe(false);
        });

        unmount();
    });

    it('renders bodyMarkdown from a completed Pusher event without final HTML', async () => {
        // Given a mounted draft provider with no prior Pusher target
        const wrapper = ({children}: PropsWithChildren) => <ConciergeDraftProvider reportID={REPORT_ID}>{children}</ConciergeDraftProvider>;
        const {result, unmount} = renderHook(() => useConciergeDraft(), {wrapper});

        await waitFor(() => {
            expect(Pusher.subscribe).toHaveBeenCalledTimes(5);
        });

        // When completion arrives with markdown only
        act(() => {
            emitPusherEvent(
                Pusher.TYPE.CONCIERGE_DRAFT_COMPLETED,
                createDraftEvent(TARGET_BODY_MARKDOWN, {
                    status: 'completed',
                }),
            );
        });

        expect(getFirstMessageText(result.current.draftReportAction)).toBe('He');
        expect(result.current.isDraftPendingCompletion).toBe(true);

        // Then the completed markdown becomes fully visible
        await waitFor(() => {
            expect(getCachedDraft(REPORT_ID)?.status).toBe('completed');
            expect(getFirstMessageText(result.current.draftReportAction)).toBe(TARGET_BODY_MARKDOWN);
        });

        unmount();
    });
});
