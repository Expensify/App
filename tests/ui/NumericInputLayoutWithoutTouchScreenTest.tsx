import {fireEvent, render, screen} from '@testing-library/react-native';

import Button from '@components/Button';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumericInput from '@components/NumericInput';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';

import variables from '@styles/variables';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import {StyleSheet} from 'react-native';

import findAncestorWithStyle from '../utils/findAncestorWithStyle';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const PORTRAIT_PHONE = {windowWidth: 390, windowHeight: 844};
const LANDSCAPE_PHONE = {windowWidth: 844, windowHeight: 390};

// The real useIsInLandscapeMode runs on top of these dimensions, and the device info mock reports a phone (not a tablet)
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

const INPUT_TEST_ID = 'numeric-text-input';
const ROOT_TEST_ID = 'layout';
const MAIN_TEST_ID = 'layout-main';
const AMOUNT_TEST_ID = 'layout-amount';
const PAD_TEST_ID = 'layout-pad';
const FOOTER_TEST_ID = 'layout-footer';

/** Minimum height the single-column amount row keeps for the input and the floating error */
const RESERVED_ERROR_ROOM = variables.inputHeight + 2 * (variables.formErrorLineHeight + 8);

function renderWithProviders(children: React.ReactNode) {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>);
}

function renderLayout(hasFooter: boolean) {
    return renderWithProviders(
        <NumericInput
            value="12.5"
            testID={ROOT_TEST_ID}
            footer={hasFooter ? <Button onPress={jest.fn()}>Save</Button> : undefined}
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

    it('lets the footer pad the bottom of the screen, since there is no number pad to end the body', async () => {
        // Given a device without a touch screen, where the number pad never renders
        // When the layout renders a footer
        renderLayout(true);
        await waitForBatchedUpdatesWithAct();

        // Then the pad leaves no empty container, and the centered footer owns the bottom spacing instead of the scroll view
        expect(screen.queryByTestId(PAD_TEST_ID)).toBeNull();
        expect(StyleSheet.flatten(screen.getByTestId(FOOTER_TEST_ID).props.style)).toMatchObject({alignItems: 'center', paddingBottom: 20});
        expect(StyleSheet.flatten(screen.getByTestId(ROOT_TEST_ID).props.contentContainerStyle)).not.toHaveProperty('paddingBottom');
    });

    it('keeps the footer flush with the amount, since no number pad sits above it', async () => {
        // Given a device without a touch screen
        // When the layout renders a footer
        renderLayout(true);
        await waitForBatchedUpdatesWithAct();

        // Then the footer adds no top gap, which only separates it from the keys of a number pad
        expect(StyleSheet.flatten(screen.getByTestId(FOOTER_TEST_ID).props.style)).not.toHaveProperty('marginTop');
    });

    it('adds no bottom spacing when neither a pad nor a footer ends the body', async () => {
        // Given a device without a touch screen and a screen whose submit button sits outside the layout (e.g. a FormProvider)
        // When the layout renders without a footer
        renderLayout(false);
        await waitForBatchedUpdatesWithAct();

        // Then nothing pads the bottom, so the centered amount keeps the full height of the column like the legacy form
        expect(screen.queryByTestId(PAD_TEST_ID)).toBeNull();
        expect(StyleSheet.flatten(screen.getByTestId(ROOT_TEST_ID).props.contentContainerStyle)).not.toHaveProperty('paddingBottom');
    });

    it.each([
        ['portrait', PORTRAIT_PHONE],
        ['landscape', LANDSCAPE_PHONE],
    ])('places the actions right under the amount in %s', async (_orientation, windowDimensions) => {
        // Given a device without a touch screen, in either orientation, and a currency button passed as an action
        mockWindowDimensions.mockReturnValue(windowDimensions);
        const onCurrencyPress = jest.fn();
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

    it('keeps the action below the room the amount row reserves for the floating error', async () => {
        // Given a device without a touch screen in portrait, with a currency button under the amount
        renderWithProviders(
            <NumericInput
                value="100"
                testID={ROOT_TEST_ID}
                actions={
                    <NumericInput.CurrencyButton
                        currency="USD"
                        onPress={jest.fn()}
                    />
                }
            >
                <NumericInput.TextInput testID={INPUT_TEST_ID} />
            </NumericInput>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the amount row alone carries the reserved height, so the button sits below it like in the legacy form
        const amountRow = findAncestorWithStyle(screen.getByTestId(INPUT_TEST_ID), 'minHeight', RESERVED_ERROR_ROOM);
        expect(amountRow).toBeDefined();
        expect(amountRow).not.toContainElement(screen.getByText('USD'));
    });

    it('hides the flip button, which needs the touch number pad flow', async () => {
        // Given a device without a touch screen and a flip button passed as the only action
        renderWithProviders(
            <NumericInput
                value="100"
                allowNegative
                testID={ROOT_TEST_ID}
                actions={<NumericInput.FlipButton />}
            >
                <NumericInput.TextInput />
            </NumericInput>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the flip button renders nothing, while the amount column still renders
        expect(screen.queryByText('Flip')).toBeNull();
        expect(screen.getByTestId(MAIN_TEST_ID)).toBeOnTheScreen();
    });
});
