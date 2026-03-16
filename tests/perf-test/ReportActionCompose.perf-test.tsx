import {fireEvent, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type Animated from 'react-native-reanimated';
import {measureRenders} from 'reassure';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {EmojiPickerRef} from '@libs/actions/EmojiPickerAction';
import type Navigation from '@libs/Navigation/Navigation';
import ReportActionCompose from '@pages/inbox/report/ReportActionCompose/ReportActionCompose';
import ComposeProviders from '@src/components/ComposeProviders';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import {KeyboardStateProvider} from '@src/components/withKeyboardState';
import ONYXKEYS from '@src/ONYXKEYS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// mock PortalStateContext
jest.mock('@gorhom/portal');

jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual<typeof Animated>('react-native-reanimated/mock'),
    useAnimatedRef: jest.fn(),
    LayoutAnimationConfig: ({children}: {children: React.ReactNode}) => children,
    Keyframe: jest.fn().mockImplementation(() => ({
        duration: jest.fn().mockReturnThis(),
        delay: jest.fn().mockReturnThis(),
        easing: jest.fn().mockReturnThis(),
        withCallback: jest.fn().mockReturnThis(),
    })),
    makeShareableCloneRecursive: jest.fn,
}));

jest.mock('../../src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getReportRHPActiveRoute: jest.fn(),
    isTopmostRouteModalScreen: jest.fn(() => false),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        useIsFocused: () => true,
        useNavigationState: () => {},
        useFocusEffect: jest.fn(),
        useRoute: () => jest.fn(),
    };
});

jest.mock('@src/libs/actions/EmojiPickerAction', () => {
    const actualEmojiPickerAction = jest.requireActual<EmojiPickerRef>('@src/libs/actions/EmojiPickerAction');
    return {
        ...actualEmojiPickerAction,
        emojiPickerRef: {
            current: {
                isEmojiPickerVisible: false,
            },
        },
        showEmojiPicker: jest.fn(),
        hideEmojiPicker: jest.fn(),
        isActive: () => true,
    };
});

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

// Initialize the network key for OfflineWithFeedback
beforeEach(() => {
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
});

function ReportActionComposeWrapper() {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, KeyboardStateProvider]}>
            <ReportActionCompose
                onSubmit={() => jest.fn()}
                reportID="1"
                report={LHNTestUtils.getFakeReport()}
                isComposerFullSize
            />
        </ComposeProviders>
    );
}
const mockEvent = {preventDefault: jest.fn()};

test('[ReportActionCompose] should render Composer with text input interactions', async () => {
    const scenario = async () => {
        // Query for the composer
        const composer = await screen.findByTestId('composer');
        fireEvent.changeText(composer, '@test');
    };

    await waitForBatchedUpdates();
    await measureRenders(<ReportActionComposeWrapper />, {scenario});
});

test('[ReportActionCompose] should press create button', async () => {
    const scenario = async () => {
        // Query for the create button
        const hintAttachmentButtonText = translateLocal('common.create');
        const createButton = await screen.findByLabelText(hintAttachmentButtonText);

        fireEvent.press(createButton, mockEvent);
    };

    await waitForBatchedUpdates();
    await measureRenders(<ReportActionComposeWrapper />, {scenario});
});

test('[ReportActionCompose] should press send message button', async () => {
    const scenario = async () => {
        // Query for the send button
        const hintSendButtonText = translateLocal('common.send');
        const sendButton = await screen.findByLabelText(hintSendButtonText);

        fireEvent.press(sendButton);
    };

    await waitForBatchedUpdates();
    await measureRenders(<ReportActionComposeWrapper />, {scenario});
});
