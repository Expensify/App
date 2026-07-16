import {act, renderHook, waitFor} from '@testing-library/react-native';

import useIsLoadingAppShadowLog from '@hooks/useIsLoadingAppShadowLog';

import {WRITE_COMMANDS} from '@libs/API/types';
import type {WriteCommand} from '@libs/API/types';
import Log from '@libs/Log';
import type * as NetworkStateModule from '@libs/NetworkState';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyRequest} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// The hook's useNetwork import chain (NetworkState -> Log -> Network -> SequentialQueue -> PersistedRequests)
// loads the real request-queue engine. Left alone, the engine picks up the fake requests these tests write to
// the queue keys, processes them, and clears the keys mid-test. Forcing offline keeps the engine inert
// (SequentialQueue.flush returns early while offline), so the fake queue contents stay exactly as written.
jest.mock('@libs/NetworkState', () => ({
    ...jest.requireActual<typeof NetworkStateModule>('@libs/NetworkState'),
    getIsOffline: () => true,
}));

const DISAGREEMENT_MESSAGE = '[InFlightRequests] IS_LOADING_APP disagrees with queue truth';

type InfoSpy = jest.SpyInstance<ReturnType<typeof Log.info>, Parameters<typeof Log.info>>;

const buildRequest = (command: WriteCommand): AnyRequest => ({command, data: {}});
const setPersistedRequests = (requests: AnyRequest[]) => Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests).then(waitForBatchedUpdates);
const setIsLoadingApp = (value: boolean) => Onyx.set(ONYXKEYS.IS_LOADING_APP, value).then(waitForBatchedUpdates);

const countDisagreementLogs = (spy: InfoSpy) => spy.mock.calls.filter((call) => call.at(0) === DISAGREEMENT_MESSAGE).length;

describe('useIsLoadingAppShadowLog', () => {
    let infoSpy: InfoSpy;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        infoSpy = jest.spyOn(Log, 'info').mockImplementation(() => undefined);
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        infoSpy.mockRestore();
    });

    it('does not log while the stored flag and the queue truth agree', async () => {
        const {rerender} = renderHook(() => useIsLoadingAppShadowLog());
        await act(() => waitForBatchedUpdates());
        rerender(undefined);
        await act(() => waitForBatchedUpdates());
        expect(countDisagreementLogs(infoSpy)).toBe(0);
    });

    it('logs once when they disagree, and not again while the disagreement persists', async () => {
        renderHook(() => useIsLoadingAppShadowLog());
        await act(() => waitForBatchedUpdates());

        // Queue an app-load request while the stored flag stays unset: the queue reads pending, the flag does not.
        await act(() => setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_APP)]));
        await waitFor(() => expect(infoSpy).toHaveBeenCalledWith(DISAGREEMENT_MESSAGE, false, expect.objectContaining({queueIsAppLoadPending: true})));
        expect(countDisagreementLogs(infoSpy)).toBe(1);

        // The disagreement is unchanged (still an app-load request queued), so no second log even after churn.
        await act(() => setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_APP), buildRequest(WRITE_COMMANDS.OPEN_APP)]));
        await act(() => waitForBatchedUpdates());
        expect(countDisagreementLogs(infoSpy)).toBe(1);
    });

    it('logs again on a fresh disagreement after agreement is restored', async () => {
        renderHook(() => useIsLoadingAppShadowLog());
        await act(() => waitForBatchedUpdates());

        await act(() => setPersistedRequests([buildRequest(WRITE_COMMANDS.OPEN_APP)]));
        await waitFor(() => expect(countDisagreementLogs(infoSpy)).toBe(1));

        // Restore agreement: flag true and an app-load request queued -> both read pending.
        await act(() => setIsLoadingApp(true));
        await act(() => waitForBatchedUpdates());
        expect(countDisagreementLogs(infoSpy)).toBe(1);

        // Break it again: clear the queue while the flag stays true -> flag pending, queue not.
        await act(() => setPersistedRequests([]));
        await waitFor(() => expect(countDisagreementLogs(infoSpy)).toBe(2));
    });
});
