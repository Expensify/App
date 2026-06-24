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

const Accessibility = require<{
    default: {
        useIsScreenReaderKnownOff: () => boolean;
        isScreenReaderKnownOff: () => boolean;
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

describe('useIsScreenReaderKnownOff', () => {
    it('returns false during the warm-up window (cache not yet resolved) so callers register/capture defensively', () => {
        const {result, unmount} = renderHook(() => Accessibility.default.useIsScreenReaderKnownOff());
        expect(result.current).toBe(false);
        unmount();
    });

    it('re-renders to true after warm resolves with SR-off — the load-bearing reactivity a Pressable mounted mid-warm-up relies on', async () => {
        let renderCount = 0;
        const {result, unmount} = renderHook(() => {
            renderCount += 1;
            return Accessibility.default.useIsScreenReaderKnownOff();
        });
        expect(result.current).toBe(false);
        const initialRenderCount = renderCount;

        await act(async () => {
            mockScreenReaderResolvers[0]?.(false);
            await flushPromises();
        });
        expect(result.current).toBe(true);
        expect(renderCount).toBeGreaterThan(initialRenderCount);
        unmount();
    });

    it('stays false after warm resolves with SR-on — known-off is true ONLY for known-off', async () => {
        const {result, unmount} = renderHook(() => Accessibility.default.useIsScreenReaderKnownOff());
        expect(result.current).toBe(false);

        await act(async () => {
            mockScreenReaderResolvers[0]?.(true);
            await flushPromises();
        });
        expect(result.current).toBe(false);
        unmount();
    });

    it('snapshot stays consistent with `isScreenReaderKnownOff()` across the warm-up transition', async () => {
        expect(Accessibility.default.isScreenReaderKnownOff()).toBe(false);
        const {result, unmount} = renderHook(() => Accessibility.default.useIsScreenReaderKnownOff());
        expect(result.current).toBe(Accessibility.default.isScreenReaderKnownOff());

        await act(async () => {
            mockScreenReaderResolvers[0]?.(false);
            await flushPromises();
        });
        expect(result.current).toBe(Accessibility.default.isScreenReaderKnownOff());
        expect(result.current).toBe(true);
        unmount();
    });

    it('an effect depending on the hook re-runs when warm resolves (the architectural contract `BaseGenericPressable`s registry effect relies on)', async () => {
        const sideEffect = jest.fn<void, [boolean]>();
        const {unmount} = renderHook(() => {
            const knownOff = Accessibility.default.useIsScreenReaderKnownOff();
            const isFirstRunRef = useRef(true);
            useEffect(() => {
                sideEffect(knownOff);
                if (isFirstRunRef.current) {
                    isFirstRunRef.current = false;
                }
            }, [knownOff]);
            return knownOff;
        });
        expect(sideEffect).toHaveBeenCalledTimes(1);
        expect(sideEffect).toHaveBeenLastCalledWith(false);

        await act(async () => {
            mockScreenReaderResolvers[0]?.(false);
            await flushPromises();
        });
        expect(sideEffect).toHaveBeenCalledTimes(2);
        expect(sideEffect).toHaveBeenLastCalledWith(true);
        unmount();
    });
});
