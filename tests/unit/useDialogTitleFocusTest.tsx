import {renderHook} from '@testing-library/react-native';
import type {RefObject} from 'react';
import type Text from '@components/Text';
import useDialogTitleFocus from '@hooks/useDialogTitleFocus';

type TransitionEndCallback = (event: {data: {closing: boolean}}) => void;

let transitionEndCallback: TransitionEndCallback | undefined;
const mockUnsubscribe = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        addListener: jest.fn((event: string, callback: TransitionEndCallback) => {
            if (event === 'transitionEnd') {
                transitionEndCallback = callback;
            }
            return mockUnsubscribe;
        }),
    }),
}));

// Force jest to load the web implementation instead of .native.ts
jest.mock('@hooks/useDialogTitleFocus', () => jest.requireActual<{default: typeof useDialogTitleFocus}>('../../src/hooks/useDialogTitleFocus/index.ts'));

beforeEach(() => {
    jest.useFakeTimers();
    transitionEndCallback = undefined;
    mockUnsubscribe.mockClear();
});

afterEach(() => {
    jest.useRealTimers();
});

describe('useDialogTitleFocus (web)', () => {
    it('does not focus when isInsideDialog is false', () => {
        const mockFocus = jest.fn();
        const titleRef = {current: {focus: mockFocus}} as unknown as RefObject<React.ComponentRef<typeof Text> | null>;

        renderHook(() => useDialogTitleFocus(titleRef, false));

        // Neither transitionEnd nor fallback timeout should trigger focus
        transitionEndCallback?.({data: {closing: false}});
        jest.advanceTimersByTime(1000);

        expect(mockFocus).not.toHaveBeenCalled();
    });

    it('focuses the title ref when transitionEnd fires', () => {
        const mockFocus = jest.fn();
        const titleRef = {current: {focus: mockFocus}} as unknown as RefObject<React.ComponentRef<typeof Text> | null>;

        renderHook(() => useDialogTitleFocus(titleRef, true));

        // Focus should not be called before transitionEnd
        expect(mockFocus).not.toHaveBeenCalled();

        // Simulate transitionEnd
        transitionEndCallback?.({data: {closing: false}});

        expect(mockFocus).toHaveBeenCalledTimes(1);
    });

    it('ignores transitionEnd with closing=true', () => {
        const mockFocus = jest.fn();
        const titleRef = {current: {focus: mockFocus}} as unknown as RefObject<React.ComponentRef<typeof Text> | null>;

        renderHook(() => useDialogTitleFocus(titleRef, true));

        // Simulate closing transitionEnd — should be ignored
        transitionEndCallback?.({data: {closing: true}});

        expect(mockFocus).not.toHaveBeenCalled();
    });

    it('falls back to timeout if transitionEnd does not fire', () => {
        const mockFocus = jest.fn();
        const titleRef = {current: {focus: mockFocus}} as unknown as RefObject<React.ComponentRef<typeof Text> | null>;

        renderHook(() => useDialogTitleFocus(titleRef, true));

        // Advance past SCREEN_TRANSITION_END_TIMEOUT (1000ms)
        jest.advanceTimersByTime(1000);

        expect(mockFocus).toHaveBeenCalledTimes(1);
    });

    it('only focuses once even if both transitionEnd and timeout fire', () => {
        const mockFocus = jest.fn();
        const titleRef = {current: {focus: mockFocus}} as unknown as RefObject<React.ComponentRef<typeof Text> | null>;

        renderHook(() => useDialogTitleFocus(titleRef, true));

        // transitionEnd fires first
        transitionEndCallback?.({data: {closing: false}});
        expect(mockFocus).toHaveBeenCalledTimes(1);

        // Timeout fires later — should not focus again
        jest.advanceTimersByTime(1000);
        expect(mockFocus).toHaveBeenCalledTimes(1);
    });

    it('handles null ref gracefully', () => {
        const titleRef = {current: null};

        renderHook(() => useDialogTitleFocus(titleRef, true));

        // Should not throw when transitionEnd fires with null ref
        expect(() => transitionEndCallback?.({data: {closing: false}})).not.toThrow();
    });
});
