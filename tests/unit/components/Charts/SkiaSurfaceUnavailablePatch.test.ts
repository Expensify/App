/**
 * Guards `patches/react-native-skia/react-native-skia+2.15.5+001+report-surface-unavailable.patch`. It runs the real
 * (patched) Skia web renderer hook, not a stand-in, so the test fails if a Skia upgrade drops or breaks the patch.
 * Without the patch, a browser that refuses WebGL after the capability probe passed makes the renderer throw in a
 * layout effect, and SkiaWebChart's error boundary reports a CanvasKit load failure instead of the "unable to display
 * chart" state.
 */
import {act, renderHook} from '@testing-library/react-native';

import useIsSkiaSurfaceUnavailable from '@components/Charts/SkiaWebChart/useIsSkiaSurfaceUnavailable';

import {useSkiaWebRenderer} from 'react-native-skia/lib/module/views/SkiaWebRenderer';

type CanvasKitGlobal = {CanvasKit?: unknown};

describe('Skia report-surface-unavailable patch', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        delete (globalThis as CanvasKitGlobal).CanvasKit;
        jest.useRealTimers();
    });

    it('should report the surface as unavailable instead of throwing when the browser refuses WebGL', () => {
        // Given a CanvasKit whose WebGL context cannot be created, as with hardware acceleration disabled or a GPU
        // blocked by the browser, and a chart container holding the canvas Skia renders into
        (globalThis as CanvasKitGlobal).CanvasKit = {GetWebGLContext: jest.fn(() => 0)};
        const container = document.createElement('div');
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        const {result: surfaceUnavailable} = renderHook(() => useIsSkiaSurfaceUnavailable({current: container}));

        // When Skia creates the renderer for that canvas (an unpatched renderer throws here and fails the test), and the
        // frame it defers its report to has run
        renderHook(() => useSkiaWebRenderer({current: canvas}, {paint: jest.fn()}));
        act(() => {
            jest.runOnlyPendingTimers();
        });

        // Then the container hears the surface event, so the chart shows its fallback rather than an error
        expect(surfaceUnavailable.current).toBe(true);
    });
});
