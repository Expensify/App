/** Exercises the search input's border worklet and ref/callback behavior with rendering and native runtime dependencies below the component. */
import {act, render, screen} from '@testing-library/react-native';

import SearchAutocompleteInput from '@components/Search/SearchAutocompleteInput';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useFocusAfterNav from '@hooks/useFocusAfterNav';

import {setSearchContext} from '@libs/actions/Search';

import type {ThemeColors} from '@styles/theme/types';

import type {ForwardedRef} from 'react';
import type {View as NativeView, ViewProps} from 'react-native';
import type * as Reanimated from 'react-native-reanimated';
import type * as ReanimatedColors from 'react-native-reanimated/lib/typescript/common/style/processors/colors';
import type * as ReanimatedInterpolation from 'react-native-reanimated/lib/typescript/interpolateColor';

import React, {createRef} from 'react';
import {StyleSheet} from 'react-native';
import {DynamicColorIOS, PlatformColor, useAnimatedStyle} from 'react-native-reanimated';

import createMock from '../../utils/createMock';

jest.mock('@components/TextInput', () => {
    const react = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<{View: typeof NativeView}>('react-native');
    return jest.fn((props: BaseTextInputProps) => react.createElement(View, {testID: props.testID}));
});
jest.mock('@components/FormHelpMessage', () => () => null);
jest.mock('@hooks/useTheme', () => () => jest.requireActual<{defaultTheme: ThemeColors}>('@styles/theme').defaultTheme);
jest.mock('@hooks/useThemeStyles', () => () => ({searchRouterTextInputContainer: {borderWidth: 1}}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({displayName: 'Current User'}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListState: () => ({currencyList: {}})}));
jest.mock('@hooks/useExportedToFilterOptions', () => () => ({exportedToFilterOptions: []}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useFocusAfterNav', () => jest.fn(() => false));
jest.mock('@libs/actions/Search', () => ({setSearchContext: jest.fn()}));

// Keep installed color processing and interpolation real without initializing the native Reanimated module.
jest.mock('react-native-reanimated', () => {
    const mock = jest.requireActual<typeof Reanimated>('react-native-reanimated/mock');
    const colors = jest.requireActual<typeof ReanimatedColors>('react-native-reanimated/src/common/style/processors/colors');
    const interpolation = jest.requireActual<typeof ReanimatedInterpolation>('react-native-reanimated/src/interpolateColor');
    const {View} = jest.requireActual<{View: typeof NativeView}>('react-native');
    const react = jest.requireActual<typeof React>('react');
    return {
        ...mock,
        ...colors,
        interpolateColor: interpolation.interpolateColor,
        useAnimatedStyle: jest.fn(() => ({})),
        default: {...mock.default, View: ({style, children}: ViewProps) => react.createElement(View, {style, testID: 'autocomplete-wrapper'}, children)},
    };
});

const input = jest.mocked(TextInput);
const animatedStyle = jest.mocked(useAnimatedStyle);
const focusAfterNav = jest.mocked(useFocusAfterNav);

beforeEach(() => jest.clearAllMocks());

describe('SearchAutocompleteInput', () => {
    test.each([
        {description: 'string colors', border: 'red', focusedBorder: 'blue', expected: 'rgba(255, 0, 0, 1)', focusedExpected: 'rgba(0, 0, 255, 1)'},
        {description: 'transparent neighbor', border: 'transparent', focusedBorder: 'red', expected: 'rgba(255, 0, 0, 0)', focusedExpected: 'rgba(255, 0, 0, 1)'},
        {description: 'opaque platform color fallback', border: PlatformColor('label'), focusedBorder: 'red', expected: 'rgba(26, 61, 50, 1)', focusedExpected: 'rgba(255, 0, 0, 1)'},
        {
            description: 'opaque dynamic color fallback',
            border: DynamicColorIOS({light: 'red', dark: 'blue'}),
            focusedBorder: 'red',
            expected: 'rgba(26, 61, 50, 1)',
            focusedExpected: 'rgba(255, 0, 0, 1)',
        },
        {description: 'focused opaque color fallback', border: 'red', focusedBorder: PlatformColor('label'), expected: 'rgba(255, 0, 0, 1)', focusedExpected: 'rgba(26, 61, 50, 1)'},
        {description: 'two transparent endpoints', border: 'transparent', focusedBorder: 'transparent', expected: 'rgba(0, 0, 0, 0)', focusedExpected: 'rgba(0, 0, 0, 0)'},
    ])('applies $description inside the border worklet', ({border, focusedBorder, expected, focusedExpected}) => {
        // Given string endpoints or opaque colors that must fall back to the theme border.
        render(
            <SearchAutocompleteInput
                value="query"
                onSearchQueryChange={jest.fn()}
                substitutionMap={{}}
                wrapperStyle={{borderColor: border}}
                wrapperFocusedStyle={{borderColor: focusedBorder}}
            />,
        );
        const borderWorklet = animatedStyle.mock.calls.at(1)?.[0];
        const props = input.mock.calls.at(0)?.[0];
        expect(borderWorklet).toBeDefined();
        expect(props).toBeDefined();
        // When the component's actual focus callback changes the shared value.
        expect(borderWorklet?.()).toEqual({borderColor: expected});
        act(() => props?.onFocus?.(createMock<Parameters<NonNullable<BaseTextInputProps['onFocus']>>[0]>({})));
        // Then installed RGB interpolation preserves string colors and uses the theme for opaque endpoints.
        expect(borderWorklet?.()).toEqual({borderColor: focusedExpected});
    });

    it('preserves style precedence and focus/blur callback timing', () => {
        // Given wrapper styles with conflicting widths, and callbacks that observe the same shared-value worklet.
        const observed: unknown[] = [];
        render(
            <SearchAutocompleteInput
                value="query"
                onSearchQueryChange={jest.fn()}
                substitutionMap={{}}
                wrapperStyle={{borderColor: 'red', borderWidth: 2}}
                wrapperFocusedStyle={{borderColor: 'blue', borderWidth: 3}}
                onFocus={() => observed.push(animatedStyle.mock.calls.at(1)?.[0]())}
                onBlur={() => observed.push(animatedStyle.mock.calls.at(1)?.[0]())}
            />,
        );
        const props = input.mock.calls.at(0)?.[0];
        const styleWorklet = animatedStyle.mock.calls.at(0)?.[0];
        const borderWorklet = animatedStyle.mock.calls.at(1)?.[0];
        expect(props).toBeDefined();
        expect(styleWorklet).toBeDefined();
        expect(borderWorklet).toBeDefined();
        // When focus and blur run in their original callback order.
        act(() => props?.onFocus?.(createMock<Parameters<NonNullable<BaseTextInputProps['onFocus']>>[0]>({})));
        expect(styleWorklet?.()).toEqual({borderWidth: 3});
        act(() => props?.onBlur?.(createMock<Parameters<NonNullable<BaseTextInputProps['onBlur']>>[0]>({})));
        // Then focus observes the old color, blur observes the restored color, and the border worklet overrides the wrapper.
        expect(observed).toEqual([{borderColor: 'rgba(255, 0, 0, 1)'}, {borderColor: 'rgba(255, 0, 0, 1)'}]);
        const renderedStyle: unknown = screen.getByTestId('autocomplete-wrapper').props.style;
        if (!Array.isArray(renderedStyle)) {
            throw new Error('Expected the wrapper style array');
        }
        const styleParts: unknown[] = renderedStyle;
        expect(styleParts.at(1)).toBe(animatedStyle.mock.results.at(0)?.value);
        expect(styleParts.at(2)).toBe(animatedStyle.mock.results.at(1)?.value);
        expect(StyleSheet.flatten([{borderColor: 'red', borderWidth: 2}, styleWorklet?.(), borderWorklet?.()])).toEqual({borderColor: 'rgba(255, 0, 0, 1)', borderWidth: 2});
    });

    it('uses the theme border when wrapper colors are absent', () => {
        // Given no wrapper colors, both endpoints must use the current theme.
        const {defaultTheme} = jest.requireActual<{defaultTheme: ThemeColors}>('@styles/theme');
        render(
            <SearchAutocompleteInput
                value=""
                onSearchQueryChange={jest.fn()}
                substitutionMap={{}}
            />,
        );
        const borderWorklet = animatedStyle.mock.calls.at(1)?.[0];
        const props = input.mock.calls.at(0)?.[0];
        expect(borderWorklet).toBeDefined();
        expect(props).toBeDefined();
        // When the default border is evaluated before and after focus.
        expect(borderWorklet?.()).toEqual({borderColor: 'rgba(26, 61, 50, 1)'});
        act(() => props?.onFocus?.(createMock<Parameters<NonNullable<BaseTextInputProps['onFocus']>>[0]>({})));
        // Then focus leaves the default theme border unchanged.
        expect(defaultTheme.border).toBe('#1A3D32');
        expect(borderWorklet?.()).toEqual({borderColor: 'rgba(26, 61, 50, 1)'});
    });

    test.each(['callback', 'object', 'absent'])('preserves %s ref forwarding and null detach', (variant) => {
        // Given the actual supported ref shapes and the component's consumed focus contract.
        const objectRef = createRef<BaseTextInputRef>();
        const callbackRef = jest.fn<void, [BaseTextInputRef | null]>();
        let ref: ForwardedRef<BaseTextInputRef> | undefined;
        if (variant === 'callback') {
            ref = callbackRef;
        } else if (variant === 'object') {
            ref = objectRef;
        }
        const element = document.createElement('form');
        render(
            <SearchAutocompleteInput
                ref={ref}
                value="query"
                onSearchQueryChange={jest.fn()}
                substitutionMap={{}}
                shouldDelayFocus
            />,
        );
        const props = input.mock.calls.at(0)?.[0];
        const internalRef = focusAfterNav.mock.calls.at(0)?.[0];
        expect(props).toBeDefined();
        expect(internalRef).toBeDefined();
        expect(typeof props?.ref).toBe('function');
        // When the child attaches and detaches the original element.
        callbackRef.mockImplementation((attached) => expect(internalRef?.current).toBe(attached));
        if (typeof props?.ref === 'function') {
            props.ref(element);
            // Then absent external refs retain the early return while other refs receive the original element.
            expect(internalRef?.current).toBe(variant === 'absent' ? null : element);
            if (variant === 'callback') {
                expect(callbackRef).toHaveBeenCalledWith(element);
            } else if (variant === 'object') {
                expect(objectRef.current).toBe(element);
            }
            props.ref(null);
        }
        expect(internalRef?.current).toBeNull();
        if (variant === 'callback') {
            expect(callbackRef.mock.calls).toEqual([[element], [null]]);
        }
        expect(objectRef.current).toBeNull();
        expect(props?.autoFocus).toBe(false);
    });

    it('clears the query before resetting search context', () => {
        // Given an existing query whose clear callback and context reset have observable ordering.
        const changes = jest.fn();
        render(
            <SearchAutocompleteInput
                value="query"
                onSearchQueryChange={changes}
                substitutionMap={{}}
            />,
        );
        const props = input.mock.calls.at(0)?.[0];
        expect(props).toBeDefined();
        // When the real clear callback runs.
        props?.onClearInput?.();
        // Then the query change precedes context reset and the default autofocus remains enabled.
        expect(changes).toHaveBeenCalledWith('');
        expect(setSearchContext).toHaveBeenCalledWith(false);
        const contextCallOrder = jest.mocked(setSearchContext).mock.invocationCallOrder.at(0);
        if (contextCallOrder === undefined) {
            throw new Error('Expected search context reset');
        }
        expect(changes.mock.invocationCallOrder.at(0)).toBeLessThan(contextCallOrder);
        expect(props?.autoFocus).toBe(true);
    });
});
