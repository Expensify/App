import {act, renderHook} from '@testing-library/react-native';

import useIsSkiaSurfaceUnavailable from '@components/Charts/SkiaWebChart/useIsSkiaSurfaceUnavailable';

// The event the patched Skia web renderer dispatches when it cannot create a drawing surface.
const SURFACE_UNAVAILABLE_EVENT = 'skia-surface-unavailable';

describe('useIsSkiaSurfaceUnavailable', () => {
    it('should report unavailable once the renderer dispatches the surface event', () => {
        const container = document.createElement('div');
        const {result} = renderHook(() => useIsSkiaSurfaceUnavailable({current: container}));

        expect(result.current).toBe(false);

        act(() => {
            container.dispatchEvent(new CustomEvent(SURFACE_UNAVAILABLE_EVENT, {bubbles: true}));
        });

        expect(result.current).toBe(true);
    });

    it('should hear the event from a canvas nested inside the container, where the renderer dispatches it', () => {
        const container = document.createElement('div');
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        const {result} = renderHook(() => useIsSkiaSurfaceUnavailable({current: container}));

        act(() => {
            canvas.dispatchEvent(new CustomEvent(SURFACE_UNAVAILABLE_EVENT, {bubbles: true}));
        });

        expect(result.current).toBe(true);
    });

    it('should stop listening when unmounted', () => {
        const container = document.createElement('div');
        const removeListener = jest.spyOn(container, 'removeEventListener');
        const {unmount} = renderHook(() => useIsSkiaSurfaceUnavailable({current: container}));

        unmount();

        expect(removeListener).toHaveBeenCalledWith(SURFACE_UNAVAILABLE_EVENT, expect.any(Function));
    });

    it('should stay available when the ref does not hold a DOM element', () => {
        const {result} = renderHook(() => useIsSkiaSurfaceUnavailable({current: null}));

        expect(result.current).toBe(false);
    });
});
