import {isServerDataReady, resetAllChecks} from '@userActions/Welcome';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('isServerDataReady', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        resetAllChecks();
        await waitForBatchedUpdates();
    });

    it('stays false when only a stale value from the previous session is cached', async () => {
        // Given a reopened app where IS_LOADING_REPORT_DATA is still persisted as false from the last session
        await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        await waitForBatchedUpdates();

        // Then the first sync of this session hasn't happened yet, so onboarding decisions must keep waiting
        expect(isServerDataReady()).toBe(false);
    });

    it('turns true when the first sync finishes and stays true during a later reconnect', async () => {
        // Given this session's first OpenApp or ReconnectApp starts and finishes
        await Onyx.merge(ONYXKEYS.IS_LOADING_REPORT_DATA, true);
        await waitForBatchedUpdates();
        expect(isServerDataReady()).toBe(false);
        await Onyx.merge(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        await waitForBatchedUpdates();
        expect(isServerDataReady()).toBe(true);

        // When a later reconnect sets IS_LOADING_REPORT_DATA to true again
        await Onyx.merge(ONYXKEYS.IS_LOADING_REPORT_DATA, true);
        await waitForBatchedUpdates();

        // Then the guards keep treating the app as loaded, so a reconnect can't make them skip their checks
        expect(isServerDataReady()).toBe(true);
    });

    it('turns false again after the checks are reset', async () => {
        // Given the first sync of the session has finished
        await Onyx.merge(ONYXKEYS.IS_LOADING_REPORT_DATA, true);
        await waitForBatchedUpdates();
        await Onyx.merge(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        await waitForBatchedUpdates();

        // When the checks are reset, as on sign-out
        resetAllChecks();

        // Then the next account has to wait for its own first sync
        expect(isServerDataReady()).toBe(false);
    });
});
