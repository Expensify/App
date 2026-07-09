import {act, render} from '@testing-library/react-native';

import {openApp} from '@userActions/App';

import DelegateAccessHandler from '@src/DelegateAccessHandler';
import * as PersistedRequests from '@src/libs/actions/PersistedRequests';
import ONYXKEYS from '@src/ONYXKEYS';
import type Request from '@src/types/onyx/Request';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/App', () => ({
    openApp: jest.fn(),
}));

jest.mock('@userActions/Delegate', () => ({
    disconnect: jest.fn(),
}));

const RECOVERY_DELAY_MS = 10000;

describe('DelegateAccessHandler stuck isLoadingApp recovery', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await PersistedRequests.clear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    async function renderWithStrandedState(isLoadingApp: boolean | undefined) {
        await Onyx.multiSet({
            [ONYXKEYS.HAS_LOADED_APP]: true,
            ...(isLoadingApp === undefined ? {} : {[ONYXKEYS.IS_LOADING_APP]: isLoadingApp}),
        });
        await waitForBatchedUpdates();

        // The recovery timeout must be scheduled under fake timers so the test controls when it fires.
        jest.useFakeTimers({doNotFake: ['nextTick']});
        render(<DelegateAccessHandler />);
        await waitForBatchedUpdatesWithAct();
        act(() => {
            jest.advanceTimersByTime(RECOVERY_DELAY_MS);
        });
        await waitForBatchedUpdatesWithAct();
    }

    it('re-fires openApp when isLoadingApp is stranded true with no pending OpenApp', async () => {
        await renderWithStrandedState(true);

        expect(openApp).toHaveBeenCalledTimes(1);
    });

    it('does not re-fire while an OpenApp is still pending in the queue', async () => {
        const pendingOpenApp: Request<never> = {command: 'OpenApp'};
        await PersistedRequests.save(pendingOpenApp);

        await renderWithStrandedState(true);

        expect(openApp).not.toHaveBeenCalled();
    });

    it('keeps checking and recovers once a pending OpenApp is dropped without settling', async () => {
        const pendingOpenApp: Request<never> = {command: 'OpenApp'};
        await PersistedRequests.save(pendingOpenApp);

        await renderWithStrandedState(true);
        expect(openApp).not.toHaveBeenCalled();

        // The pending request is removed without its finallyData ever applying, so the flag stays true.
        // The effect dependencies do not change, so only the rescheduled check can catch this.
        await PersistedRequests.clear();
        act(() => {
            jest.advanceTimersByTime(RECOVERY_DELAY_MS);
        });
        await waitForBatchedUpdatesWithAct();

        expect(openApp).toHaveBeenCalledTimes(1);
    });

    it('does not re-fire when isLoadingApp already cleared to false', async () => {
        await renderWithStrandedState(false);

        expect(openApp).not.toHaveBeenCalled();
    });
});
