// cspell:ignore togglebutton

import {fireEvent, render, screen} from '@testing-library/react-native';

import BaseGenericPressable from '@components/Pressable/GenericPressable/implementation/BaseGenericPressable';
import type WebGenericPressableType from '@components/Pressable/GenericPressable/implementation/index';

import KeyboardShortcut from '@libs/KeyboardShortcut';

import CONST from '@src/CONST';

import type {PressableProps as RNPressableProps, View} from 'react-native';

import React, {act, createRef} from 'react';
import {createRoot} from 'react-dom/client';

/* eslint-disable testing-library/no-unnecessary-act -- React DOM roots are driven directly, outside Testing Library. */

const mockRegisterFreezeDefer = jest.fn(() => jest.fn());
let mockScreenReaderState: 'disabled' | 'enabled' = 'disabled';
const WebGenericPressable = require<{
    default: typeof WebGenericPressableType;
}>('@components/Pressable/GenericPressable/implementation/index.tsx').default;

jest.mock('@libs/KeyboardShortcut', () => ({
    __esModule: true,
    default: {subscribe: jest.fn(() => jest.fn())},
}));
jest.mock('@navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenFreezeWrapper/ScreenFreezeContext', () => ({
    useScreenFreezeContext: () => ({
        registerFreezeDefer: mockRegisterFreezeDefer,
    }),
}));
jest.mock('@libs/Accessibility', () => ({
    __esModule: true,
    default: {
        useScreenReaderState: () => mockScreenReaderState,
        useAutoHitSlop: () => [undefined, jest.fn()],
        moveAccessibilityFocus: jest.fn(),
    },
}));
jest.mock('@hooks/useThemeStyles', () => () => new Proxy({}, {get: () => ({})}));
jest.mock('@hooks/useStyleUtils', () => () => new Proxy({}, {get: () => () => ({})}));
jest.mock('@libs/HapticFeedback', () => ({
    __esModule: true,
    default: {press: jest.fn(), longPress: jest.fn()},
}));
jest.mock('@hooks/useSingleExecution', () => ({
    __esModule: true,
    default: () => ({
        isExecuting: false,
        singleExecution: (fn: () => void) => fn,
    }),
}));
jest.mock('@libs/NavigationFocusReturn', () => ({
    registerPressable: jest.fn(() => jest.fn()),
    notifyPressedTrigger: jest.fn(),
}));

const mockedSubscribe = jest.mocked(KeyboardShortcut.subscribe);

beforeEach(() => {
    mockedSubscribe.mockClear();
    mockRegisterFreezeDefer.mockClear();
    mockScreenReaderState = 'disabled';
});

describe('GenericPressable keyboard contract', () => {
    it('subscribes an arbitrary shortcut unchanged and cleans up', () => {
        // Given a custom Shortcut.
        // When the base component mounts and unmounts.
        // Then the real hook subscribes and releases it.
        const unsubscribe = jest.fn();
        mockedSubscribe.mockReturnValueOnce(unsubscribe);
        const shortcut = {
            displayName: 'Custom',
            shortcutKey: 'CustomKey',
            descriptionKey: 'custom.description',
            modifiers: ['CTRL', 'SHIFT'] as const,
        };
        const result = render(
            <BaseGenericPressable
                accessibilityLabel="Custom"
                keyboardShortcut={shortcut}
                onPress={() => {}}
            />,
        );
        expect(mockedSubscribe).toHaveBeenCalledWith('CustomKey', expect.any(Function), 'custom.description', ['CTRL', 'SHIFT'], true, false, 0, false, expect.any(Array), false);
        expect(mockRegisterFreezeDefer).toHaveBeenCalledTimes(1);
        result.unmount();
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('does not subscribe or defer freezing without a shortcut', () => {
        // Given no shortcut.
        // When the base component mounts.
        // Then the unconditional hook remains inactive.
        render(
            <BaseGenericPressable
                accessibilityLabel="Plain"
                onPress={() => {}}
            />,
        );
        expect(mockedSubscribe).not.toHaveBeenCalled();
        expect(mockRegisterFreezeDefer).not.toHaveBeenCalled();
    });

    it('activates link Enter only when no custom key handler is supplied', () => {
        // Given a link with and without a supplied key handler.
        // When Enter is pressed.
        // Then the default handler activates only without the supplied handler.
        const onPress = jest.fn();
        const onKeyDown = jest.fn();
        const result = render(
            <BaseGenericPressable
                accessibilityLabel="Link"
                role="link"
                testID="link"
                onPress={onPress}
            />,
        );
        fireEvent(screen.getByTestId('link'), 'keyDown', {
            key: 'Enter',
            nativeEvent: {key: 'Enter'},
            preventDefault: jest.fn(),
        });
        expect(onPress).toHaveBeenCalledTimes(1);
        result.rerender(
            <BaseGenericPressable
                accessibilityLabel="Link"
                role="link"
                testID="link"
                onKeyDown={onKeyDown}
                onPress={onPress}
            />,
        );
        fireEvent(screen.getByTestId('link'), 'keyDown', {
            key: 'Enter',
            nativeEvent: {key: 'Enter'},
            preventDefault: jest.fn(),
        });
        expect(onKeyDown).toHaveBeenCalledTimes(1);
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('keeps web role precedence, focusability and merged refs', () => {
        // Given a disabled focusable pressable with a caller ref.
        // When the web wrapper renders.
        // Then accessibilityRole wins and the caller ref is composed.
        const ref = createRef<View>();
        render(
            <WebGenericPressable
                accessibilityLabel="Web"
                accessibilityRole="header"
                role="button"
                disabled
                testID="web"
                ref={ref}
            />,
        );
        const host = screen.getByTestId('web');
        expect(host.props.accessibilityRole).toBe('header');
        expect(host.props.role).toBeUndefined();
        expect(host.props.tabIndex).toBe(0);
        expect(host.props.disabled).toBeUndefined();
        expect(host.props.accessibilityState).toEqual({disabled: true});
        expect(ref.current).not.toBeNull();
    });

    it('writes and removes aria-disabled on a DOM node while preserving focus and refs', () => {
        // Given a DOM-backed Pressable beneath the real wrapper and base component.
        // When disabled, focus, ref, and screen-reader inputs change across renders and clicks.
        // Then the DOM attributes, merged ref, and gated activation follow those inputs.
        jest.resetModules();
        jest.doMock('react', () => React);
        jest.doMock('react-native', () => {
            const actual = jest.requireActual<{Pressable: React.ComponentType<RNPressableProps>}>('react-native');
            const propsToAriaRole = jest.requireActual<(props: Pick<RNPressableProps, 'accessibilityRole' | 'role'>) => string | undefined>(
                'react-native-web/dist/cjs/modules/AccessibilityUtil/propsToAriaRole',
            );
            const Pressable = React.forwardRef<HTMLButtonElement, RNPressableProps>((props, forwardedRef) => {
                const hostProps = {
                    ref: forwardedRef,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'data-testid': props.testID,
                    role: propsToAriaRole(props),
                    tabIndex: props.tabIndex,
                    disabled: props.disabled,
                    onClick: props.onPress,
                    onKeyDown: props.onKeyDown,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'aria-disabled': false,
                    type: 'button',
                };
                // eslint-disable-next-line react/button-has-type -- The mock's hostProps includes type="button".
                return React.createElement('button', hostProps);
            });
            return Object.defineProperty(actual, 'Pressable', {
                value: Pressable,
                configurable: true,
            });
        });
        let DomWebGenericPressable = WebGenericPressable;
        jest.isolateModules(() => {
            DomWebGenericPressable = require<{
                default: typeof WebGenericPressableType;
            }>('@components/Pressable/GenericPressable/implementation/index.tsx').default;
        });
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        const ref = createRef<View>();
        try {
            act(() => {
                root.render(
                    <DomWebGenericPressable
                        accessibilityLabel="DOM web"
                        accessibilityRole="header"
                        role="button"
                        disabled
                        testID="dom-web"
                        ref={ref}
                    />,
                );
            });
            const element = container.querySelector<HTMLElement>('[data-testid="dom-web"]');
            expect(element).toBeInstanceOf(HTMLElement);
            expect(ref.current === element).toBe(true);
            expect(element?.getAttribute('role')).toBe('heading');
            expect(element?.getAttribute('tabindex')).toBe('0');
            expect(element?.getAttribute('aria-disabled')).toBe('true');

            for (const [accessibilityRole, expectedRole] of [
                ['search', 'search'],
                ['togglebutton', 'togglebutton'],
                ['none', 'presentation'],
                ['image', 'img'],
                ['adjustable', 'slider'],
                ['summary', 'region'],
                ['imagebutton', null],
            ] as const) {
                // eslint-disable-next-line @typescript-eslint/no-loop-func -- React's synchronous act completes each render before the next role.
                act(() => {
                    root.render(
                        <DomWebGenericPressable
                            accessibilityLabel="DOM web"
                            accessibilityRole={accessibilityRole}
                            role="button"
                            testID="dom-web"
                        />,
                    );
                });
                expect(element?.getAttribute('role')).toBe(expectedRole);
            }

            // Given a web accessibility link that conflicts with its supplied role.
            // When Enter is pressed, the accessibility role takes precedence for keyboard activation.
            // Then the real wrapper activates links and does not activate a non-link override.
            const onLinkPress = jest.fn();
            act(() => {
                root.render(
                    <DomWebGenericPressable
                        accessibilityLabel="DOM link"
                        accessibilityRole="link"
                        role="button"
                        testID="dom-web"
                        onPress={onLinkPress}
                    />,
                );
            });
            expect(element?.getAttribute('role')).toBe('link');
            act(() => element?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true})));
            expect(onLinkPress).toHaveBeenCalledTimes(1);
            act(() => {
                root.render(
                    <DomWebGenericPressable
                        accessibilityLabel="DOM button"
                        accessibilityRole="button"
                        role="link"
                        testID="dom-web"
                        onPress={onLinkPress}
                    />,
                );
            });
            expect(element?.getAttribute('role')).toBe('button');
            act(() => element?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true})));
            expect(onLinkPress).toHaveBeenCalledTimes(1);

            act(() => {
                root.render(
                    <DomWebGenericPressable
                        accessibilityLabel="DOM web"
                        testID="dom-web"
                        tabIndex={-1}
                    />,
                );
            });
            expect(element?.getAttribute('aria-disabled')).toBeNull();
            expect(element?.getAttribute('tabindex')).toBe('-1');

            act(() => {
                root.render(
                    <DomWebGenericPressable
                        accessibilityLabel="DOM web"
                        testID="dom-web"
                        fullDisabled
                    />,
                );
            });
            expect(element?.getAttribute('aria-disabled')).toBe('true');

            const onPress = jest.fn();
            mockScreenReaderState = 'enabled';
            act(() => {
                root.render(
                    <DomWebGenericPressable
                        accessibilityLabel="DOM web"
                        testID="dom-web"
                        enableInScreenReaderStates={CONST.SCREEN_READER_STATES.DISABLED}
                        onPress={onPress}
                    />,
                );
            });
            act(() => element?.click());
            expect(onPress).not.toHaveBeenCalled();
            mockScreenReaderState = 'disabled';
            act(() => {
                root.render(
                    <DomWebGenericPressable
                        accessibilityLabel="DOM web"
                        testID="dom-web"
                        onPress={onPress}
                    />,
                );
            });
            expect(element?.getAttribute('aria-disabled')).toBeNull();
            act(() => element?.click());
            expect(onPress).toHaveBeenCalledTimes(1);
        } finally {
            act(() => root.unmount());
            container.remove();
        }
    });
});
