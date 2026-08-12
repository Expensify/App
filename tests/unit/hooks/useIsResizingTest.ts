import {act, renderHook} from '@testing-library/react-native';

// jest-expo resolves the .native implementation by default (which is a constant false), so require the
// web one explicitly — this hook only does real work on web.
const {default: useIsResizing}: {default: () => boolean} = jest.requireActual('@hooks/useIsResizing/index.ts');

const RESIZE_SETTLE_DELAY = 500;

/** Fire a window resize the way the browser does. */
function emitResize() {
    act(() => {
        window.dispatchEvent(new Event('resize'));
    });
}

describe('useIsResizing', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should not report resizing before any resize event', () => {
        const {result} = renderHook(() => useIsResizing());

        expect(result.current).toBe(false);
    });

    it('should report resizing as soon as the window resizes', () => {
        const {result} = renderHook(() => useIsResizing());

        emitResize();

        expect(result.current).toBe(true);
    });

    it('should settle after a single resize event, as an orientation change emits', () => {
        const {result} = renderHook(() => useIsResizing());

        // A phone rotation can emit exactly one resize event, unlike dragging a desktop window which
        // emits a stream of them. The hook still has to settle, otherwise anything gated on it stays
        // stuck in the resizing state forever.
        emitResize();
        expect(result.current).toBe(true);

        act(() => {
            jest.advanceTimersByTime(RESIZE_SETTLE_DELAY);
        });

        expect(result.current).toBe(false);
    });

    it('should treat a burst of resize events as a single resize', () => {
        const {result} = renderHook(() => useIsResizing());

        emitResize();
        act(() => {
            jest.advanceTimersByTime(400);
        });
        emitResize();
        act(() => {
            jest.advanceTimersByTime(400);
        });

        expect(result.current).toBe(true);

        act(() => {
            jest.advanceTimersByTime(RESIZE_SETTLE_DELAY);
        });

        expect(result.current).toBe(false);
    });

    it('should settle again after a second, independent resize', () => {
        const {result} = renderHook(() => useIsResizing());

        emitResize();
        act(() => {
            jest.advanceTimersByTime(RESIZE_SETTLE_DELAY);
        });
        expect(result.current).toBe(false);

        emitResize();
        expect(result.current).toBe(true);

        act(() => {
            jest.advanceTimersByTime(RESIZE_SETTLE_DELAY);
        });

        expect(result.current).toBe(false);
    });
});
