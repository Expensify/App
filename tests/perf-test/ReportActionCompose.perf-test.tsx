import {fireEvent, screen} from '@testing-library/react-native';
import type {ComponentType, EffectCallback} from 'react';
import React from 'react';
import Onyx from 'react-native-onyx';
import type Animated from 'react-native-reanimated';
import {measureRenders} from 'reassure';
import type {WithNavigationFocusProps} from '@components/withNavigationFocus';
import type {EmojiPickerRef} from '@libs/actions/EmojiPickerAction';
import type Navigation from '@libs/Navigation/Navigation';
import ComposeProviders from '@src/components/ComposeProviders';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import OnyxProvider from '@src/components/OnyxProvider';
import {KeyboardStateProvider} from '@src/components/withKeyboardState';
import * as Localize from '@src/libs/Localize';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportActionCompose from '@src/pages/home/report/ReportActionCompose/ReportActionCompose';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// mock PortalStateContext
jest.mock('@gorhom/portal');

jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual<typeof Animated>('react-native-reanimated/mock'),
    useAnimatedRef: jest.fn(),
}));

jest.mock('../../src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getReportRHPActiveRoute: jest.fn(),
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
        useFocusEffect: (cb: EffectCallback) => cb(),
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
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, KeyboardStateProvider]}>
            <ReportActionCompose
                onSubmit={() => jest.fn()}
                reportID="1"
                disabled={false}
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

test('[ReportActionCompose] should scroll to hide suggestions', async () => {
    const scenario = async () => {
        // Query for the composer
        const composer = await screen.findByTestId('composer');

        // scroll to hide suggestions
        fireEvent.scroll(composer);
    };

    await waitForBatchedUpdates();
    await measureRenders(<ReportActionComposeWrapper />, {scenario});
});

test('[ReportActionCompose] should press to block suggestions', async () => {
    const scenario = async () => {
        // Query for the composer
        const composer = await screen.findByTestId('composer');

        // press to block suggestions
        fireEvent.press(composer);
    };

    await waitForBatchedUpdates();
    await measureRenders(<ReportActionComposeWrapper />, {scenario});
});

test('[ReportActionCompose] should press add attachemnt button', async () => {
    const scenario = async () => {
        // Query for the attachment button
        const hintAttachmentButtonText = Localize.translateLocal('common.create');
        const attachmentButton = await screen.findByLabelText(hintAttachmentButtonText);

        fireEvent.press(attachmentButton, mockEvent);
    };

    await waitForBatchedUpdates();
    await measureRenders(<ReportActionComposeWrapper />, {scenario});
});

test('[ReportActionCompose] should press add emoji button', async () => {
    const scenario = async () => {
        // Query for the emoji button
        const hintEmojiButtonText = Localize.translateLocal('reportActionCompose.emoji');
        const emojiButton = await screen.findByLabelText(hintEmojiButtonText);

        fireEvent.press(emojiButton);
    };

    await waitForBatchedUpdates();
    await measureRenders(<ReportActionComposeWrapper />, {scenario});
});

test('[ReportActionCompose] should press send message button', async () => {
    const scenario = async () => {
        // Query for the send button
        const hintSendButtonText = Localize.translateLocal('common.send');
        const sendButton = await screen.findByLabelText(hintSendButtonText);

        fireEvent.press(sendButton);
    };

    await waitForBatchedUpdates();
    await measureRenders(<ReportActionComposeWrapper />, {scenario});
});

test('[ReportActionCompose] press add attachment button', async () => {
    const scenario = async () => {
        const hintAddAttachmentButtonText = Localize.translateLocal('reportActionCompose.addAttachment');

        const addAttachmentButton = await screen.findByLabelText(hintAddAttachmentButtonText);
        fireEvent.press(addAttachmentButton, mockEvent);
    };

    await waitForBatchedUpdates();
    await measureRenders(<ReportActionComposeWrapper />, {scenario});
});

test('[ReportActionCompose] should press split bill button', async () => {
    const scenario = async () => {
        const hintSplitBillButtonText = Localize.translateLocal('iou.splitExpense');
        const splitBillButton = await screen.findByLabelText(hintSplitBillButtonText);
        fireEvent.press(splitBillButton, mockEvent);
    };

    await waitForBatchedUpdates();
    await measureRenders(<ReportActionComposeWrapper />, {scenario});
});

test('[ReportActionCompose] should press assign task button', async () => {
    const scenario = async () => {
        const hintAssignTaskButtonText = Localize.translateLocal('newTaskPage.assignTask');
        const assignTaskButton = await screen.findByLabelText(hintAssignTaskButtonText);
        fireEvent.press(assignTaskButton, mockEvent);
    };

    await waitForBatchedUpdates();
    await measureRenders(<ReportActionComposeWrapper />, {scenario});
});
