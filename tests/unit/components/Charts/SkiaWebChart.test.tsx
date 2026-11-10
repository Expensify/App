import {render, screen} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import ChartReveal, {useReportChartLoading} from '@components/Charts/components/ChartReveal';
import SkiaWebChart from '@components/Charts/SkiaWebChart';
import getSkiaWebUnsupportedReason from '@components/Charts/SkiaWebChart/getSkiaWebUnsupportedReason';
import {getCartesianChartHeight} from '@components/Charts/utils/chartHeights';

import * as Sentry from '@sentry/react-native';
import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React from 'react';
import {View} from 'react-native';

jest.mock('@components/Charts/SkiaWebChart/getSkiaWebUnsupportedReason', () => jest.fn());

jest.mock('@shopify/react-native-skia/lib/module/web', () => ({WithSkiaWeb: jest.fn(() => null)}));

jest.mock('@sentry/react-native', () => ({captureException: jest.fn(), setUser: jest.fn()}));

jest.mock('@libs/Log', () => ({warn: jest.fn(), info: jest.fn(), alert: jest.fn(), hmmm: jest.fn()}));

// Every style lookup returns an empty object so the real Text/View render without a ThemeProvider.
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyIllustrations: () => ({MonitorSyncNo: () => null})}));

jest.mock('@components/Icon', () => ({
    __esModule: true,
    default: () => null,
}));

const CHART_LOADING_HEIGHT = getCartesianChartHeight();

const mockGetSkiaWebUnsupportedReason = jest.mocked(getSkiaWebUnsupportedReason);
const mockWithSkiaWeb = jest.mocked(WithSkiaWeb);
const mockCaptureException = jest.mocked(Sentry.captureException);

function ReadyChart() {
    useReportChartLoading(false);
    return null;
}

describe('SkiaWebChart', () => {
    const getComponent = () => Promise.resolve({default: () => null});

    const renderRevealedChart = () => (
        <ChartReveal
            loadingHeight={CHART_LOADING_HEIGHT}
            isCardMeasured
        >
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
            />
        </ChartReveal>
    );

    afterEach(() => {
        jest.clearAllMocks();
    });

    it.each(['common.webGLNotSupported', 'common.webAssemblyNotSupported'] as const)('should show the capability-specific empty state without mounting Skia: %s', (reason) => {
        // Given a browser missing one of the capabilities CanvasKit needs
        mockGetSkiaWebUnsupportedReason.mockReturnValue(reason);

        // When mounting a chart
        render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
            />,
        );

        // Then explain the actual missing capability and never attempt CanvasKit initialization
        expect(screen.getByText('common.unableToDisplayChart')).toBeTruthy();
        expect(screen.getByText(reason)).toBeTruthy();
        expect(mockWithSkiaWeb).not.toHaveBeenCalled();
    });

    it('should show the failed-to-load message under a reveal without holding its spinner', () => {
        // Given a chart under a reveal whose spinner is up while Skia loads
        mockGetSkiaWebUnsupportedReason.mockReturnValue(undefined);
        mockWithSkiaWeb.mockImplementation(({fallback}) => <View>{fallback}</View>);
        const {rerender} = render(renderRevealedChart());

        // When CanvasKit fails to load. React logs caught render errors to console.error, so mock it to keep the test output clean.
        mockWithSkiaWeb.mockImplementation(() => {
            throw new Error('CanvasKit initialized without its bindings');
        });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        rerender(renderRevealedChart());

        // Then the message replaces the spinner in the same render, because the hold waits for a Skia draw this state never makes
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
        expect(screen.getByText('common.unableToDisplayChart')).toBeTruthy();

        consoleErrorSpy.mockRestore();
    });

    it('should hold the reveal spinner when the chart was still loading Skia at mount', () => {
        // Given a browser with WebGL where Skia has not loaded yet, so the chart shows its fallback under a reveal
        mockGetSkiaWebUnsupportedReason.mockReturnValue(undefined);
        mockWithSkiaWeb.mockImplementation(({fallback}) => <View>{fallback}</View>);
        const {rerender} = render(renderRevealedChart());

        // When Skia loads and the chart reports it is ready
        mockWithSkiaWeb.mockImplementation(() => <ReadyChart />);
        rerender(renderRevealedChart());

        // Then the spinner the fallback put up stays for the hold, because taking it down before Skia draws would show an empty card
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();
    });

    it('should mount Skia when WebGL is supported', () => {
        mockGetSkiaWebUnsupportedReason.mockReturnValue(undefined);

        render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
            />,
        );

        expect(mockWithSkiaWeb).toHaveBeenCalled();
    });

    it('should point CanvasKit at the versioned wasm URL emitted by the build', () => {
        // Given a browser that supports WebGL
        mockGetSkiaWebUnsupportedReason.mockReturnValue(undefined);

        // When the chart mounts Skia
        render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
            />,
        );

        // Then the glue is told to fetch `canvaskit.wasm` from the build-time `__CANVASKIT_WASM_URL__` define rather
        // than the unversioned `/canvaskit.wasm`, so this bundle's glue can never be paired with another release's
        // binary (https://github.com/Expensify/App/issues/102042). Any other file keeps its root-relative default.
        const opts = mockWithSkiaWeb.mock.calls.at(0)?.[0].opts;
        expect(opts?.locateFile?.('canvaskit.wasm')).toBe(__CANVASKIT_WASM_URL__);
        expect(opts?.locateFile?.('canvaskit.wasm')).not.toBe('/canvaskit.wasm');
        expect(opts?.locateFile?.('other.bin')).toBe('/other.bin');
    });

    it('should degrade to the failed-to-load empty state and report a warning when CanvasKit fails to load', () => {
        // Given a browser that supports WebGL but where CanvasKit throws while loading, as it does when the
        // glue and wasm binary are from different releases or the 8 MB download fails
        mockGetSkiaWebUnsupportedReason.mockReturnValue(undefined);
        const loadError = new Error('CanvasKit initialized without its bindings');
        mockWithSkiaWeb.mockImplementation(() => {
            throw loadError;
        });
        // React logs caught render errors to console.error. Mock it to keep the test output clean.
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // When the chart mounts
        render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
            />,
        );

        // Then the error boundary shows the "unable to display chart" state with the load-failure explanation
        // instead of the WebGL one, and the failure is reported to Sentry as a handled warning under a single
        // fingerprint so it stays visible without becoming a crash
        expect(screen.getByText('common.unableToDisplayChart')).toBeTruthy();
        expect(screen.getByText('common.chartFailedToLoad')).toBeTruthy();
        expect(screen.queryByText('common.webGLNotSupported')).toBeNull();
        expect(mockCaptureException).toHaveBeenCalledWith(loadError, expect.objectContaining({level: 'warning', fingerprint: ['skia-web-chart-load-failure']}));

        consoleErrorSpy.mockRestore();
    });
});
