import {fireEvent, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import ComposeProviders from '../../src/components/ComposeProviders';
import {LocaleContextProvider} from '../../src/components/LocaleContextProvider';
import OnyxProvider from '../../src/components/OnyxProvider';
import {KeyboardStateProvider} from '../../src/components/withKeyboardState';
import {WindowDimensionsProvider} from '../../src/components/withWindowDimensions';
import CONST from '../../src/CONST';
import * as Localize from '../../src/libs/Localize';
import ONYXKEYS from '../../src/ONYXKEYS';
import ReportActionCompose from '../../src/pages/home/report/ReportActionCompose/ReportActionCompose';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// mock PortalStateContext
jest.mock('@gorhom/portal');

jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual('react-native-reanimated/mock'),
    useAnimatedRef: jest.fn,
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        useIsFocused: () => ({
            navigate: jest.fn(),
        }),
    };
});

jest.mock('../../src/libs/actions/EmojiPickerAction', () => {
    const actualEmojiPickerAction = jest.requireActual('../../src/libs/actions/EmojiPickerAction');
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
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        registerStorageEventListener: () => {},
    }),
);

// Initialize the network key for OfflineWithFeedback
beforeEach(() => {
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
});

const runs = CONST.PERFORMANCE_TESTS.RUNS;

function ReportActionComposeWrapper() {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, KeyboardStateProvider, WindowDimensionsProvider]}>
            <ReportActionCompose
                onSubmit={() => jest.fn()}
                reportID="1"
                disabled={false}
                report={LHNTestUtils.getFakeReport()}
            />
        </ComposeProviders>
    );
}
const mockEvent = {preventDefault: jest.fn()};

test('should render Composer with text input interactions', async () => {
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

    return waitForBatchedUpdates().then(() => measurePerformance(<ReportActionComposeWrapper />, {scenario, runs}));
});

test('should press add attachemnt button', async () => {
    const scenario = async () => {
        // Query for the attachment button
        const hintAttachmentButtonText = Localize.translateLocal('reportActionCompose.addAction');
        const attachmentButton = await screen.findByLabelText(hintAttachmentButtonText);

        fireEvent.press(attachmentButton, mockEvent);
    };

    return waitForBatchedUpdates().then(() => measurePerformance(<ReportActionComposeWrapper />, {scenario, runs}));
});

test('should press add emoji button', async () => {
    const scenario = async () => {
        // Query for the emoji button
        const hintEmojiButtonText = Localize.translateLocal('reportActionCompose.emoji');
        const emojiButton = await screen.findByLabelText(hintEmojiButtonText);

        fireEvent.press(emojiButton);
    };

    return waitForBatchedUpdates().then(() => measurePerformance(<ReportActionComposeWrapper />, {scenario, runs}));
});

test('should press send message button', async () => {
    const scenario = async () => {
        // Query for the send button
        const hintSendButtonText = Localize.translateLocal('common.send');
        const sendButton = await screen.findByLabelText(hintSendButtonText);

        fireEvent.press(sendButton);
    };

    return waitForBatchedUpdates().then(() => measurePerformance(<ReportActionComposeWrapper />, {scenario, runs}));
});

test('render composer with attachement modal interactions', async () => {
    const scenario = async () => {
        const hintAddAttachmentButtonText = Localize.translateLocal('reportActionCompose.addAttachment');
        const hintAssignTaskButtonText = Localize.translateLocal('newTaskPage.assignTask');
        const hintSplitBillButtonText = Localize.translateLocal('iou.splitBill');

        // Query for the attachment modal items
        const addAttachmentButton = await screen.findByLabelText(hintAddAttachmentButtonText);
        fireEvent.press(addAttachmentButton, mockEvent);

        const splitBillButton = await screen.findByLabelText(hintSplitBillButtonText);
        fireEvent.press(splitBillButton, mockEvent);

        const assignTaskButton = await screen.findByLabelText(hintAssignTaskButtonText);
        fireEvent.press(assignTaskButton, mockEvent);
    };

    return waitForBatchedUpdates().then(() => measurePerformance(<ReportActionComposeWrapper />, {scenario, runs}));
});
