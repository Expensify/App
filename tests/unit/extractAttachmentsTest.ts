import extractAttachments from '@components/Attachments/AttachmentCarousel/extractAttachments';

import CONST from '@src/CONST';

const ACCOUNT_ID = 1;
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
});
