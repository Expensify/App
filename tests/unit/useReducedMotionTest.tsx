import {act, renderHook} from '@testing-library/react-native';
import {AccessibilityInfo} from 'react-native';
import Accessibility from '@libs/Accessibility';

describe('useReducedMotion', () => {
    let mockIsReduceMotionEnabled: jest.Mock;
    let mockAddEventListener: jest.Mock;
    let mockRemove: jest.Mock;

    beforeEach(() => {
        mockRemove = jest.fn();
        mockIsReduceMotionEnabled = jest.fn().mockResolvedValue(false);
        mockAddEventListener = jest.fn().mockReturnValue({remove: mockRemove});

        jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockImplementation(mockIsReduceMotionEnabled);
        jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(mockAddEventListener);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return false when reduce motion is disabled', async () => {
        const {result} = renderHook(() => Accessibility.useReducedMotion());

        // Wait for the async check to complete
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current).toBe(false);
    });

    it('should return true when reduce motion is enabled', async () => {
        mockIsReduceMotionEnabled.mockResolvedValue(true);

        const {result} = renderHook(() => Accessibility.useReducedMotion());

        // Wait for the async check to complete
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current).toBe(true);
    });

    it('should subscribe to reduceMotionChanged event', () => {
        renderHook(() => Accessibility.useReducedMotion());

        expect(mockAddEventListener).toHaveBeenCalledWith('reduceMotionChanged', expect.any(Function));
    });

    it('should update when reduce motion setting changes at runtime', async () => {
        let changeHandler: (enabled: boolean) => void = () => {};
        mockAddEventListener.mockImplementation((event: string, handler: (enabled: boolean) => void) => {
            changeHandler = handler;
            return {remove: mockRemove};
        });

        const {result} = renderHook(() => Accessibility.useReducedMotion());

        // Wait for initial async check to settle
        await act(async () => {
            await Promise.resolve();
        });

        // Simulate the user enabling reduce motion
        await act(async () => {
            changeHandler(true);
        });

        expect(result.current).toBe(true);

        // Simulate the user disabling reduce motion
        await act(async () => {
            changeHandler(false);
        });

        expect(result.current).toBe(false);
    });

    it('should cleanup subscription on unmount', () => {
        const {unmount} = renderHook(() => Accessibility.useReducedMotion());

        unmount();

        expect(mockRemove).toHaveBeenCalled();
    });

    it('should handle API failure gracefully', async () => {
        mockIsReduceMotionEnabled.mockRejectedValue(new Error('API Error'));

        const {result} = renderHook(() => Accessibility.useReducedMotion());

        // Wait for the async check to complete
        await act(async () => {
            await Promise.resolve();
        });

        // Should default to false on error
        expect(result.current).toBe(false);
    });

    it('should not update state after unmount', async () => {
        // Create a delayed promise to simulate slow API
        let resolvePromise: (value: boolean) => void = () => {};
        mockIsReduceMotionEnabled.mockReturnValue(
            new Promise((resolve) => {
                resolvePromise = resolve;
            }),
        );

        const {unmount} = renderHook(() => Accessibility.useReducedMotion());

        // Unmount before the promise resolves
        unmount();

        // Resolve the promise after unmount — should not throw or update state
        await act(async () => {
            resolvePromise(true);
            await Promise.resolve();
        });
    });

    it('should use cached value on remount so new instances start with correct state', async () => {
        mockIsReduceMotionEnabled.mockResolvedValue(true);

        // First mount: resolves to true, which caches the value
        const {result: result1, unmount} = renderHook(() => Accessibility.useReducedMotion());

        await act(async () => {
            await Promise.resolve();
        });

        expect(result1.current).toBe(true);

        // Unmount the first instance
        unmount();

        // Second mount: should start with cached value (true) immediately
        const {result: result2} = renderHook(() => Accessibility.useReducedMotion());

        // On the very first render, it should already be true (from cache)
        expect(result2.current).toBe(true);
    });
});
