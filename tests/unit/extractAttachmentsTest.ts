import extractAttachments from '@components/Attachments/AttachmentCarousel/extractAttachments';

import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

const ACCOUNT_ID = 1;
const REPORT_ID = '100';
const REPORT_ACTION_ID = '200';
const VIDEO_SOURCE = 'https://www.expensify.com/chat-attachments/123/w_abc123';

function extractNoteAttachments(note: string) {
    return extractAttachments(CONST.ATTACHMENT_TYPE.NOTE, {
        privateNotes: {[ACCOUNT_ID]: {note}},
        accountID: ACCOUNT_ID,
        report: undefined,
        isReportArchived: false,
    });
}

describe('extractAttachments', () => {
    it('uses data-name as the video file name when it is present', () => {
        // Given a video tag with a data-name attribute and a different inner text
        const note = `<video data-expensify-source="${VIDEO_SOURCE}" data-name="original.mp4">other.mp4</video>`;

        // When the attachments are extracted
        const attachments = extractNoteAttachments(note);

        // Then the stored data-name is preferred
        expect(attachments.at(0)?.file?.name).toBe('original.mp4');
    });

    it('uses the inner text as the video file name when data-name is missing', () => {
        // Given a server-rendered video tag that carries the original file name only as its inner text
        const note = `<video data-expensify-source="${VIDEO_SOURCE}">clip.mp4</video>`;

        // When the attachments are extracted
        const attachments = extractNoteAttachments(note);

        // Then the original file name is used instead of the storage key from the URL
        expect(attachments.at(0)?.file?.name).toBe('clip.mp4');
    });

    it('falls back to the URL file name when data-name and inner text are missing', () => {
        // Given a video tag with neither data-name nor inner text
        const note = `<video data-expensify-source="${VIDEO_SOURCE}"></video>`;

        // When the attachments are extracted
        const attachments = extractNoteAttachments(note);

        // Then the last part of the source URL is used, since there is no other name to use
        expect(attachments.at(0)?.file?.name).toBe('w_abc123');
    });

    it('does not use text that follows a video as its file name', () => {
        // Given an empty video tag followed by regular comment text
        const note = `<video data-expensify-source="${VIDEO_SOURCE}"></video>Some comment`;

        // When the attachments are extracted
        const attachments = extractNoteAttachments(note);

        // Then the text outside the video tag is ignored
        expect(attachments.at(0)?.file?.name).toBe('w_abc123');
    });

    it('uses the raw URL file name for an image in a private note whose source has malformed percent-encoding', () => {
        // Given a private note with an image whose URL ends in an invalid percent-escape
        const note = '<img src="https://example.com/images/100%.png" />';

        // When the attachments are extracted to open the carousel
        const attachments = extractNoteAttachments(note);

        // Then the raw file name is used instead of the extraction throwing
        expect(attachments.at(0)?.file?.name).toBe('100%.png');
    });

    it('uses the raw URL file name for an image in a chat message whose source has malformed percent-encoding', () => {
        // Given a chat message from another participant with an image whose URL ends in a truncated multi-byte escape,
        // which the server stores as is
        const report: Report = {reportID: REPORT_ID};
        const reportAction = {
            reportActionID: REPORT_ACTION_ID,
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            created: '2026-11-25 20:25:00.000',
            message: [{type: CONST.REPORT.MESSAGE.TYPE.COMMENT, html: '<img src="https://example.com/images/price%E2%82.png" alt="x" />', text: '[Attachment]'}],
        } as ReportAction;

        // When the attachments are extracted to open the carousel for that chat
        const attachments = extractAttachments(CONST.ATTACHMENT_TYPE.REPORT, {
            reportActions: {[REPORT_ACTION_ID]: reportAction},
            report,
            isReportArchived: false,
            visibleReportActionsData: {[REPORT_ID]: {[REPORT_ACTION_ID]: true}},
        });

        // Then the message's image is listed with the raw file name instead of the extraction throwing
        expect(attachments).toHaveLength(1);
        expect(attachments.at(0)?.reportActionID).toBe(REPORT_ACTION_ID);
        expect(attachments.at(0)?.file?.name).toBe('price%E2%82.png');
    });
});
