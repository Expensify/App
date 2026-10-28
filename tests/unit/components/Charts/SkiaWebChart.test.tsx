import {act, render, screen} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import ChartReveal, {useReportChartLoading} from '@components/Charts/components/ChartReveal';
import SkiaWebChart from '@components/Charts/SkiaWebChart';
import isSkiaWebSupported from '@components/Charts/SkiaWebChart/isSkiaWebSupported';
import {getCartesianChartHeight} from '@components/Charts/utils/chartHeights';

import type {ComponentType} from 'react';

import * as Sentry from '@sentry/react-native';
import {LoadSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React from 'react';
import {View} from 'react-native';

import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/Charts/SkiaWebChart/isSkiaWebSupported', () => jest.fn());

jest.mock('@shopify/react-native-skia/lib/module/web', () => ({LoadSkiaWeb: jest.fn()}));

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

const mockIsSkiaWebSupported = jest.mocked(isSkiaWebSupported);
const mockLoadSkiaWeb = jest.mocked(LoadSkiaWeb);
const mockCaptureException = jest.mocked(Sentry.captureException);

function LoadedChart() {
    return <View testID="loaded-chart" />;
}

function ReadyChart() {
    useReportChartLoading(false);
    return <View testID="ready-chart" />;
}

// SkiaWebChart keeps one lazy component per loader for the session, so each test makes its own loader to start uncached.
function createChartLoader(Chart: ComponentType = LoadedChart) {
    return jest.fn(() => Promise.resolve({default: Chart}));
}

// Holds the next CanvasKit load open until the test settles it.
function deferSkiaLoad() {
    let resolve = () => {};
    let reject: (error: Error) => void = () => {};
    mockLoadSkiaWeb.mockReturnValueOnce(
        new Promise<void>((resolvePromise, rejectPromise) => {
            resolve = resolvePromise;
            reject = rejectPromise;
        }),
    );
    return {resolve: () => resolve(), reject: (error: Error) => reject(error)};
}

describe('SkiaWebChart', () => {
    const renderRevealedChart = (getComponent: ReturnType<typeof createChartLoader>) => (
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

    beforeEach(() => {
        mockLoadSkiaWeb.mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should show the unable-to-display empty state without mounting Skia when WebGL is unsupported', () => {
        mockIsSkiaWebSupported.mockReturnValue(false);
        const getComponent = createChartLoader();

        render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
            />,
        );

        expect(screen.getByText('common.unableToDisplayChart')).toBeTruthy();
        expect(screen.getByText('common.webGLNotSupported')).toBeTruthy();
        expect(mockLoadSkiaWeb).not.toHaveBeenCalled();
        expect(getComponent).not.toHaveBeenCalled();
    });

    it('should show the failed-to-load message under a reveal without holding its spinner', async () => {
        // Given a chart under a reveal whose spinner is up while Skia loads
        mockIsSkiaWebSupported.mockReturnValue(true);
        const skiaLoad = deferSkiaLoad();
        render(renderRevealedChart(createChartLoader()));

        // When CanvasKit fails to load. React logs caught render errors to console.error, so mock it to keep the test output clean.
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await act(async () => skiaLoad.reject(new Error('CanvasKit initialized without its bindings')));

        // Then the message replaces the spinner in the same render, because the hold waits for a Skia draw this state never makes
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
        expect(screen.getByText('common.unableToDisplayChart')).toBeTruthy();

        consoleErrorSpy.mockRestore();
    });

    it('should hold the reveal spinner when the chart was still loading Skia at mount', async () => {
        // Given a browser with WebGL where Skia has not loaded yet, so the chart shows its fallback under a reveal
        mockIsSkiaWebSupported.mockReturnValue(true);
        const skiaLoad = deferSkiaLoad();
        render(renderRevealedChart(createChartLoader(ReadyChart)));

        // When Skia loads and the chart reports it is ready
        await act(async () => skiaLoad.resolve());

        // Then the spinner the fallback put up stays for the hold, because taking it down before Skia draws would show an empty card
        expect(screen.getByTestId('ready-chart')).toBeTruthy();
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();
    });

    it('should mount the chart once Skia loads when WebGL is supported', async () => {
        mockIsSkiaWebSupported.mockReturnValue(true);

        render(
            <SkiaWebChart
                getComponent={createChartLoader()}
                componentProps={{}}
            />,
        );

        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('loaded-chart')).toBeTruthy();
        expect(mockLoadSkiaWeb).toHaveBeenCalled();
    });

    it('should render an already loaded chart without its fallback when it mounts again', async () => {
        // Given a chart whose code and CanvasKit finished loading on an earlier mount
        mockIsSkiaWebSupported.mockReturnValue(true);
        const getComponent = createChartLoader();
        const {unmount} = render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
            />,
        );
        await waitForBatchedUpdatesWithAct();
        unmount();

        // When the same chart mounts again, as it does when the Spend view switches back to that chart type
        render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
            />,
        );

        // Then the chart is there on the first render and nothing loads again. A lazy component created per mount suspends
        // here instead, which production React shows as a spinner flash on every view switch.
        expect(screen.getByTestId('loaded-chart')).toBeTruthy();
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
        expect(getComponent).toHaveBeenCalledTimes(1);
    });

    it('should load the chart again on the next mount after a load fails', async () => {
        // Given a chart whose first CanvasKit load failed, a result React would otherwise keep for the rest of the session.
        // React logs caught render errors to console.error, so mock it to keep the test output clean.
        mockIsSkiaWebSupported.mockReturnValue(true);
        mockLoadSkiaWeb.mockRejectedValueOnce(new Error('Failed to fetch canvaskit.wasm'));
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const getComponent = createChartLoader();
        const {unmount} = render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
            />,
        );
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('common.chartFailedToLoad')).toBeTruthy();
        unmount();

        // When the chart mounts again
        render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
            />,
        );

        // Then it retries the load and shows the chart
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('loaded-chart')).toBeTruthy();
        expect(mockLoadSkiaWeb).toHaveBeenCalledTimes(2);

        consoleErrorSpy.mockRestore();
    });

    it('should point CanvasKit at the versioned wasm URL emitted by the build', async () => {
        // Given a browser that supports WebGL
        mockIsSkiaWebSupported.mockReturnValue(true);

        // When the chart mounts Skia
        render(
            <SkiaWebChart
                getComponent={createChartLoader()}
                componentProps={{}}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the glue is told to fetch `canvaskit.wasm` from the build-time `__CANVASKIT_WASM_URL__` define rather
        // than the unversioned `/canvaskit.wasm`, so this bundle's glue can never be paired with another release's
        // binary (https://github.com/Expensify/App/issues/102042). Any other file keeps its root-relative default.
        const opts = mockLoadSkiaWeb.mock.calls.at(0)?.[0];
        expect(opts?.locateFile?.('canvaskit.wasm')).toBe(__CANVASKIT_WASM_URL__);
        expect(opts?.locateFile?.('canvaskit.wasm')).not.toBe('/canvaskit.wasm');
        expect(opts?.locateFile?.('other.bin')).toBe('/other.bin');
    });

    it('should degrade to the failed-to-load empty state and report a warning when CanvasKit fails to load', async () => {
        // Given a browser that supports WebGL but where CanvasKit throws while loading, as it does when the
        // glue and wasm binary are from different releases or the 8 MB download fails
        mockIsSkiaWebSupported.mockReturnValue(true);
        const loadError = new Error('CanvasKit initialized without its bindings');
        mockLoadSkiaWeb.mockRejectedValueOnce(loadError);
        // React logs caught render errors to console.error. Mock it to keep the test output clean.
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // When the chart mounts
        render(
            <SkiaWebChart
                getComponent={createChartLoader()}
                componentProps={{}}
            />,
        );

        // Then the error boundary shows the "unable to display chart" state with the load-failure explanation
        // instead of the WebGL one, and the failure is reported to Sentry as a handled warning under a single
        // fingerprint so it stays visible without becoming a crash
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('common.chartFailedToLoad')).toBeTruthy();
        expect(screen.getByText('common.unableToDisplayChart')).toBeTruthy();
        expect(screen.queryByText('common.webGLNotSupported')).toBeNull();
        expect(mockCaptureException).toHaveBeenCalledWith(loadError, expect.objectContaining({level: 'warning', fingerprint: ['skia-web-chart-load-failure']}));

        consoleErrorSpy.mockRestore();
    });
});
