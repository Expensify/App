import {render, screen} from '@testing-library/react-native';

import SkiaWebChart from '@components/Charts/SkiaWebChart';
import isSkiaWebSupported from '@components/Charts/SkiaWebChart/isSkiaWebSupported';

import * as Sentry from '@sentry/react-native';
import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React from 'react';

jest.mock('@components/Charts/SkiaWebChart/isSkiaWebSupported', () => jest.fn());

jest.mock('@shopify/react-native-skia/lib/module/web', () => ({WithSkiaWeb: jest.fn(() => null)}));

jest.mock('@sentry/react-native', () => ({captureException: jest.fn()}));

jest.mock('@libs/Log', () => ({warn: jest.fn()}));

// Every style lookup returns an empty object so the real Text/View render without a ThemeProvider.
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyIllustrations: () => ({MonitorSyncNo: () => null})}));

jest.mock('@components/Icon', () => ({
    __esModule: true,
    default: () => null,
}));

const mockIsSkiaWebSupported = jest.mocked(isSkiaWebSupported);
const mockWithSkiaWeb = jest.mocked(WithSkiaWeb);
const mockCaptureException = jest.mocked(Sentry.captureException);

describe('SkiaWebChart', () => {
    const getComponent = () => Promise.resolve({default: () => null});

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should show the unable-to-display empty state without mounting Skia when WebGL is unsupported', () => {
        mockIsSkiaWebSupported.mockReturnValue(false);

        render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
            />,
        );

        expect(screen.getByText('common.unableToDisplayChart')).toBeTruthy();
        expect(screen.getByText('common.webGLNotSupported')).toBeTruthy();
        expect(mockWithSkiaWeb).not.toHaveBeenCalled();
    });

    it('should mount Skia when WebGL is supported', () => {
        mockIsSkiaWebSupported.mockReturnValue(true);

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
        mockIsSkiaWebSupported.mockReturnValue(true);

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
        mockIsSkiaWebSupported.mockReturnValue(true);
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
