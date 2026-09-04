import setupTelemetry from '@src/setup/telemetry';

// jest/setup.ts mocks '@src/setup/telemetry' globally; unmock (hoisted above imports) so we exercise the implementation.
jest.unmock('@src/setup/telemetry');

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
});
