import {NavigationRouteContext} from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import React from 'react';

const mockRegisterPressable = jest.fn<() => void, [string, string, {current: unknown}]>();
const mockNotifyPressedTrigger = jest.fn();

let mockIsScreenReaderKnownOff = false;
let mockIsScreenReaderActive = false;

jest.mock('@libs/NavigationFocusReturn', () => ({
    __esModule: true,
    registerPressable: (...args: unknown[]) => {
        mockRegisterPressable(...args);
        return () => {};
    },
    notifyPressedTrigger: (...args: unknown[]) => {
        mockNotifyPressedTrigger(...args);
    },
}));

jest.mock('@libs/Accessibility', () => ({
    __esModule: true,
    default: {
        useScreenReaderStatus: () => mockIsScreenReaderActive,
        useIsScreenReaderKnownOff: () => mockIsScreenReaderKnownOff,
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
    default: React.ComponentType<{id?: string; testID?: string; onPress?: () => void; children?: React.ReactNode}>;
}>('../../src/components/Pressable/GenericPressable/implementation/BaseGenericPressable').default;

const ROUTE_KEY = 'route-A';

function renderInsideRoute(node: React.ReactElement) {
    return render(<NavigationRouteContext.Provider value={{key: ROUTE_KEY, name: 'A', params: undefined}}>{node}</NavigationRouteContext.Provider>);
}

beforeEach(() => {
    mockRegisterPressable.mockClear();
    mockNotifyPressedTrigger.mockClear();
    mockIsScreenReaderKnownOff = false;
    mockIsScreenReaderActive = false;
});

describe('BaseGenericPressable — focus-return registry gate', () => {
    it('registers during the SR warm-up window (`isScreenReaderKnownOff` is false) — symmetric with the capture-side `isScreenReaderKnownOff()` bail, so cold-start press → detach → back has a fallback target', () => {
        mockIsScreenReaderKnownOff = false;
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
        mockIsScreenReaderKnownOff = true;
        renderInsideRoute(
            <GenericPressable
                id="row-1"
                onPress={() => {}}
            />,
        );
        expect(mockRegisterPressable).not.toHaveBeenCalled();
    });

    it('registers when SR is known-on', () => {
        mockIsScreenReaderKnownOff = false;
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
        mockIsScreenReaderKnownOff = false;
        renderInsideRoute(<GenericPressable onPress={() => {}} />);
        expect(mockRegisterPressable).not.toHaveBeenCalled();
    });

    it('does not register when routeKey is null (consumer outside a navigator)', () => {
        mockIsScreenReaderKnownOff = false;
        render(
            <GenericPressable
                id="row-1"
                onPress={() => {}}
            />,
        );
        expect(mockRegisterPressable).not.toHaveBeenCalled();
    });
});
