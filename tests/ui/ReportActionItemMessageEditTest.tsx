import type * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {editReportComment} from '@libs/actions/Report';
import * as ReportActionContextMenu from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import ReportActionItemMessageEdit from '@pages/inbox/report/ReportActionItemMessageEdit';
import type {ReportActionItemMessageEditProps} from '@pages/inbox/report/ReportActionItemMessageEdit';
import {draftMessageVideoAttributeCache} from '@pages/inbox/report/useDraftMessageVideoAttributeCache';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Message} from '@src/types/onyx/ReportAction';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';

const mockEditReportComment = jest.mocked(editReportComment);
const mockShowDeleteModal = jest.mocked(ReportActionContextMenu.showDeleteModal);

jest.mock('@libs/actions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        editReportComment: jest.fn(),
    };
});

jest.mock('@pages/inbox/report/ContextMenu/ReportActionContextMenu', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@pages/inbox/report/ContextMenu/ReportActionContextMenu');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        showDeleteModal: jest.fn(),
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
    })),
);

jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

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
        draftMessageVideoAttributeCache.clear();
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

        it('should open delete modal when saving an empty message', async () => {
            renderReportActionItemMessageEdit();
            const composer = screen.getByTestId('composer');
            const saveChangesButton = screen.getByLabelText('common.saveChanges');

            // Given a message that becomes empty after trimming
            fireEvent.changeText(composer, '   ');

            // When the message is saved
            fireEvent.press(saveChangesButton);

            // Then the message should NOT be edited
            expect(mockEditReportComment).toHaveBeenCalledTimes(0);

            // And the delete confirmation flow should be opened
            expect(mockShowDeleteModal).toHaveBeenCalledTimes(1);
        });

        it('should cache and forward video attributes when saving an edited message', async () => {
            const videoSource = 'https://example.com/video.mp4';
            const videoHtml = `<video src="${videoSource}" data-expensify-source="${videoSource}" data-name="video.mp4" data-expensify-height="100" data-expensify-width="200">video.mp4</video>`;

            const messages = defaultProps.action.message as Message[];

            renderReportActionItemMessageEdit({
                action: {
                    ...defaultProps.action,
                    message: [
                        {
                            ...messages.at(0),
                            type: 'COMMENT',
                            html: videoHtml,
                            text: '[Attachment]',
                        },
                    ],
                },
            });

            const composer = screen.getByTestId('composer');
            const saveChangesButton = screen.getByLabelText('common.saveChanges');

            // Given a valid edited message
            fireEvent.changeText(composer, 'Edited message');

            // When the message is saved
            fireEvent.press(saveChangesButton);

            expect(mockEditReportComment).toHaveBeenCalledTimes(1);

            const editReportCommentArgs = mockEditReportComment.mock.calls.at(0);
            const videoAttributeCache = editReportCommentArgs?.[7];

            expect(videoAttributeCache).toEqual(expect.any(Object));
            expect(videoAttributeCache?.[videoSource]).toEqual(expect.any(String));
            expect(videoAttributeCache?.[videoSource]).toContain('data-name');
            expect(videoAttributeCache?.[videoSource]).toContain('data-expensify-height');
            expect(videoAttributeCache?.[videoSource]).toContain('data-expensify-width');
        });
    });
});
