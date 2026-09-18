import {renderHook} from '@testing-library/react-native';

// The native variant is imported directly: the hook is a no-op on web, and the Android surface loss it
// recovers from only exists in the native build.
import useSkiaCanvasRemountKey from '@components/Charts/hooks/useSkiaCanvasRemountKey/index.native';

const mockAppState = {isForeground: true, isInactive: false, isBackground: false};

jest.mock('@hooks/useAppState', () => ({
    __esModule: true,
    default: () => mockAppState,
}));

function setAppState(state: 'active' | 'inactive' | 'background') {
    mockAppState.isForeground = state === 'active';
    mockAppState.isInactive = state === 'inactive';
    mockAppState.isBackground = state === 'background';
}

describe('useSkiaCanvasRemountKey', () => {
    beforeEach(() => {
        setAppState('active');
    });

    it('should keep the key stable while the app stays in the foreground', () => {
        // Given a chart mounted with the app in the foreground
        const {result, rerender} = renderHook(() => useSkiaCanvasRemountKey());
        const initialKey = result.current;

        // When the component re-renders without the app ever leaving the foreground
        rerender({});

        // Then the key does not change, so a healthy canvas is never needlessly thrown away
        expect(result.current).toBe(initialKey);
    });

    it('should change the key when the app returns from the background', () => {
        // Given a chart mounted with the app in the foreground
        const {result, rerender} = renderHook(() => useSkiaCanvasRemountKey());
        const initialKey = result.current;

        // When the app is backgrounded — Android destroys the Skia surface here — and then resumed
        setAppState('background');
        rerender({});
        setAppState('active');
        rerender({});

        // Then the key changes, remounting the canvas so it repaints instead of coming back blank
        expect(result.current).not.toBe(initialKey);
    });

    it('should keep the key stable across a transient inactive state', () => {
        // Given a chart mounted with the app in the foreground
        const {result, rerender} = renderHook(() => useSkiaCanvasRemountKey());
        const initialKey = result.current;

        // When the app only goes inactive and back — iOS reports this for things like the notification shade
        setAppState('inactive');
        rerender({});
        setAppState('active');
        rerender({});

        // Then the key does not change: the surface was never destroyed, so there is nothing to recover
        expect(result.current).toBe(initialKey);
    });

    it('should change the key again on every subsequent background and resume', () => {
        // Given a chart that has already recovered from one background cycle
        const {result, rerender} = renderHook(() => useSkiaCanvasRemountKey());
        setAppState('background');
        rerender({});
        setAppState('active');
        rerender({});
        const keyAfterFirstResume = result.current;

        // When the app is backgrounded and resumed a second time
        setAppState('background');
        rerender({});
        setAppState('active');
        rerender({});

        // Then the key changes again, so the fix keeps working and isn't a one-shot recovery
        expect(result.current).not.toBe(keyAfterFirstResume);
    });
});
