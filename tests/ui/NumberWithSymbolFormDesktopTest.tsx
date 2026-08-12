import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: () => false}));
jest.mock('@libs/shouldIgnoreSelectionWhenUpdatedManually', () => false);

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
    useIsFocused: jest.fn(() => true),
    useRoute: jest.fn(() => ({key: '', name: '', params: {}})),
}));

const INPUT_TEST_ID = 'number-with-symbol-form-input';

describe('NumberWithSymbolForm on desktop', () => {
    it('renders the currency button in the desktop layout and does not show touch-only controls', async () => {
        const onSymbolButtonPress = jest.fn();

        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NumberWithSymbolForm
                    symbol="$"
                    testID={INPUT_TEST_ID}
                    value="10"
                    currency="USD"
                    onSymbolButtonPress={onSymbolButtonPress}
                    allowFlippingAmount
                    shouldShowFlipButton
                    allowNegativeInput
                />
            </ComposeProviders>,
        );

        await waitForBatchedUpdatesWithAct();

        const currencyButton = screen.getByText('USD');
        expect(currencyButton).toBeTruthy();
        expect(screen.queryByTestId('button_1')).toBeNull();
        expect(screen.queryByText('Flip')).toBeNull();

        fireEvent.press(currencyButton);
        expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
    });

    it('applies the selection event after a manual update on web', async () => {
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NumberWithSymbolForm
                    symbol="$"
                    testID={INPUT_TEST_ID}
                    value="12"
                    displayAsTextInput
                />
            </ComposeProviders>,
        );

        await waitForBatchedUpdatesWithAct();

        const textInput = screen.getByTestId(INPUT_TEST_ID);
        fireEvent.changeText(textInput, '13');
        await waitForBatchedUpdatesWithAct();

        fireEvent(textInput, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();

        expect(textInput.props.selection).toEqual({start: 0, end: 0});
    });
});
