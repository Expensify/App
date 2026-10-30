import {screen} from '@testing-library/react-native';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';

import type * as NativeNavigation from '@react-navigation/native';
import type DeviceInfoModule from 'react-native-device-info';

import {StyleSheet} from 'react-native';

import {BODY_TEST_ID, FOOTER_TEST_ID, ROOT_TEST_ID, renderLayout} from '../utils/NumericInputLayoutTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const TABLET_LANDSCAPE = {windowWidth: 1366, windowHeight: 1024};

const mockWindowDimensions = jest.fn(() => TABLET_LANDSCAPE);

jest.mock('@hooks/useWindowDimensions', () => () => mockWindowDimensions());

// The tablet check of the native landscape helper (isInLandscapeMode/index.native.ts) runs once when it is imported, so it lives in its own test file
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

describe('NumericInput layout on tablets', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('keeps a single scrollable column on a tablet in landscape', async () => {
        // Given a tablet whose window is wider than it is tall, which only phones split into two columns
        mockWindowDimensions.mockReturnValue(TABLET_LANDSCAPE);

        // When the layout renders
        renderLayout();
        await waitForBatchedUpdatesWithAct();

        // Then the root is the scroll view holding the footer, and the body stays a plain column
        const root = screen.getByTestId(ROOT_TEST_ID);
        expect(StyleSheet.flatten(root.props.contentContainerStyle)).toMatchObject({flexGrow: 1});
        expect(root).toContainElement(screen.getByTestId(FOOTER_TEST_ID));
        expect(screen.getByTestId(BODY_TEST_ID).props.contentContainerStyle).toBeUndefined();
    });
});
