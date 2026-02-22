import {renderHook} from '@testing-library/react-native';
import useDialogTitleFocus from '@hooks/useDialogTitleFocus';

// Capture the callback passed to useFocusEffect so we can invoke it manually
let focusEffectCallback: (() => (() => void) | undefined) | undefined;

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: jest.fn((callback: () => (() => void) | undefined) => {
        focusEffectCallback = callback;
    }),
}));

// Force jest to load the web implementation instead of .native.ts
jest.mock('@hooks/useDialogTitleFocus', () => jest.requireActual<{default: typeof useDialogTitleFocus}>('../../src/hooks/useDialogTitleFocus/index.ts'));

beforeEach(() => {
    jest.useFakeTimers();
    focusEffectCallback = undefined;
});

afterEach(() => {
    jest.useRealTimers();
});

describe('useDialogTitleFocus (web)', () => {
    it('does not set up focus timer when isInsideDialog is false', () => {
        const titleRef = {current: null};
        renderHook(() => useDialogTitleFocus(titleRef, false));

        expect(focusEffectCallback).toBeDefined();
        const cleanup = focusEffectCallback?.();
        expect(cleanup).toBeUndefined();
    });

    it('focuses the title ref after ANIMATED_TRANSITION delay when isInsideDialog is true', () => {
        const mockFocus = jest.fn();
        const titleRef = {current: {focus: mockFocus} as unknown as HTMLElement};

        renderHook(() => useDialogTitleFocus(titleRef, true));

        expect(focusEffectCallback).toBeDefined();
        focusEffectCallback?.();

        // Focus should not be called immediately
        expect(mockFocus).not.toHaveBeenCalled();

        // Advance past ANIMATED_TRANSITION (500ms)
        jest.advanceTimersByTime(500);

        expect(mockFocus).toHaveBeenCalledTimes(1);
    });

    it('only focuses once (hasInitiallyFocusedRef prevents repeated focus)', () => {
        const mockFocus = jest.fn();
        const titleRef = {current: {focus: mockFocus} as unknown as HTMLElement};

        renderHook(() => useDialogTitleFocus(titleRef, true));

        // First focus effect invocation
        focusEffectCallback?.();
        jest.advanceTimersByTime(500);
        expect(mockFocus).toHaveBeenCalledTimes(1);

        // Second invocation should be a no-op
        const cleanup = focusEffectCallback?.();
        jest.advanceTimersByTime(500);
        expect(mockFocus).toHaveBeenCalledTimes(1);
        expect(cleanup).toBeUndefined();
    });

    it('returns a cleanup function that clears the timeout', () => {
        const mockFocus = jest.fn();
        const titleRef = {current: {focus: mockFocus} as unknown as HTMLElement};

        renderHook(() => useDialogTitleFocus(titleRef, true));

        const cleanup = focusEffectCallback?.();
        expect(cleanup).toBeDefined();

        // Call cleanup before timer fires
        cleanup?.();
        jest.advanceTimersByTime(500);

        // Focus should not have been called because we cleaned up
        expect(mockFocus).not.toHaveBeenCalled();
    });

    it('handles null ref gracefully', () => {
        const titleRef = {current: null};

        renderHook(() => useDialogTitleFocus(titleRef, true));
        focusEffectCallback?.();

        // Should not throw when advancing timers with null ref
        expect(() => jest.advanceTimersByTime(500)).not.toThrow();
    });
});
