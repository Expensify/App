import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumericField from '@components/NumericField';
import NumericInput from '@components/NumericInput';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

function renderWithProviders(children: React.ReactNode) {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>);
}

describe('Numeric buttons', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('CurrencyButton', () => {
        const CURRENCY_TEST_ID = 'currency-button';

        it('is the same presentational button on both roots', () => {
            // The button reads nothing from context, so both roots expose the shared component
            // and its behavior only has to be asserted once below.
            expect(NumericInput.CurrencyButton).toBe(NumericField.CurrencyButton);
        });

        it('renders the currency and calls onPress', async () => {
            const onPress = jest.fn();

            renderWithProviders(
                <NumericInput value="12">
                    <NumericInput.CurrencyButton
                        currency="USD"
                        onPress={onPress}
                        testID={CURRENCY_TEST_ID}
                    />
                </NumericInput>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('USD')).toBeOnTheScreen();
            expect(screen.getByTestId(CURRENCY_TEST_ID)).toHaveAccessibleName('Select a currency, USD');

            fireEvent.press(screen.getByTestId(CURRENCY_TEST_ID));

            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('does not call onPress when disabled', async () => {
            const onPress = jest.fn();

            renderWithProviders(
                <NumericInput value="12">
                    <NumericInput.CurrencyButton
                        currency="USD"
                        isDisabled
                        onPress={onPress}
                        testID={CURRENCY_TEST_ID}
                    />
                </NumericInput>,
            );
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId(CURRENCY_TEST_ID));

            expect(onPress).not.toHaveBeenCalled();
        });
    });
});
