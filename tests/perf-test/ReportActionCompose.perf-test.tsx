import {fireEvent, screen} from '@testing-library/react-native';
import type {ComponentType} from 'react';
import React from 'react';
import Onyx from 'react-native-onyx';
import type Animated from 'react-native-reanimated';
import {measurePerformance} from 'reassure';
import type {WithNavigationFocusProps} from '@components/withNavigationFocus';
import type {EmojiPickerRef} from '@libs/actions/EmojiPickerAction';
import type Navigation from '@libs/Navigation/Navigation';
import ComposeProviders from '@src/components/ComposeProviders';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import OnyxProvider from '@src/components/OnyxProvider';
import {KeyboardStateProvider} from '@src/components/withKeyboardState';
import {WindowDimensionsProvider} from '@src/components/withWindowDimensions';
import * as Localize from '@src/libs/Localize';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportActionCompose from '@src/pages/home/report/ReportActionCompose/ReportActionCompose';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// mock PortalStateContext
jest.mock('@gorhom/portal');

jest.mock(
    'react-native-reanimated',
    () =>
        ({
            ...jest.requireActual('react-native-reanimated/mock'),
            useAnimatedRef: jest.fn(),
        } as typeof Animated),
);

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        useIsFocused: () => true,
    } as typeof Navigation;
});

jest.mock('@src/libs/actions/EmojiPickerAction', () => {
    const actualEmojiPickerAction = jest.requireActual('@src/libs/actions/EmojiPickerAction');
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
    } as EmojiPickerRef;
});

jest.mock('@src/components/withNavigationFocus', <TProps extends WithNavigationFocusProps>() => (Component: ComponentType<TProps>) => {
    function WithNavigationFocus(props: Omit<TProps, keyof WithNavigationFocusProps>) {
        return (
            <Component
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                isFocused={false}
            />
        );
    }

    WithNavigationFocus.displayName = 'WithNavigationFocus';

    return WithNavigationFocus;
});

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

// Initialize the network key for OfflineWithFeedback
beforeEach(() => {
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
});

function ReportActionComposeWrapper() {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, KeyboardStateProvider, WindowDimensionsProvider]}>
            <ReportActionCompose
                onSubmit={() => jest.fn()}
                reportID="1"
                disabled={false}
                report={LHNTestUtils.getFakeReport()}
                isComposerFullSize
                listHeight={200}
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

        // Query for the suggestions
        await screen.findByTestId('suggestions');

        // scroll to hide suggestions
        fireEvent.scroll(composer);

        // press to block suggestions
        fireEvent.press(composer);
    };

    return waitForBatchedUpdates().then(() => measurePerformance(<ReportActionComposeWrapper />, {scenario}));
});

test('[ReportActionCompose] should press add attachemnt button', async () => {
    const scenario = async () => {
        // Query for the attachment button
        const hintAttachmentButtonText = Localize.translateLocal('common.create');
        const attachmentButton = await screen.findByLabelText(hintAttachmentButtonText);

        fireEvent.press(attachmentButton, mockEvent);
    };

    return waitForBatchedUpdates().then(() => measurePerformance(<ReportActionComposeWrapper />, {scenario}));
});

test('[ReportActionCompose] should press add emoji button', async () => {
    const scenario = async () => {
        // Query for the emoji button
        const hintEmojiButtonText = Localize.translateLocal('reportActionCompose.emoji');
        const emojiButton = await screen.findByLabelText(hintEmojiButtonText);

        fireEvent.press(emojiButton);
    };

    return waitForBatchedUpdates().then(() => measurePerformance(<ReportActionComposeWrapper />, {scenario}));
});

test('[ReportActionCompose] should press send message button', async () => {
    const scenario = async () => {
        // Query for the send button
        const hintSendButtonText = Localize.translateLocal('common.send');
        const sendButton = await screen.findByLabelText(hintSendButtonText);

        fireEvent.press(sendButton);
    };

    return waitForBatchedUpdates().then(() => measurePerformance(<ReportActionComposeWrapper />, {scenario}));
});

test('[ReportActionCompose] render composer with attachement modal interactions', async () => {
    const scenario = async () => {
        const hintAddAttachmentButtonText = Localize.translateLocal('reportActionCompose.addAttachment');
        const hintAssignTaskButtonText = Localize.translateLocal('newTaskPage.assignTask');
        const hintSplitBillButtonText = Localize.translateLocal('iou.splitExpense');

        // Query for the attachment modal items
        const addAttachmentButton = await screen.findByLabelText(hintAddAttachmentButtonText);
        fireEvent.press(addAttachmentButton, mockEvent);

        const splitBillButton = await screen.findByLabelText(hintSplitBillButtonText);
        fireEvent.press(splitBillButton, mockEvent);

        const assignTaskButton = await screen.findByLabelText(hintAssignTaskButtonText);
        fireEvent.press(assignTaskButton, mockEvent);
    };

    return waitForBatchedUpdates().then(() => measurePerformance(<ReportActionComposeWrapper />, {scenario}));
});
