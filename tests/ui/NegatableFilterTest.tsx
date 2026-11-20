import {fireEvent, render, screen} from '@testing-library/react-native';

import NegatableFilter from '@components/Search/FilterComponents/NegatableFilter';
import Tooltip from '@components/Tooltip';

import CONST from '@src/CONST';

import type {PressableProps, TextProps} from 'react-native';

import React from 'react';

type MockButtonProps = React.PropsWithChildren<{isDisabled?: boolean; onPress?: () => void}>;
type ReactNativeComponents = {Pressable: React.ComponentType<PressableProps>; Text: React.ComponentType<TextProps>};

jest.mock('@components/Button', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Pressable, Text} = jest.requireActual<ReactNativeComponents>('react-native');
    const Button = ({children, isDisabled, onPress}: MockButtonProps) => ReactMock.createElement(Pressable, {disabled: isDisabled, onPress, accessibilityRole: 'button'}, children);
    Button.Text = Text;
    return {__esModule: true, default: Button};
});
jest.mock('@components/Text', () => jest.requireActual<ReactNativeComponents>('react-native').Text);
jest.mock('@components/Tooltip', () => jest.fn(({children}: React.PropsWithChildren) => children));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

describe('NegatableFilter', () => {
    beforeEach(() => jest.clearAllMocks());

    it('prevents negation while disabled, exposes its tooltip, and still allows the positive option', () => {
        // Given a Has filter with a disabled negative option
        const onNegationChange = jest.fn();
        render(
            <NegatableFilter
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS}
                isNegated={false}
                negationDisabledTooltip="Not available with violation filter"
                onNegationChange={onNegationChange}
            />,
        );

        // When the user attempts to choose the disabled option
        fireEvent.press(screen.getByText('search.filters.filterType.has.negative'));

        // Then no negation change occurs, and the tooltip explains the restriction
        expect(onNegationChange).not.toHaveBeenCalled();
        expect(jest.mocked(Tooltip).mock.lastCall?.[0]).toEqual(expect.objectContaining({text: 'Not available with violation filter', shouldRender: true}));
        fireEvent.press(screen.getByText('search.filters.filterType.has.positive'));
        expect(onNegationChange).toHaveBeenCalledWith(false);
    });

    it.each([false, true])('keeps negation enabled without a disabling tooltip (isNegated=%s)', (isNegated) => {
        // Given an existing caller that supplies no disabled state
        const onNegationChange = jest.fn();
        render(
            <NegatableFilter
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS}
                isNegated={isNegated}
                onNegationChange={onNegationChange}
            />,
        );

        // When the user chooses the negative option
        fireEvent.press(screen.getByText('search.filters.filterType.has.negative'));

        // Then existing negation behavior is unchanged without a tooltip wrapper
        expect(onNegationChange).toHaveBeenCalledWith(true);
        expect(jest.mocked(Tooltip).mock.lastCall?.[0].shouldRender).toBe(false);
    });
});
