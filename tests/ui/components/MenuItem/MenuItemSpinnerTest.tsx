/** Verifies that spinner leaves preserve the corresponding icon slots and composed row behavior. */
import {fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import Icon from '@components/Icon';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {PropsWithChildren} from 'react';

import React from 'react';
import {StyleSheet} from 'react-native';

function MockIcon() {
    return null;
}
const spinnerLeaves = [
    {name: 'Spinner', IconLeaf: MenuItem.Icon, Spinner: MenuItem.Spinner, isNarrow: false},
    {name: 'SpinnerNarrow', IconLeaf: MenuItem.IconNarrow, Spinner: MenuItem.SpinnerNarrow, isNarrow: true},
];

function Wrapper({children}: PropsWithChildren) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe.each(spinnerLeaves)('MenuItem.$name', ({IconLeaf, Spinner, isNarrow}) => {
    it('uses the supporting color and corresponding icon slot styles', () => {
        // Given spinner leaves must fit the icon slots they replace
        const {result} = renderHook(() => ({styles: useThemeStyles(), theme: useTheme()}));
        const slotStyle = StyleSheet.flatten([result.current.styles.popoverMenuIcon, isNarrow && result.current.styles.wAuto]);

        // When the caller composes a spinner instead of an icon
        render(
            <Wrapper>
                <MenuItem.Root>
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            <Spinner />
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>Row title</MenuItem.Title>
                        </MenuItem.Content>
                    </MenuItem.Row>
                </MenuItem.Root>
            </Wrapper>,
        );

        // Then the spinner preserves the slot styles without rendering an icon alongside it
        expect(screen.getByText('Row title')).toBeOnTheScreen();
        const spinner = screen.UNSAFE_getByType(ActivityIndicator);
        expect(spinner.props.color).toBe(result.current.theme.textSupporting);
        expect(StyleSheet.flatten(spinner.parent?.props.style)).toEqual(slotStyle);
        expect(screen.UNSAFE_queryByType(Icon)).toBeNull();
    });

    it('restores the glyph and keeps the row action after loading finishes', async () => {
        // Given loading presentation does not itself decide whether a row is disabled
        const onPress = jest.fn();
        const row = (isLoading: boolean) => (
            <Wrapper>
                <MenuItem.Root
                    onPress={onPress}
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                >
                    <MenuItem.Row>
                        <MenuItem.Leading>{isLoading ? <Spinner /> : <IconLeaf src={MockIcon} />}</MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>Open row</MenuItem.Title>
                        </MenuItem.Content>
                    </MenuItem.Row>
                </MenuItem.Root>
            </Wrapper>
        );
        const {rerender} = render(row(true));

        // When loading completes and the row is activated
        rerender(row(false));
        fireEvent.press(await screen.findByRole(CONST.ROLE.BUTTON, {name: 'Open row'}), {nativeEvent: {}});

        // Then the glyph returns without changing the action or leaving a spinner behind
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
        expect(screen.UNSAFE_getByType(Icon).props.src).toBe(MockIcon);
        expect(onPress).toHaveBeenCalledTimes(1);
    });
});
