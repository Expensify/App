import {renderHook} from '@testing-library/react-native';
import Parser from '@libs/Parser';
import {getReportActionHtml} from '@libs/ReportActionsUtils';
import useDraftMessageVideoAttributeCache, {draftMessageVideoAttributeCache} from '@pages/inbox/report/useDraftMessageVideoAttributeCache';

jest.mock('@libs/ReportActionsUtils', () => ({
    getReportActionHtml: jest.fn(),
    isDeletedAction: jest.fn(() => false),
}));

const mockGetReportActionHtml = jest.mocked(getReportActionHtml);

describe('useDraftMessageVideoAttributeCache', () => {
    let htmlToMarkdownSpy: jest.SpiedFunction<typeof Parser.htmlToMarkdown>;

    beforeEach(() => {
        htmlToMarkdownSpy = jest.spyOn(Parser, 'htmlToMarkdown');
    });

    afterEach(() => {
        draftMessageVideoAttributeCache.clear();
        jest.clearAllMocks();
    });

    it('should cache video attributes from the original message html when editing', () => {
        const reportAction = {reportActionID: '1'} as never;
        mockGetReportActionHtml.mockReturnValue('<video src="https://example.com/video.mp4" data-name="v.mp4">v.mp4</video>');

        htmlToMarkdownSpy.mockImplementation((_html, extras) => {
            extras?.cacheVideoAttributes?.('https://example.com/video.mp4', ' data-name="v.mp4"');
            return 'original markdown';
        });

        const updateDraftMessage = jest.fn();
        const isEditInProgressRef = {current: false};

        renderHook(() =>
            useDraftMessageVideoAttributeCache({
                draftMessage: 'changed',
                isEditing: true,
                editingReportAction: reportAction,
                updateDraftMessage,
                isEditInProgressRef,
            }),
        );

        expect(draftMessageVideoAttributeCache.get('https://example.com/video.mp4')).toBe(' data-name="v.mp4"');
    });

    it('should not call updateDraftMessage when edit is in progress', () => {
        const reportAction = {reportActionID: '1'} as never;
        mockGetReportActionHtml.mockReturnValue('<video src="https://example.com/video.mp4" data-name="v.mp4">v.mp4</video>');
        htmlToMarkdownSpy.mockImplementation((_html, extras) => {
            extras?.cacheVideoAttributes?.('https://example.com/video.mp4', ' data-name="v.mp4"');
            return 'original markdown';
        });

        const updateDraftMessage = jest.fn();
        const isEditInProgressRef = {current: true};

        const {rerender} = renderHook(
            ({draftMessage}) =>
                useDraftMessageVideoAttributeCache({
                    draftMessage,
                    isEditing: true,
                    editingReportAction: reportAction,
                    updateDraftMessage,
                    isEditInProgressRef,
                }),
            {initialProps: {draftMessage: 'changed'}},
        );

        rerender({draftMessage: 'changed again'});

        expect(updateDraftMessage).toHaveBeenCalledTimes(0);
    });
});
