import type * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, screen, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {forceClearInput} from '@libs/ComponentUtils';
import {onSubmitAction} from '@pages/inbox/report/ReportActionCompose/ReportActionCompose';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {renderReportActionCompose} from '../utils/ReportActionComposeUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockForceClearInput = jest.mocked(forceClearInput);

jest.mock('@libs/ComponentUtils', () => ({
    forceClearInput: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
    })),
);

jest.mock('@react-navigation/native', () => ({
    ...((): typeof NativeNavigation => {
        return jest.requireActual('@react-navigation/native');
    })(),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
    useIsFocused: jest.fn(() => true),
    useRoute: jest.fn(() => ({key: '', name: '', params: {reportID: '1'}})),
}));

TestHelper.setupGlobalFetchMock();

// Helper function to simulate text selection
const simulateSelection = (composer: ReturnType<typeof screen.getByTestId>, start: number, end: number) => {
    fireEvent(composer, 'selectionChange', {
        nativeEvent: {selection: {start, end}},
    });
};

describe('ReportActionCompose Integration Tests', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    describe('Paste Behavior with Selection updateComment logic', () => {
        it('should format pasted URL as Markdown link when text is selected', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Selected text');
            simulateSelection(composer, 0, 8);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Selected](https://example.com) text');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should insert raw URL when no text is selected', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, '');
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('https://example.com');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should insert raw text when non-URL text is pasted', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'what you do');
            simulateSelection(composer, 0, 4);
            const prevText = 'what you do';
            const pastedText = 'Hello world';
            const merged = prevText.slice(0, 0) + pastedText + prevText.slice(4);
            fireEvent.changeText(composer, merged);

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('Hello world you do');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should format pasted URL as Markdown link when replacing entire selected text', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Selected text');
            simulateSelection(composer, 0, 13);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Selected text](https://example.com)');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should insert raw URL with emoji when pasted with selection', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            const prevText = 'Emoji text 😀';
            fireEvent.changeText(composer, prevText);
            simulateSelection(composer, 0, 5);
            const pastedText = 'https://example.com 😀';
            const merged = prevText.slice(0, 0) + pastedText + prevText.slice(5);
            fireEvent.changeText(composer, merged);

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe(merged);
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should format pasted URL as Markdown link when selected text contains square brackets', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Select]ed[ text');
            simulateSelection(composer, 0, 15);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Select&#93;ed&#91; text](https://example.com)');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should format pasted URL as Markdown link when selected text contains parentheses', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Selected () text');
            simulateSelection(composer, 0, 16);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Selected () text](https://example.com)');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should format pasted URL as Markdown link when selected text contains curly braces', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Selec}ted {text');
            simulateSelection(composer, 0, 15);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Selec}ted {text](https://example.com)');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('Message validation', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should send when length is within the limit', async () => {
            renderReportActionCompose();
            const composer = screen.getByTestId('composer');

            // Given a message that is within the length limit
            const validMessage = 'x'.repeat(CONST.MAX_COMMENT_LENGTH);
            fireEvent.changeText(composer, validMessage);

            // When the message is submitted
            act(onSubmitAction);

            // scheduleOnUI mock uses setTimeout(() => ..., 0)
            act(() => {
                jest.advanceTimersByTime(1);
            });

            // Then the message should be sent
            expect(mockForceClearInput).toHaveBeenCalledTimes(1);
        });

        it('should not send when length exceeds the limit', async () => {
            renderReportActionCompose();
            const composer = screen.getByTestId('composer');

            // Given a message that is over the length limit
            const invalidMessage = 'x'.repeat(CONST.MAX_COMMENT_LENGTH + 1);
            fireEvent.changeText(composer, invalidMessage);

            // When the message is submitted
            act(onSubmitAction);

            // Then the message should NOT be sent
            expect(mockForceClearInput).toHaveBeenCalledTimes(0);

            // And the error should be displayed
            expect(screen.getByText('composer.commentExceededMaxLength')).toBeOnTheScreen();
        });

        it('should not send when task title length exceeds the limit', async () => {
            renderReportActionCompose();
            const composer = screen.getByTestId('composer');

            // Given a task title that exceeds the title character limit
            const taskTitle = 'x'.repeat(CONST.TITLE_CHARACTER_LIMIT + 1);
            fireEvent.changeText(composer, `[] ${taskTitle}`);

            // When the message is submitted
            act(onSubmitAction);

            // Then the message should NOT be sent
            expect(mockForceClearInput).toHaveBeenCalledTimes(0);

            // And the task-title-specific error should be displayed
            expect(screen.getByText('composer.taskTitleExceededMaxLength')).toBeOnTheScreen();
        });
    });
});
