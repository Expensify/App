/** Background removal must not remove interaction, opacity or caller-supplied styling. */
import {fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import MenuItem from '@components/MenuItem';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

let mockIsHovered = false;
jest.mock(
    '@components/Hoverable',
    () =>
        ({children}: {children: (isHovered: boolean) => React.ReactNode}) =>
            children(mockIsHovered),
);

function isStyleCallback(value: unknown): value is (state: {pressed: boolean}) => unknown {
    return typeof value === 'function';
}

function getRowStyle(pressed: boolean): unknown {
    const style: unknown = screen.UNSAFE_getByType(PressableWithSecondaryInteraction).props.style;
    if (!isStyleCallback(style)) {
        throw new Error('Expected the row interaction style callback');
    }
    const result: unknown = style({pressed});
    return result;
}

const states = [
    {name: 'hover', hovered: true, focused: false, pressed: false},
    {name: 'focus', hovered: false, focused: true, pressed: false},
    {name: 'press', hovered: true, focused: false, pressed: true},
];

beforeEach(() => {
    mockIsHovered = false;
});

it.each(states)('keeps the existing $name feedback by default', ({hovered, focused, pressed}) => {
    // Given a standard interactive row in each visual interaction state.
    mockIsHovered = hovered;
    const {result} = renderHook(() => useTheme());
    render(
        <MenuItem.Root
            onPress={() => {}}
            sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            isFocused={focused}
        >
            <MenuItem.Title>Trip</MenuItem.Title>
        </MenuItem.Root>,
    );

    // When the row computes its interaction style.
    const style = getRowStyle(pressed);

    // Then the default caller still receives the appropriate derived background.
    let expectedColor = result.current.hoverComponentBG;
    if (pressed) {
        expectedColor = result.current.buttonHoveredBG;
    } else if (focused) {
        expectedColor = result.current.border;
    }
    expect(style).toContainEqual({backgroundColor: expectedColor});
});

it.each(states)('removes derived $name backgrounds without disabling the row', ({hovered, focused, pressed}) => {
    // Given a trip preview uses its card's own background.
    mockIsHovered = hovered;
    const onPress = jest.fn();
    const callerStyle = {backgroundColor: '#123456'};
    const {result} = renderHook(() => ({theme: useTheme(), styles: useThemeStyles()}));
    render(
        <MenuItem.Root
            onPress={onPress}
            sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            isFocused={focused}
            style={callerStyle}
            shouldRemoveBackground
        >
            <MenuItem.Title>Trip</MenuItem.Title>
        </MenuItem.Root>,
    );

    // When the row is styled and activated.
    const style = getRowStyle(pressed);
    fireEvent.press(screen.getByRole('button', {name: 'Trip'}), {nativeEvent: {}});

    // Then only the caller's background survives, while the press action remains available.
    expect(style).toContainEqual(callerStyle);
    expect(style).not.toContainEqual({backgroundColor: result.current.theme.border});
    expect(style).not.toContainEqual({backgroundColor: result.current.theme.buttonHoveredBG});
    expect(style).not.toContainEqual(result.current.styles.hoveredComponentBG);
    expect(onPress).toHaveBeenCalledTimes(1);
});

it('retains disabled opacity when backgrounds are removed', () => {
    // Given a disabled row opts out only of generated backgrounds.
    const {result} = renderHook(() => useThemeStyles());
    render(
        <MenuItem.Root
            onPress={() => {}}
            sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            isDisabled
            shouldRemoveBackground
        >
            <MenuItem.Title>Trip</MenuItem.Title>
        </MenuItem.Root>,
    );

    // When its visual state is computed.
    const style = getRowStyle(false);

    // Then disabled feedback and semantics are not accidentally removed with the background.
    expect(style).toContainEqual(result.current.buttonOpacityDisabled);
    expect(screen.getByRole('button', {name: 'Trip'})).toBeDisabled();
});
