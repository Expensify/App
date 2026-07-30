import {fireEvent, render, screen} from '@testing-library/react-native';

import {NavigationRouteContext} from '@react-navigation/native';
import React from 'react';

const mockRegisterPressable = jest.fn<() => void, [string, string, {current: unknown}]>();
const mockNotifyPressedTrigger = jest.fn<void, [ref: {current: unknown} | null, identifier?: string]>();

let mockScreenReaderState: 'enabled' | 'disabled' | 'unknown' = 'unknown';
let mockIsScreenReaderActive = false;

jest.mock('@libs/NavigationFocusReturn', () => ({
    __esModule: true,
    registerPressable: (routeKey: string, identifier: string, ref: {current: unknown}) => {
        mockRegisterPressable(routeKey, identifier, ref);
        return () => {};
    },
    notifyPressedTrigger: (ref: {current: unknown} | null, identifier?: string) => {
        mockNotifyPressedTrigger(ref, identifier);
    },
}));

jest.mock('@libs/Accessibility', () => ({
    __esModule: true,
    default: {
        useScreenReaderStatus: () => mockIsScreenReaderActive,
        useScreenReaderState: () => mockScreenReaderState,
        useAutoHitSlop: () => [undefined, jest.fn()],
        moveAccessibilityFocus: jest.fn(),
    },
}));

jest.mock('@hooks/useThemeStyles', () => () => new Proxy({}, {get: () => ({})}));
jest.mock('@hooks/useStyleUtils', () => () => new Proxy({}, {get: () => () => ({})}));
jest.mock('@hooks/useKeyboardShortcut', () => ({__esModule: true, default: () => {}}));
jest.mock('@libs/HapticFeedback', () => ({__esModule: true, default: {press: jest.fn(), longPress: jest.fn()}}));
jest.mock('@hooks/useSingleExecution', () => ({
    __esModule: true,
    default: () => ({isExecuting: false, singleExecution: (fn: (...args: unknown[]) => unknown) => fn}),
}));

const GenericPressable = require<{
    default: React.ComponentType<{id?: string; nativeID?: string; testID?: string; onPress?: () => void; children?: React.ReactNode}>;
}>('../../src/components/Pressable/GenericPressable/implementation/BaseGenericPressable').default;

const ROUTE_KEY = 'route-A';

function renderInsideRoute(node: React.ReactElement) {
    return render(<NavigationRouteContext.Provider value={{key: ROUTE_KEY, name: 'A', params: undefined}}>{node}</NavigationRouteContext.Provider>);
}

beforeEach(() => {
    mockRegisterPressable.mockClear();
    mockNotifyPressedTrigger.mockClear();
    mockScreenReaderState = 'unknown';
    mockIsScreenReaderActive = false;
});

describe('BaseGenericPressable — focus-return registry gate', () => {
    it("registers during the SR warm-up window (state is 'unknown') — symmetric with the capture-side `getScreenReaderState() === 'disabled'` bail, so cold-start press → detach → back has a fallback target", () => {
        mockScreenReaderState = 'unknown';
        renderInsideRoute(
            <GenericPressable
                id="row-1"
                onPress={() => {}}
            />,
        );
        expect(mockRegisterPressable).toHaveBeenCalledTimes(1);
        const callArgs = mockRegisterPressable.mock.calls.at(0);
        expect(callArgs?.[0]).toBe(ROUTE_KEY);
        expect(callArgs?.[1]).toBe('row-1');
        expect(callArgs?.[2]).toHaveProperty('current');
    });

    it('skips registration when SR is known-off (cache warm + value false) so sighted users pay zero registry cost', () => {
        mockScreenReaderState = 'disabled';
        renderInsideRoute(
            <GenericPressable
                id="row-1"
                onPress={() => {}}
            />,
        );
        expect(mockRegisterPressable).not.toHaveBeenCalled();
    });

    it('registers when SR is known-on', () => {
        mockScreenReaderState = 'unknown';
        mockIsScreenReaderActive = true;
        renderInsideRoute(
            <GenericPressable
                id="row-1"
                onPress={() => {}}
            />,
        );
        expect(mockRegisterPressable).toHaveBeenCalledTimes(1);
    });

    it('does not register when no focusIdentifier is available (no id / nativeID / testID — the registry rescue has no key to use)', () => {
        mockScreenReaderState = 'unknown';
        renderInsideRoute(<GenericPressable onPress={() => {}} />);
        expect(mockRegisterPressable).not.toHaveBeenCalled();
    });

    it('does not register when routeKey is null (consumer outside a navigator)', () => {
        mockScreenReaderState = 'unknown';
        render(
            <GenericPressable
                id="row-1"
                onPress={() => {}}
            />,
        );
        expect(mockRegisterPressable).not.toHaveBeenCalled();
    });

    it('prefers `id` when `id`/`nativeID`/`testID` are all set', () => {
        mockScreenReaderState = 'unknown';
        renderInsideRoute(
            <GenericPressable
                id="prefer-id"
                nativeID="prefer-native"
                testID="prefer-test"
                onPress={() => {}}
            />,
        );
        expect(mockRegisterPressable.mock.calls.at(0)?.[1]).toBe('prefer-id');
    });

    it('uses `nativeID` when `id` is absent', () => {
        mockScreenReaderState = 'unknown';
        renderInsideRoute(
            <GenericPressable
                nativeID="native-id-only"
                testID="test-id-fallback"
                onPress={() => {}}
            />,
        );
        expect(mockRegisterPressable.mock.calls.at(0)?.[1]).toBe('native-id-only');
    });

    it('uses `testID` when `id` and `nativeID` are absent', () => {
        mockScreenReaderState = 'unknown';
        renderInsideRoute(
            <GenericPressable
                testID="test-id-only"
                onPress={() => {}}
            />,
        );
        expect(mockRegisterPressable.mock.calls.at(0)?.[1]).toBe('test-id-only');
    });

    it('calls notifyPressedTrigger(internalRef, identifier) on press so the focus-return capture has a fresh trigger', () => {
        mockScreenReaderState = 'unknown';
        const onPress = jest.fn();
        renderInsideRoute(
            <GenericPressable
                id="row-1"
                testID="pressable-host"
                onPress={onPress}
            />,
        );

        fireEvent.press(screen.getByTestId('pressable-host'));

        expect(onPress).toHaveBeenCalledTimes(1);
        expect(mockNotifyPressedTrigger).toHaveBeenCalledTimes(1);
        const notifyArgs = mockNotifyPressedTrigger.mock.calls.at(0);
        expect(notifyArgs?.[0]).toHaveProperty('current');
        expect(notifyArgs?.[1]).toBe('row-1');
    });
});
