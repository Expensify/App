import {getMsSinceJsStartup, getMsSinceNativeAppStart} from '@libs/telemetry/nativeAppStartTime';

import setupTelemetry from '@src/setup/telemetry/index.native';

// jest/setup.ts mocks '@src/setup/telemetry' globally; unmock (hoisted above imports) so we exercise the real native implementation.
jest.unmock('@src/setup/telemetry');
jest.unmock('@src/setup/telemetry/index.native');

const mockMarkers = jest.fn<Record<string, number> | undefined, []>(() => ({}));

jest.mock('@expensify/nitro-utils', () => ({
    get AppStartTimeNitroModule() {
        return {
            appStartTime: 1_000,
            get appStartupMarkers() {
                return mockMarkers();
            },
        };
    },
}));

jest.mock('@src/setup/telemetry/setupSentry', () => jest.fn());
jest.mock('@src/setup/telemetry/reportModuleInitTimes', () => jest.fn());
jest.mock('@libs/Log', () => ({warn: jest.fn()}));

jest.mock('@libs/telemetry/activeSpans', () => ({
    startSpan: jest.fn(() => ({setAttribute: jest.fn()})),
}));

jest.mock('@sentry/react-native', () => ({
    startInactiveSpan: jest.fn(() => ({end: jest.fn(), setAttribute: jest.fn()})),
}));

const startInactiveSpanMock = jest.requireMock<{startInactiveSpan: jest.Mock}>('@sentry/react-native').startInactiveSpan;
const activeSpansMock = jest.requireMock<{startSpan: jest.Mock}>('@libs/telemetry/activeSpans');

describe('telemetry startup markers (native)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Keep "now" close to the mocked appStartTime so the prewarm staleness guard accepts it.
        jest.spyOn(Date, 'now').mockReturnValue(2_000);
        jest.spyOn(performance, 'now').mockReturnValue(10_000);
        global.requestAnimationFrame = jest.fn();
        mockMarkers.mockReturnValue({});
        activeSpansMock.startSpan.mockReturnValue({setAttribute: jest.fn()});
        startInactiveSpanMock.mockImplementation(() => ({end: jest.fn(), setAttribute: jest.fn()}));
    });

    it('creates one backdated child span per stage marker plus the trailing JS-init span', () => {
        // Given native markers recorded out of write-order (YAPLLoad returns after RN setup)
        mockMarkers.mockReturnValue({
            NativeYAPLLoad: 1_930,
            NativeDeviceConfig: 1_003,
            RNSetupStart: 1_843,
            OldDotDisplay: 1_828,
        });

        setupTelemetry();

        // Then stage spans are built between consecutive timestamps, sorted by time, plus StartupNewDotJSInit
        const stageCalls = startInactiveSpanMock.mock.calls.map(([options]: [{name: string; startTime: number}]) => [options.name, options.startTime]);
        // Start-of-event markers (OldDotDisplay, RNSetupStart) end an interval named for the work
        // that precedes them — see STARTUP_STAGE_SPAN_NAMES.
        expect(stageCalls).toEqual([
            ['NativeDeviceConfig', 1_000],
            ['OldDotJSBoot', 1_003],
            ['OldDotToRNHandoff', 1_828],
            ['NativeYAPLLoad', 1_843],
            ['StartupNewDotJSInit', 1_930],
        ]);
    });

    it('reports flag markers as attributes on the startup span instead of child spans', () => {
        mockMarkers.mockReturnValue({
            OldDotDeeplinkDeferred: 1_500,
            NativeDeviceConfig: 1_003,
        });
        const parentSpan = {setAttribute: jest.fn()};
        activeSpansMock.startSpan.mockReturnValue(parentSpan);

        setupTelemetry();

        expect(parentSpan.setAttribute).toHaveBeenCalledWith('old_dot_deeplink_deferred', true);
        const stageNames = startInactiveSpanMock.mock.calls.map(([options]: [{name: string}]) => options.name);
        expect(stageNames).not.toContain('OldDotDeeplinkDeferred');
    });

    it('skips the JS-init span when only flag markers are present', () => {
        // Given markers with no stage boundaries — a JS-init span here would cover the whole native head
        mockMarkers.mockReturnValue({OldDotDeeplinkDeferred: 1_500});

        setupTelemetry();

        const stageNames = startInactiveSpanMock.mock.calls.map(([options]: [{name: string}]) => options.name);
        expect(stageNames).not.toContain('StartupNewDotJSInit');
    });

    it('ignores stale markers recorded before the app start time', () => {
        mockMarkers.mockReturnValue({StaleMarker: 500, NativeDeviceConfig: 1_003});

        setupTelemetry();

        const stageNames = startInactiveSpanMock.mock.calls.map(([options]: [{name: string}]) => options.name);
        expect(stageNames).not.toContain('StaleMarker');
    });

    it('survives the getter missing on an older native binary without touching Sentry', () => {
        // Given a JS bundle newer than the installed binary — the nitro getter does not exist yet
        mockMarkers.mockReturnValue(undefined);

        expect(() => setupTelemetry()).not.toThrow();
        expect(startInactiveSpanMock).not.toHaveBeenCalled();
    });

    it('keeps the accepted native start time for spans that start later, such as the scan shutter span', () => {
        // Given a native start time one second before telemetry setup
        setupTelemetry();

        // When a span starts 500ms after setup
        jest.spyOn(performance, 'now').mockReturnValue(10_500);

        // Then it can read the time since the native app start
        expect(getMsSinceNativeAppStart()).toBe(1_500);
    });

    it('ignores wall-clock corrections after setup when reporting the time since the native app start', () => {
        // Given a native start time one second before telemetry setup
        setupTelemetry();

        // When the device clock is set back an hour and a span starts 500ms after setup
        jest.spyOn(Date, 'now').mockReturnValue(2_500 - 60 * 60 * 1000);
        jest.spyOn(performance, 'now').mockReturnValue(10_500);

        // Then the duration follows the monotonic clock instead of going negative
        expect(getMsSinceNativeAppStart()).toBe(1_500);
    });

    it('counts time the device spent in deep sleep after setup', () => {
        // Given a native start time one second before telemetry setup
        setupTelemetry();

        // When the device sleeps for an hour, so performance.now() advances only 500ms while the wall clock advances an hour
        jest.spyOn(Date, 'now').mockReturnValue(2_000 + 60 * 60 * 1000);
        jest.spyOn(performance, 'now').mockReturnValue(10_500);

        // Then the duration includes the sleep instead of reporting a scan right after a cold launch
        expect(getMsSinceNativeAppStart()).toBe(1_000 + 60 * 60 * 1000);
    });

    it('counts a forward clock correction after setup as elapsed time, an accepted limitation', () => {
        // Given a native start time one second before telemetry setup
        setupTelemetry();

        // When the device clock jumps forward an hour and a span starts 500ms after setup
        jest.spyOn(Date, 'now').mockReturnValue(2_500 + 60 * 60 * 1000);
        jest.spyOn(performance, 'now').mockReturnValue(10_500);

        // Then the hour is included, because JS cannot tell a forward correction apart from deep sleep
        expect(getMsSinceNativeAppStart()).toBe(1_500 + 60 * 60 * 1000);
    });

    it('drops the native start time of a prewarmed process so later spans report no duration', () => {
        // Given a native start time older than the prewarm threshold, as on a prewarmed process
        jest.spyOn(Date, 'now').mockReturnValue(1_000 + 60 * 1000 + 1);

        // When telemetry setup discards it
        setupTelemetry();

        // Then later spans get no duration instead of minutes or hours
        expect(getMsSinceNativeAppStart()).toBeUndefined();
    });

    it('reports the time since JS startup even when the native start time is discarded', () => {
        // Given an old native process, as when a HybridApp user opens NewDot after more than a minute in OldDot
        jest.spyOn(Date, 'now').mockReturnValue(1_000 + 60 * 1000 + 1);
        setupTelemetry();

        // When a span starts 500ms after setup
        jest.spyOn(performance, 'now').mockReturnValue(10_500);

        // Then the JS-startup duration is still reported, so these sessions can be told apart from true cold launches
        expect(getMsSinceNativeAppStart()).toBeUndefined();
        expect(getMsSinceJsStartup()).toBe(500);
    });

    it('counts deep sleep in the time since JS startup', () => {
        // Given telemetry setup has run
        setupTelemetry();

        // When the device sleeps for an hour, so performance.now() advances only 500ms while the wall clock advances an hour
        jest.spyOn(Date, 'now').mockReturnValue(2_000 + 60 * 60 * 1000);
        jest.spyOn(performance, 'now').mockReturnValue(10_500);

        // Then the duration includes the sleep, like the native duration
        expect(getMsSinceJsStartup()).toBe(60 * 60 * 1000);
    });

    it('reports no JS-startup duration before telemetry setup has run', () => {
        // Given a fresh module that telemetry setup has not touched yet
        jest.isolateModules(() => {
            const {getMsSinceJsStartup: getMsSinceJsStartupBeforeSetup} = jest.requireActual<{getMsSinceJsStartup: typeof getMsSinceJsStartup}>('@libs/telemetry/nativeAppStartTime');

            // When a span reads the duration
            // Then there is no value, instead of a time measured from an unset origin
            expect(getMsSinceJsStartupBeforeSetup()).toBeUndefined();
        });
    });
});
