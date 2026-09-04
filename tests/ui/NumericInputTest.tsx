import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumericInput from '@components/NumericInput';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

type NumericInputProps = React.ComponentProps<typeof NumericInput>;

const INPUT_TEST_ID = 'numeric-text-input';
function renderWithProviders(children: React.ReactNode) {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>);
}

describe('NumericInput', () => {
    const onInputChange = jest.fn();

    const renderNumericInput = (props: Partial<NumericInputProps> = {}, children?: React.ReactNode) =>
        renderWithProviders(
            <NumericInput
                onInputChange={onInputChange}
                decimals={2}
                {...props}
            >
                {children ?? (
                    <>
                        <NumericInput.Symbol>$</NumericInput.Symbol>
                        <NumericInput.TextInput testID={INPUT_TEST_ID} />
                    </>
                )}
            </NumericInput>,
        );

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('symbol primitive', () => {
        it('renders the symbol the composition places beside the input', () => {
            renderNumericInput({value: '12'});

            expect(screen.getByText('$')).toBeOnTheScreen();
        });

        it('renders on its own, without an input', () => {
            renderNumericInput({value: '12'}, <NumericInput.Symbol>km</NumericInput.Symbol>);

            expect(screen.getByText('km')).toBeOnTheScreen();
        });

        it('calls back when the pressable symbol is pressed', () => {
            const onSymbolButtonPress = jest.fn();
            renderNumericInput(
                {value: '12'},
                <NumericInput.Symbol
                    isSymbolPressable
                    onSymbolButtonPress={onSymbolButtonPress}
                >
                    $
                </NumericInput.Symbol>,
            );

            fireEvent.press(screen.getByText('$'));

            expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
        });
    });

    describe('text input primitive', () => {
        it('rejects an edit that exceeds the accepted number of decimals', () => {
            renderNumericInput({value: '1.23'});

            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '1.234');

            expect(onInputChange).not.toHaveBeenCalled();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('1.23');
        });
    });
});
