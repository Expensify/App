import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';
import type ShouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually/types';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<typeof DeviceCapabilities>('@libs/DeviceCapabilities'),
    canUseTouchScreen: () => false,
}));
jest.mock('@libs/shouldIgnoreSelectionWhenUpdatedManually', () => ({
    ...jest.requireActual<{default: ShouldIgnoreSelectionWhenUpdatedManually}>('@libs/shouldIgnoreSelectionWhenUpdatedManually'),
    __esModule: true,
    default: false,
}));

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

describe('NumberWithSymbolForm without a touch screen', () => {
    it('renders the currency button and does not show touch-only controls', async () => {
        const onSymbolButtonPress = jest.fn();

        // Given a form rendered on a device without a touch screen
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

        // Then the currency button is shown and touch-only controls are hidden
        const currencyButton = screen.getByText('USD');
        expect(currencyButton).toBeTruthy();
        expect(screen.queryByTestId('button_1')).toBeNull();
        expect(screen.queryByText(translateLocal('iou.flip'))).toBeNull();

        // When the currency button is pressed
        fireEvent.press(currencyButton);

        // Then the symbol button callback is called
        expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
    });

    it('applies the selection event after a manual update on web', async () => {
        // Given a text input rendered on a device without a touch screen
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

        // When the value is manually updated and a selection event is fired
        fireEvent.changeText(textInput, '13');
        await waitForBatchedUpdatesWithAct();

        fireEvent(textInput, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();

        // Then the selection event is applied
        expect(textInput.props.selection).toEqual({start: 0, end: 0});
    });
});
