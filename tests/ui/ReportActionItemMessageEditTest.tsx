import type * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {editReportComment} from '@libs/actions/Report';
import ReportActionItemMessageEdit from '@pages/inbox/report/ReportActionItemMessageEdit';
import type {ReportActionItemMessageEditProps} from '@pages/inbox/report/ReportActionItemMessageEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
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

const defaultReport = LHNTestUtils.getFakeReport();
const defaultProps: ReportActionItemMessageEditProps = {
    action: LHNTestUtils.getFakeReportAction(),
    draftMessage: '',
    reportID: defaultReport.reportID,
    originalReportID: defaultReport.reportID,
    index: 0,
    isGroupPolicyReport: false,
};

const renderReportActionItemMessageEdit = (props?: Partial<ReportActionItemMessageEditProps>) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ReportActionItemMessageEdit
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultProps}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </ComposeProviders>,
    );
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
