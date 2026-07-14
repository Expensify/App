import {act, renderHook} from '@testing-library/react-native';

import {WRITE_COMMANDS} from '@libs/API/types';
import {useIsAppLoadPending, useIsLoadingBarPending, useIsReportLoadPending} from '@libs/PendingRequests';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyRequest} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const buildRequest = (command: string, data: Record<string, unknown> = {}, extra: Partial<AnyRequest> = {}): AnyRequest => ({command, data, ...extra});

const setPersistedRequests = (requests: AnyRequest[]) => Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests).then(waitForBatchedUpdates);

const setOngoingRequest = (request: AnyRequest | null) => Onyx.set(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, request).then(waitForBatchedUpdates);

describe('PendingRequests', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        Onyx.clear();
        return waitForBatchedUpdates();
    });

    describe('useIsAppLoadPending', () => {
        it('returns false when the queue is empty', () => {
            const {result} = renderHook(() => useIsAppLoadPending());
            expect(result.current).toBe(false);
        });

        it('returns true when a persisted OpenApp request is queued', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_APP)]);
            const {result} = renderHook(() => useIsAppLoadPending());
            expect(result.current).toBe(true);
        });

        it('returns true when a persisted ReconnectApp request is queued', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.RECONNECT_APP)]);
            const {result} = renderHook(() => useIsAppLoadPending());
            expect(result.current).toBe(true);
        });

        it('returns true when the ongoing request is an app-load request', async () => {
            await setOngoingRequest(buildRequest(WRITE_COMMANDS.OPEN_APP));
            const {result} = renderHook(() => useIsAppLoadPending());
            expect(result.current).toBe(true);
        });

        it('returns false for an unrelated command', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_REPORT, {reportID: '1'})]);
            const {result} = renderHook(() => useIsAppLoadPending());
            expect(result.current).toBe(false);
        });

        it('does not apply the offline filter (only the loadingBar group does)', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_APP, {}, {initiatedOffline: true})]);
            const {result} = renderHook(() => useIsAppLoadPending());
            expect(result.current).toBe(true);
        });

        it('updates reactively when the queue changes', async () => {
            const {result} = renderHook(() => useIsAppLoadPending());
            expect(result.current).toBe(false);

            await act(() => setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_APP)]));
            expect(result.current).toBe(true);

            await act(() => setPersistedRequests([]));
            expect(result.current).toBe(false);
        });
    });

    describe('useIsReportLoadPending', () => {
        it('returns true only for a matching reportID', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_REPORT, {reportID: '1234'})]);

            const {result: matching} = renderHook(() => useIsReportLoadPending('1234'));
            expect(matching.current).toBe(true);

            const {result: nonMatching} = renderHook(() => useIsReportLoadPending('9999'));
            expect(nonMatching.current).toBe(false);
        });

        it('matches the ongoing OpenReport request when the reportID matches', async () => {
            await setOngoingRequest(buildRequest(WRITE_COMMANDS.OPEN_REPORT, {reportID: '1234'}));

            const {result: matching} = renderHook(() => useIsReportLoadPending('1234'));
            expect(matching.current).toBe(true);

            const {result: nonMatching} = renderHook(() => useIsReportLoadPending('5678'));
            expect(nonMatching.current).toBe(false);
        });
    });

    describe('useIsLoadingBarPending', () => {
        it('returns true for any relevant persisted command', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.READ_NEWEST_ACTION)]);
            const {result} = renderHook(() => useIsLoadingBarPending());
            expect(result.current).toBe(true);
        });

        it('filters out persisted requests initiated offline', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_APP, {}, {initiatedOffline: true})]);
            const {result} = renderHook(() => useIsLoadingBarPending());
            expect(result.current).toBe(false);
        });

        it('counts persisted requests not initiated offline', async () => {
            await setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_APP, {}, {initiatedOffline: false})]);
            const {result} = renderHook(() => useIsLoadingBarPending());
            expect(result.current).toBe(true);
        });

        it('does NOT filter the ongoing request by initiatedOffline', async () => {
            await setOngoingRequest(buildRequest(WRITE_COMMANDS.OPEN_APP, {}, {initiatedOffline: true}));
            const {result} = renderHook(() => useIsLoadingBarPending());
            expect(result.current).toBe(true);
        });
    });
});
