import {render, screen} from '@testing-library/react-native';

import Button from '@components/Button';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumericInput from '@components/NumericInput';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';

import type * as NativeNavigation from '@react-navigation/native';
import type DeviceInfoModule from 'react-native-device-info';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockWindowDimensions = jest.fn(() => ({windowWidth: 1366, windowHeight: 1024}));

jest.mock('@hooks/useWindowDimensions', () => () => mockWindowDimensions());

// The tablet check runs once when the landscape helper is imported, so it lives in its own test file
jest.mock('react-native-device-info', () => {
    const mockDeviceInfo = jest.requireActual<typeof DeviceInfoModule>('react-native-device-info/jest/react-native-device-info-mock');
    return {
        __esModule: true,
        default: {...mockDeviceInfo, isTablet: () => true},
    };
});

jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<typeof DeviceCapabilities>('@libs/DeviceCapabilities'),
    canUseTouchScreen: () => true,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

const ROOT_TEST_ID = 'layout';
const BODY_TEST_ID = 'layout-body';
const FOOTER_TEST_ID = 'layout-footer';

function renderLayout() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NumericInput
                value="12.5"
                testID={ROOT_TEST_ID}
                footer={<Button onPress={jest.fn()}>Save</Button>}
            >
                <NumericInput.TextInput />
            </NumericInput>
        </ComposeProviders>,
    );
}

describe('NumericInput layout on tablets', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        ['a tablet in landscape', {windowWidth: 1366, windowHeight: 1024}],
        ['a wide window', {windowWidth: 2560, windowHeight: 900}],
    ])('keeps a single scrollable column on %s', async (_, dimensions) => {
        // Given a tablet whose window is wider than it is tall, which only phones split into two columns
        mockWindowDimensions.mockReturnValue(dimensions);

        // When the layout renders
        renderLayout();
        await waitForBatchedUpdatesWithAct();

        // Then the root is the scroll view holding the footer, and the body stays a plain column
        const root = screen.getByTestId(ROOT_TEST_ID);
        expect(root.props.contentContainerStyle).toBeDefined();
        expect(root).toContainElement(screen.getByTestId(FOOTER_TEST_ID));
        expect(screen.getByTestId(BODY_TEST_ID).props.contentContainerStyle).toBeUndefined();
    });
});
