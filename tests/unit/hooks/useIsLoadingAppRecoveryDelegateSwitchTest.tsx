import {act, renderHook} from '@testing-library/react-native';

import useIsLoadingAppRecovery from '@hooks/useIsLoadingAppRecovery';

import {openApp} from '@libs/actions/App';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as NetworkStore from '@libs/Network/NetworkStore';
import * as SequentialQueue from '@libs/Network/SequentialQueue';

import * as PersistedRequests from '@userActions/PersistedRequests';

import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxRequest from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/App', () => ({openApp: jest.fn()}));
jest.mock('@libs/Log');

async function markLoadedWithMissingFlag() {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.HAS_LOADED_APP, true);
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, null);
        await waitForBatchedUpdates();
    });
    expect(await getOnyxValue(ONYXKEYS.IS_LOADING_APP)).toBeUndefined();
}

async function renderAndSettle() {
    renderHook(() => useIsLoadingAppRecovery());
    await act(async () => {
        await waitForBatchedUpdates();
    });
}

describe('useIsLoadingAppRecovery missing-flag branch', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(openApp).mockClear();
        NetworkStore.setIsAuthenticating(false);
        await act(async () => {
            await Onyx.clear();
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1});
            await waitForBatchedUpdates();
        });
    });

    afterEach(async () => {
        await act(async () => {
            SequentialQueue.unpause();
            await PersistedRequests.clear();
            await waitForBatchedUpdates();
        });
        NetworkStore.setIsAuthenticating(false);
    });

    it('stays quiet while a short-lived sign-in is in flight', async () => {
        // Given an app that reports itself loaded with the flag missing, and the marker the short-lived login path writes.
        await markLoadedWithMissingFlag();
        await act(async () => {
            await Onyx.set(ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN, true);
            await waitForBatchedUpdates();
        });

        // When the recovery hook runs, it must not re-open the app underneath the sign-in.
        await renderAndSettle();

        // Then the sign-in keeps the session it is building.
        expect(openApp).not.toHaveBeenCalled();
    });

    it('stays quiet while the network layer is authenticating a restored session', async () => {
        // Given the same missing flag while a reauth-driven restoration holds the network layer's own marker.
        await markLoadedWithMissingFlag();
        NetworkStore.setIsAuthenticating(true);

        // When the recovery hook runs.
        await renderAndSettle();

        // Then no second load is queued against the session being restored.
        expect(openApp).not.toHaveBeenCalled();
    });

    it('stays quiet while a load that owns the flag is pending', async () => {
        // Given the same missing flag and an OpenApp sitting in the sequential queue's persisted inventory.
        await markLoadedWithMissingFlag();
        await act(async () => {
            SequentialQueue.pause();
            await SequentialQueue.push({command: WRITE_COMMANDS.OPEN_APP, requestID: 1} as OnyxRequest<'hasLoadedApp'>);
            await waitForBatchedUpdates();
        });

        const pendingLoad = [PersistedRequests.getOngoingRequest(), ...PersistedRequests.getAll()].some(
            (request) => request?.command === WRITE_COMMANDS.OPEN_APP || request?.command === WRITE_COMMANDS.RECONNECT_APP,
        );
        expect(pendingLoad).toBe(true);

        // When the recovery hook runs.
        await renderAndSettle();

        // Then it waits for the load that owns the flag instead of starting a competing one.
        expect(openApp).not.toHaveBeenCalled();
    });

    it('re-opens the app when the flag is missing with no load and no sign-in', async () => {
        // Given the missing flag with every in-flight signal clear.
        await markLoadedWithMissingFlag();

        // When the recovery hook runs.
        await renderAndSettle();

        // Then the stranded flag is healed by a fresh load.
        expect(openApp).toHaveBeenCalledTimes(1);
    });
});
