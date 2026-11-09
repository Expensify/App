import {screen} from '@testing-library/react-native';

import KeypadAmountEditor from '@components/KeypadAmountEditor';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import {StyleSheet} from 'react-native';

import findAncestorWithStyle from '../utils/findAncestorWithStyle';
import {
    AMOUNT_TEST_ID,
    FOOTER_TEST_ID,
    INPUT_TEST_ID,
    MAIN_TEST_ID,
    PAD_TEST_ID,
    ROOT_TEST_ID,
    getLayoutStyles,
    renderLayout,
    renderWithProviders,
} from '../utils/KeypadAmountLayoutTestUtils';
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

describe('KeypadAmountLayout without touch screen', () => {
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
    ])('places the actions right under the amount in %s', async (orientation, windowDimensions) => {
        // Given a device without a touch screen, in either orientation, and a currency button passed as an action
        mockWindowDimensions.mockReturnValue(windowDimensions);
        const styles = getLayoutStyles();

        // When the layout renders
        renderWithProviders(
            <KeypadAmountEditor
                value="100"
                errorText="Test error"
                testID={ROOT_TEST_ID}
                actions={
                    <KeypadAmountEditor.CurrencyPickerButton
                        currency="USD"
                        onPress={jest.fn()}
                    />
                }
            >
                <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />
                <KeypadAmountEditor.Symbol>$</KeypadAmountEditor.Symbol>
            </KeypadAmountEditor>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the currency button sits inside the amount area but outside the horizontal input row, placed under it
        const currencyButton = screen.getByText('USD');
        const inputRow = findAncestorWithStyle(screen.getByTestId(INPUT_TEST_ID), 'flexDirection', 'row');
        expect(screen.getByTestId(AMOUNT_TEST_ID)).toContainElement(currencyButton);
        expect(inputRow).toBeDefined();
        expect(inputRow).not.toContainElement(currencyButton);

        // Then the error is positioned according to the orientation without touch screen spacing
        const error = screen.getByText('Test error');
        if (orientation === 'portrait') {
            const floatingError = findAncestorWithStyle(error, 'position', 'absolute');
            expect(floatingError).toBeDefined();
            expect(screen.getByTestId(AMOUNT_TEST_ID)).toContainElement(floatingError ?? null);
            expect(floatingError).toHaveStyle({...styles.b0, ...styles.mb3});
        } else {
            expect(screen.getByTestId(MAIN_TEST_ID)).toContainElement(error);
            expect(screen.getByTestId(AMOUNT_TEST_ID)).not.toContainElement(error);
            expect(findAncestorWithStyle(error, 'position', 'absolute')).toBeUndefined();
        }
    });
});
