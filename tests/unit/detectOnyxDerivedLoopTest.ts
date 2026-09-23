import detectOnyxDerivedLoop, {RECOMPUTE_THRESHOLD, resetOnyxDerivedLoopDetection, WINDOW_MS} from '@libs/telemetry/detectOnyxDerivedLoop';

import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';

import * as Sentry from '@sentry/react-native';
import Onyx from 'react-native-onyx';

jest.mock('@sentry/react-native', () => ({captureMessage: jest.fn()}));

const captureMessage = jest.mocked(Sentry.captureMessage);

const DERIVED_KEY = ONYXKEYS.DERIVED.REPORT_ATTRIBUTES;

function recompute(times: number, triggeredKey: OnyxKey = ONYXKEYS.COLLECTION.REPORT_ACTIONS) {
    for (let i = 0; i < times; i++) {
        detectOnyxDerivedLoop(DERIVED_KEY, new Set([triggeredKey]));
    }
}

describe('detectOnyxDerivedLoop', () => {
    let now = 1_700_000_000_000;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        resetOnyxDerivedLoopDetection();
        captureMessage.mockClear();
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        now = 1_700_000_000_000;
        jest.spyOn(Date, 'now').mockImplementation(() => now);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('reports exactly one event for a recompute loop, with the culprit dependency', () => {
        recompute(RECOMPUTE_THRESHOLD * 3);

        expect(captureMessage).toHaveBeenCalledTimes(1);
        expect(captureMessage).toHaveBeenCalledWith(
            expect.stringContaining(DERIVED_KEY),
            expect.objectContaining({
                fingerprint: ['onyx-derived-loop', DERIVED_KEY],
                extra: expect.objectContaining({dependencyCounts: {[ONYXKEYS.COLLECTION.REPORT_ACTIONS]: RECOMPUTE_THRESHOLD}}),
            }),
        );
    });

    it('does not report while the app is still loading', async () => {
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);

        recompute(RECOMPUTE_THRESHOLD * 3);

        expect(captureMessage).not.toHaveBeenCalled();
    });

    it('reports again after a new app load, without a page reload', async () => {
        recompute(RECOMPUTE_THRESHOLD * 3);
        expect(captureMessage).toHaveBeenCalledTimes(1);

        await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        recompute(RECOMPUTE_THRESHOLD * 3);

        expect(captureMessage).toHaveBeenCalledTimes(2);
    });

    it('does not report recomputes spread beyond the rolling window', () => {
        for (let i = 0; i < RECOMPUTE_THRESHOLD * 3; i++) {
            recompute(1);
            now += WINDOW_MS;
        }

        expect(captureMessage).not.toHaveBeenCalled();
    });
});
