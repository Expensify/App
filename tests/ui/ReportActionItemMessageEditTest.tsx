import type * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {editReportComment} from '@libs/actions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {renderReportActionItemMessageEdit} from '../utils/ReportActionComposeUtils';
import * as TestHelper from '../utils/TestHelper';

const mockEditReportComment = jest.mocked(editReportComment);

jest.mock('@libs/actions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        editReportComment: jest.fn(),
    };
});

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

    describe('Message validation', () => {
        it('should edit when length is within the limit', async () => {
            renderReportActionItemMessageEdit();
            const composer = screen.getByTestId('composer');
            const saveChangesButton = screen.getByLabelText('common.saveChanges');

            // Given a message that is within the length limit
            const validMessage = 'x'.repeat(CONST.MAX_COMMENT_LENGTH);
            fireEvent.changeText(composer, validMessage);

            // When the message is saved
            fireEvent.press(saveChangesButton);

            // Then the message should be edited
            expect(mockEditReportComment).toHaveBeenCalledTimes(1);
        });

        it('should not edit when length exceeds the limit', async () => {
            renderReportActionItemMessageEdit();
            const composer = screen.getByTestId('composer');
            const saveChangesButton = screen.getByLabelText('common.saveChanges');

            // Given a message that is over the length limit
            const invalidMessage = 'x'.repeat(CONST.MAX_COMMENT_LENGTH + 1);
            fireEvent.changeText(composer, invalidMessage);

            // When the message is saved
            fireEvent.press(saveChangesButton);

            // Then the message should NOT be edited
            expect(mockEditReportComment).toHaveBeenCalledTimes(0);

            // And the error should be displayed
            expect(screen.getByText('composer.commentExceededMaxLength')).toBeOnTheScreen();
        });
    });
});
