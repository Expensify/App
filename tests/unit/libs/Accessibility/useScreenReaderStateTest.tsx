import {act, renderHook} from '@testing-library/react-native';
import {useEffect, useRef} from 'react';

const mockScreenReaderResolvers: Array<(value: boolean) => void> = [];

jest.mock('@libs/Log');
jest.mock('@libs/Accessibility/isScreenReaderEnabled', () => ({
    __esModule: true,
    default: () =>
        new Promise<boolean>((resolve) => {
            mockScreenReaderResolvers.push(resolve);
        }),
}));

jest.mock('react-native', () => ({
    __esModule: true,
    AccessibilityInfo: {
        addEventListener: jest.fn(() => ({remove: jest.fn()})),
        isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
    },
    AppState: {
        addEventListener: jest.fn(() => ({remove: jest.fn()})),
        currentState: 'active',
    },
}));

type ScreenReaderState = 'enabled' | 'disabled' | 'unknown';

const Accessibility = require<{
    default: {
        useScreenReaderState: () => ScreenReaderState;
        getScreenReaderState: () => ScreenReaderState;
    };
    resetForTests: () => void;
}>('@libs/Accessibility');

async function flushPromises(): Promise<void> {
    await new Promise<void>((resolve) => {
        setImmediate(resolve);
    });
}

beforeEach(() => {
    Accessibility.resetForTests();
    mockScreenReaderResolvers.length = 0;
});

describe('useScreenReaderState', () => {
    it("returns 'unknown' during the warm-up window (cache not yet resolved) so callers register/capture defensively", () => {
        const {result, unmount} = renderHook(() => Accessibility.default.useScreenReaderState());
        expect(result.current).toBe('unknown');
        unmount();
    });

    it("re-renders to 'disabled' after warm resolves with SR-off — the load-bearing reactivity a Pressable mounted mid-warm-up relies on", async () => {
        let renderCount = 0;
        const {result, unmount} = renderHook(() => {
            renderCount += 1;
            return Accessibility.default.useScreenReaderState();
        });
        expect(result.current).toBe('unknown');
        const initialRenderCount = renderCount;

        await act(async () => {
            mockScreenReaderResolvers[0]?.(false);
            await flushPromises();
        });
        expect(result.current).toBe('disabled');
        expect(renderCount).toBeGreaterThan(initialRenderCount);
        unmount();
    });

    it("re-renders to 'enabled' after warm resolves with SR-on", async () => {
        const {result, unmount} = renderHook(() => Accessibility.default.useScreenReaderState());
        expect(result.current).toBe('unknown');

        await act(async () => {
            mockScreenReaderResolvers[0]?.(true);
            await flushPromises();
        });
        expect(result.current).toBe('enabled');
        unmount();
    });

    it('snapshot stays consistent with `getScreenReaderState()` across the warm-up transition', async () => {
        expect(Accessibility.default.getScreenReaderState()).toBe('unknown');
        const {result, unmount} = renderHook(() => Accessibility.default.useScreenReaderState());
        expect(result.current).toBe(Accessibility.default.getScreenReaderState());

        await act(async () => {
            mockScreenReaderResolvers[0]?.(false);
            await flushPromises();
        });
        expect(result.current).toBe(Accessibility.default.getScreenReaderState());
        expect(result.current).toBe('disabled');
        unmount();
    });

    it("an effect depending on the hook re-runs when warm resolves (the architectural contract `BaseGenericPressable`'s registry effect relies on)", async () => {
        const sideEffect = jest.fn<void, [ScreenReaderState]>();
        const {unmount} = renderHook(() => {
            const state = Accessibility.default.useScreenReaderState();
            const isFirstRunRef = useRef(true);
            useEffect(() => {
                sideEffect(state);
                if (isFirstRunRef.current) {
                    isFirstRunRef.current = false;
                }
            }, [state]);
            return state;
        });
        expect(sideEffect).toHaveBeenCalledTimes(1);
        expect(sideEffect).toHaveBeenLastCalledWith('unknown');

        await act(async () => {
            mockScreenReaderResolvers[0]?.(false);
            await flushPromises();
        });
        expect(sideEffect).toHaveBeenCalledTimes(2);
        expect(sideEffect).toHaveBeenLastCalledWith('disabled');
        unmount();
    });
});
