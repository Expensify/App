import type {BootsplashGateStatus} from '@libs/telemetry/bootsplashTelemetry';
import {startBootsplashMonitor} from '@libs/telemetry/bootsplashTelemetry';

import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';

jest.mock('@sentry/react-native', () => ({
    addBreadcrumb: jest.fn(),
    captureMessage: jest.fn(),
    logger: {debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn()},
}));

jest.mock('@libs/Log', () => ({info: jest.fn()}));

const POLL_INTERVAL_MS = 10_000;

/** The monitor only reads `splashScreenState` off the ref, so the rest of the gate is filler. */
function gateStatusRef(splashScreenState: string | undefined): {current: BootsplashGateStatus} {
    return {
        current: {
            splashScreenState,
            isOnyxMigrated: true,
            isCheckingPublicRoom: false,
            hasAttemptedToOpenPublicRoom: false,
            isNavigationReady: true,
            preferredLocale: undefined,
            shouldInit: true,
            shouldHideSplash: false,
            isAuthenticated: true,
            updateRequired: undefined,
            lastVisitedPath: undefined,
        },
    };
}

describe('startBootsplashMonitor', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('reports a stuck splash as a Sentry log rather than an event, so it does not bill against the error quota', () => {
        // Given a splash screen that stays visible
        const ref = gateStatusRef(CONST.BOOT_SPLASH_STATE.VISIBLE);
        const stopMonitor = startBootsplashMonitor(ref);

        // When one poll interval elapses
        jest.advanceTimersByTime(POLL_INTERVAL_MS);

        // Then the stall is forwarded as a log and no error event is captured
        expect(Sentry.logger.warn).toHaveBeenCalledWith('[BootSplash] splash screen is still visible', expect.objectContaining({splashScreenState: CONST.BOOT_SPLASH_STATE.VISIBLE}));
        expect(Sentry.captureMessage).not.toHaveBeenCalled();

        stopMonitor();
    });

    it('attaches how long the splash has been stuck, which is the reason to report more than once', () => {
        // Given a splash screen that stays visible
        const ref = gateStatusRef(CONST.BOOT_SPLASH_STATE.VISIBLE);
        const stopMonitor = startBootsplashMonitor(ref);

        // When three poll intervals elapse
        jest.advanceTimersByTime(POLL_INTERVAL_MS * 3);

        // Then each report carries the stall measured so far, so the last one shows how long the gate stayed shut
        expect(Sentry.logger.warn).toHaveBeenNthCalledWith(1, expect.anything(), expect.objectContaining({reportNumber: 1, stuckForMs: POLL_INTERVAL_MS}));
        expect(Sentry.logger.warn).toHaveBeenNthCalledWith(3, expect.anything(), expect.objectContaining({reportNumber: 3, stuckForMs: POLL_INTERVAL_MS * 3}));

        stopMonitor();
    });

    it('stops reporting a permanently stuck splash so one bad boot cannot emit for the whole session', () => {
        // Given a splash screen that never hides
        const ref = gateStatusRef(CONST.BOOT_SPLASH_STATE.VISIBLE);
        const stopMonitor = startBootsplashMonitor(ref);

        // When far more poll intervals elapse than the report cap
        jest.advanceTimersByTime(POLL_INTERVAL_MS * 50);

        // Then reporting is bounded instead of growing with session length
        expect(jest.mocked(Sentry.logger.warn).mock.calls.length).toBe(6);

        stopMonitor();
    });

    it('reports nothing once the splash hides', () => {
        // Given a splash screen that has already been hidden
        const ref = gateStatusRef(CONST.BOOT_SPLASH_STATE.HIDDEN);
        const stopMonitor = startBootsplashMonitor(ref);

        // When poll intervals elapse
        jest.advanceTimersByTime(POLL_INTERVAL_MS * 5);

        // Then the monitor stays quiet
        expect(Sentry.logger.warn).not.toHaveBeenCalled();

        stopMonitor();
    });
});
