import {fireEvent, screen} from '@testing-library/react-native';

import Button from '@components/Button';
import NumericInput from '@components/NumericInput';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import {StyleSheet} from 'react-native';

import {AMOUNT_TEST_ID, FOOTER_TEST_ID, INPUT_TEST_ID, PAD_TEST_ID, ROOT_TEST_ID, getLayoutStyles, renderWithProviders} from '../utils/NumericInputLayoutTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const PORTRAIT_PHONE = {windowWidth: 390, windowHeight: 844};
const LANDSCAPE_PHONE = {windowWidth: 844, windowHeight: 390};

// The real useIsInLandscapeMode runs on top of these dimensions. Jest resolves its native helper (isInLandscapeMode/index.native.ts),
// where the device info mock reports a phone (not a tablet), so the web helper based on window.screen is not covered here
const mockWindowDimensions = jest.fn(() => PORTRAIT_PHONE);

jest.mock('@hooks/useWindowDimensions', () => () => mockWindowDimensions());

jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<typeof DeviceCapabilities>('@libs/DeviceCapabilities'),
    canUseTouchScreen: () => false,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

function renderLayout() {
    return renderWithProviders(
        <NumericInput
            value="12.5"
            testID={ROOT_TEST_ID}
            footer={<Button onPress={jest.fn()}>Save</Button>}
        >
            <NumericInput.TextInput />
        </NumericInput>,
    );
}

describe('NumericInput layout without touch screen', () => {
    beforeEach(() => {
        mockWindowDimensions.mockReturnValue(PORTRAIT_PHONE);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('lets the footer pad the bottom of the screen with no top gap, since there is no number pad to end the body', async () => {
        // Given a device without a touch screen, where the number pad never renders
        const styles = getLayoutStyles();

        // When the layout renders a footer
        renderLayout();
        await waitForBatchedUpdatesWithAct();

        // Then the pad leaves no empty container, and the centered footer owns the bottom spacing instead of the scroll view
        expect(screen.queryByTestId(PAD_TEST_ID)).toBeNull();
        expect(StyleSheet.flatten(screen.getByTestId(FOOTER_TEST_ID).props.style)).toMatchObject({...styles.alignItemsCenter, ...styles.pb5});
        expect(StyleSheet.flatten(screen.getByTestId(FOOTER_TEST_ID).props.style)).not.toHaveProperty('marginTop');
        expect(StyleSheet.flatten(screen.getByTestId(ROOT_TEST_ID).props.contentContainerStyle)).not.toHaveProperty('paddingBottom');
    });

    it.each([
        ['portrait', PORTRAIT_PHONE],
        ['landscape', LANDSCAPE_PHONE],
    ])('places the actions right under the amount in %s', async (_orientation, windowDimensions) => {
        // Given a device without a touch screen, in either orientation, and a currency button passed as an action
        mockWindowDimensions.mockReturnValue(windowDimensions);
        const onCurrencyPress = jest.fn();

        // When the layout renders
        renderWithProviders(
            <NumericInput
                value="100"
                errorText="Test error"
                testID={ROOT_TEST_ID}
                actions={
                    <NumericInput.CurrencyButton
                        currency="USD"
                        onPress={onCurrencyPress}
                    />
                }
            >
                <NumericInput.TextInput testID={INPUT_TEST_ID} />
                <NumericInput.Symbol>$</NumericInput.Symbol>
            </NumericInput>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the currency button is rendered inside the centered amount area alongside the input, with the error shown too
        const currencyButton = screen.getByText('USD');
        expect(screen.getByTestId(AMOUNT_TEST_ID)).toContainElement(currencyButton);
        expect(screen.getByTestId(AMOUNT_TEST_ID)).toContainElement(screen.getByTestId(INPUT_TEST_ID));
        expect(screen.getByText('Test error')).toBeOnTheScreen();

        // When the currency button is pressed
        fireEvent.press(currencyButton);

        // Then its press handler runs
        expect(onCurrencyPress).toHaveBeenCalledTimes(1);
    });
});
