import {act, renderHook, waitFor} from '@testing-library/react-native';

import {useIsAppLoadPending, useIsLoadingBarPending, useIsReportLoadPending} from '@hooks/useInFlightRequests';

import {WRITE_COMMANDS} from '@libs/API/types';
import type {WriteCommand} from '@libs/API/types';
import type * as NetworkStateModule from '@libs/NetworkState';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyRequest} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// The module under test imports useNetwork, whose import chain (NetworkState -> Log -> Network ->
// SequentialQueue -> PersistedRequests) loads the real request-queue engine. Left alone, the engine picks
// up the fake requests these tests write to the queue keys, processes them, and clears the keys mid-test.
// Forcing the network state to offline keeps the engine inert (SequentialQueue.flush returns early while
// offline), so the fake queue contents stay exactly as written. The hooks under test never read network state.
jest.mock('@libs/NetworkState', () => ({
    ...jest.requireActual<typeof NetworkStateModule>('@libs/NetworkState'),
    getIsOffline: () => true,
}));

const buildRequest = (command: WriteCommand, data: Record<string, unknown> = {}, extra: Partial<AnyRequest> = {}): AnyRequest => ({command, data, ...extra});

const setPersistedRequests = (requests: AnyRequest[]) => Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests).then(waitForBatchedUpdates);

const setOngoingRequest = (request: AnyRequest | null) => Onyx.set(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, request).then(waitForBatchedUpdates);

const setIsLoadingApp = (isLoadingApp: boolean) => Onyx.set(ONYXKEYS.IS_LOADING_APP, isLoadingApp).then(waitForBatchedUpdates);

const setHasLoadedApp = (hasLoadedApp: boolean) => Onyx.set(ONYXKEYS.HAS_LOADED_APP, hasLoadedApp).then(waitForBatchedUpdates);

describe('useInFlightRequests', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear().then(waitForBatchedUpdates);
        // useIsAppLoadPending keeps a process-session latch (module-level) that survives Onyx.clear.
        // Render it once against the cleared state so its reset effect runs, isolating each test.
        const {unmount} = renderHook(() => useIsAppLoadPending());
        await act(() => waitForBatchedUpdates());
        unmount();
    });

    describe('useIsAppLoadPending', () => {
        it('returns false when the queue is empty', async () => {
            const {result} = renderHook(() => useIsAppLoadPending());
            await act(() => waitForBatchedUpdates());
            expect(result.current).toBe(false);
        });

        it('returns true when a persisted OpenApp request is queued', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_APP)]);
            const {result} = renderHook(() => useIsAppLoadPending());
            await waitFor(() => expect(result.current).toBe(true));
        });

        it('returns false for a ReconnectApp request (background reconnect is not an app load)', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.RECONNECT_APP)]);
            const {result} = renderHook(() => useIsAppLoadPending());
            await act(() => waitForBatchedUpdates());
            expect(result.current).toBe(false);
        });

        it('returns true when the ongoing request is an app-load request', async () => {
            await setOngoingRequest(buildRequest(WRITE_COMMANDS.OPEN_APP));
            const {result} = renderHook(() => useIsAppLoadPending());
            await waitFor(() => expect(result.current).toBe(true));
        });

        it('returns false for an unrelated command', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_REPORT, {reportID: '1'})]);
            const {result} = renderHook(() => useIsAppLoadPending());
            await act(() => waitForBatchedUpdates());
            expect(result.current).toBe(false);
        });

        it('does not apply the offline filter (only the loadingBar group does)', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_APP, {}, {initiatedOffline: true})]);
            const {result} = renderHook(() => useIsAppLoadPending());
            await waitFor(() => expect(result.current).toBe(true));
        });

        it('updates reactively when the queue changes', async () => {
            const {result} = renderHook(() => useIsAppLoadPending());
            await act(() => waitForBatchedUpdates());
            expect(result.current).toBe(false);

            await act(() => setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_APP)]));
            await waitFor(() => expect(result.current).toBe(true));

            await act(() => setPersistedRequests([]));
            await waitFor(() => expect(result.current).toBe(false));
        });

        it('stays pending across the OpenApp flush window even when the app was already loaded (account switch)', async () => {
            // An account switch preserves HAS_LOADED_APP=true and seeds IS_LOADING_APP=true before firing OpenApp.
            // The request's data and its IS_LOADING_APP clear are deferred until the queue drains, but the request
            // itself leaves the queue earlier, so gating on the queue alone (or on HAS_LOADED_APP, already true here)
            // would drop the skeleton mid-flush and render cleared account data.
            await setHasLoadedApp(true);
            await setIsLoadingApp(true);

            // OpenApp observed in the queue.
            await act(() => setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_APP)]));
            const {result: queuedResult, unmount: unmountQueuedConsumer} = renderHook(() => useIsAppLoadPending());
            await waitFor(() => expect(queuedResult.current).toBe(true));
            unmountQueuedConsumer();

            // Request removed but its deferred updates have not flushed (IS_LOADING_APP still true). A consumer that
            // mounts now, during the flush window, must still report pending even though HAS_LOADED_APP is true.
            await act(() => setPersistedRequests([]));
            const {result: flushingResult} = renderHook(() => useIsAppLoadPending());
            await act(() => waitForBatchedUpdates());
            expect(flushingResult.current).toBe(true);

            // Deferred updates flush and clear the flag: resolved.
            await act(() => setIsLoadingApp(false));
            await waitFor(() => expect(flushingResult.current).toBe(false));
        });

        it('ignores an IS_LOADING_APP flag stranded on disk when no OpenApp ran this session', async () => {
            // A fresh reload after an interrupted load: IS_LOADING_APP is stranded true from a previous session,
            // but this session runs ReconnectApp, not OpenApp, so no OpenApp is ever observed in the queue.
            await setHasLoadedApp(true);
            await setIsLoadingApp(true);
            const {result} = renderHook(() => useIsAppLoadPending());
            await act(() => waitForBatchedUpdates());
            expect(result.current).toBe(false);
        });
    });

    describe('useIsReportLoadPending', () => {
        it('returns true only for a matching reportID', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_REPORT, {reportID: '1234'})]);

            const {result: matching} = renderHook(() => useIsReportLoadPending('1234'));
            await waitFor(() => expect(matching.current).toBe(true));

            const {result: nonMatching} = renderHook(() => useIsReportLoadPending('9999'));
            await act(() => waitForBatchedUpdates());
            expect(nonMatching.current).toBe(false);
        });

        it('matches the ongoing OpenReport request when the reportID matches', async () => {
            await setOngoingRequest(buildRequest(WRITE_COMMANDS.OPEN_REPORT, {reportID: '1234'}));

            const {result: matching} = renderHook(() => useIsReportLoadPending('1234'));
            await waitFor(() => expect(matching.current).toBe(true));

            const {result: nonMatching} = renderHook(() => useIsReportLoadPending('5678'));
            await act(() => waitForBatchedUpdates());
            expect(nonMatching.current).toBe(false);
        });
    });

    describe('useIsLoadingBarPending', () => {
        it('returns true for any relevant persisted command', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.READ_NEWEST_ACTION)]);
            const {result} = renderHook(() => useIsLoadingBarPending());
            await waitFor(() => expect(result.current).toBe(true));
        });

        it('filters out persisted requests initiated offline', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_APP, {}, {initiatedOffline: true})]);
            const {result} = renderHook(() => useIsLoadingBarPending());
            await act(() => waitForBatchedUpdates());
            expect(result.current).toBe(false);
        });

        it('counts persisted requests not initiated offline', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_APP, {}, {initiatedOffline: false})]);
            const {result} = renderHook(() => useIsLoadingBarPending());
            await waitFor(() => expect(result.current).toBe(true));
        });

        it('does NOT filter the ongoing request by initiatedOffline', async () => {
            await setOngoingRequest(buildRequest(WRITE_COMMANDS.OPEN_APP, {}, {initiatedOffline: true}));
            const {result} = renderHook(() => useIsLoadingBarPending());
            await waitFor(() => expect(result.current).toBe(true));
        });
    });
});
