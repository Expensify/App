import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import KeypadAmountEditor from '@components/KeypadAmountEditor';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

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

describe('KeypadAmountPad without touch screen', () => {
    it('does not render when touch screen is not available', async () => {
        // Given a device without touch screen support
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <KeypadAmountEditor>
                    <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />
                </KeypadAmountEditor>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // When checking the rendered output
        // Then the number pad buttons are not rendered
        expect(screen.queryByTestId('button_1')).toBeNull();
    });
});
