import detectOnyxDerivedLoop, {RECOMPUTE_THRESHOLD, resetOnyxDerivedLoopDetection, WINDOW_MS} from '@libs/telemetry/detectOnyxDerivedLoop';

import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';

import * as Sentry from '@sentry/react-native';

let mockStartupSpan: Record<string, unknown> | undefined;

jest.mock('@sentry/react-native', () => ({captureMessage: jest.fn()}));
jest.mock('@libs/telemetry/activeSpans', () => ({getSpan: () => mockStartupSpan}));

const captureMessage = jest.mocked(Sentry.captureMessage);

const DERIVED_KEY = ONYXKEYS.DERIVED.REPORT_ATTRIBUTES;

function recompute(times: number, triggeredKey: OnyxKey = ONYXKEYS.COLLECTION.REPORT_ACTIONS) {
    for (let i = 0; i < times; i++) {
        detectOnyxDerivedLoop(DERIVED_KEY, new Set([triggeredKey]));
    }
}

describe('detectOnyxDerivedLoop', () => {
    let now = 1_700_000_000_000;

    beforeEach(() => {
        resetOnyxDerivedLoopDetection();
        captureMessage.mockClear();
        mockStartupSpan = undefined;
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

    it('does not report while the app startup span is still open', () => {
        mockStartupSpan = {};

        recompute(RECOMPUTE_THRESHOLD * 3);

        expect(captureMessage).not.toHaveBeenCalled();
    });

    it('does not report recomputes spread beyond the rolling window', () => {
        for (let i = 0; i < RECOMPUTE_THRESHOLD * 3; i++) {
            recompute(1);
            now += WINDOW_MS;
        }

        expect(captureMessage).not.toHaveBeenCalled();
    });
});
