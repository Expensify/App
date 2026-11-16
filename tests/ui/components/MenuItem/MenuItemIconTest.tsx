/** Verifies that loading replaces an icon without changing its leading slot or row behavior. */
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
const iconLeaves = [
    {name: 'Icon', Component: MenuItem.Icon, Spinner: MenuItem.Spinner, isNarrow: false},
    {name: 'IconNarrow', Component: MenuItem.IconNarrow, Spinner: MenuItem.SpinnerNarrow, isNarrow: true},
];

function Wrapper({children}: PropsWithChildren) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe.each(iconLeaves)('MenuItem.$name loading', ({Component, Spinner, isNarrow}) => {
    it.each([false, true])('preserves the icon slot with isLoading=%s', (isLoading) => {
        // Given each leaf has its own slot width, which must not disappear while loading
        const {result} = renderHook(() => ({styles: useThemeStyles(), theme: useTheme()}));
        const slotStyle = StyleSheet.flatten([result.current.styles.popoverMenuIcon, isNarrow && result.current.styles.wAuto]);

        // When the leaf renders in its normal or loading state
        render(
            <Wrapper>
                <MenuItem.Root>
                    <MenuItem.Row>
                        <MenuItem.Leading>{isLoading ? <Spinner /> : <Component src={MockIcon} />}</MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>Row title</MenuItem.Title>
                        </MenuItem.Content>
                    </MenuItem.Row>
                </MenuItem.Root>
            </Wrapper>,
        );

        // Then exactly one visual is rendered, with the same slot styles and supporting spinner color
        expect(screen.getByText('Row title')).toBeOnTheScreen();
        if (isLoading) {
            const spinner = screen.UNSAFE_getByType(ActivityIndicator);
            expect(spinner.props.color).toBe(result.current.theme.textSupporting);
            expect(StyleSheet.flatten(spinner.parent?.props.style)).toEqual(slotStyle);
            expect(screen.UNSAFE_queryByType(Icon)).toBeNull();
        } else {
            const icon = screen.UNSAFE_getByType(Icon);
            expect(icon.props.src).toBe(MockIcon);
            expect(StyleSheet.flatten(icon.props.additionalStyles)).toEqual(slotStyle);
            expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
        }
    });

    it('restores the glyph and keeps the row action after loading finishes', async () => {
        // Given loading presentation does not itself decide whether a row is disabled
        const onPress = jest.fn();
        const row = (isLoading: boolean) => (
            <Wrapper>
                <MenuItem.Root onPress={onPress}>
                    <MenuItem.Row>
                        <MenuItem.Leading>{isLoading ? <Spinner /> : <Component src={MockIcon} />}</MenuItem.Leading>
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
