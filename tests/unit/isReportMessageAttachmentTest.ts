import CONST from '@src/CONST';
import type {Message} from '@src/types/onyx/ReportAction';
import {isAttachmentOnlyMessage, isReportMessageAttachment} from '../../src/libs/isReportMessageAttachment';

describe('isReportMessageAttachment', () => {
    it('returns true if a report action is attachment', () => {
        const message: Message = {
            text: '[Attachment]',
            html: '<img src="https://www.expensify.com/chat-attachments/1260926113061804740/w_66791ca35b3c34c2a0eda4d065d97c9907cadd61.jpg.1024.jpg" data-expensify-source="https://www.expensify.com/chat-attachments/1260926113061804740/w_66791ca35b3c34c2a0eda4d065d97c9907cadd61.jpg" data-name="rn_image_picker_lib_temp_636b71a8-18fd-41a1-9725-6587ffb207a7.jpg" data-expensify-width="4000" data-expensify-height="3000" />',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(true);
    });

    it('returns false if a report action is not attachment', () => {
        let message: Message = {text: '[Attachment]', html: '<em>[Attachment]</em>', type: ''};
        expect(isReportMessageAttachment(message)).toBe(false);

        message = {text: '[Attachment]', html: '<a href="https://www.google.com" target="_blank" rel="noreferrer noopener">[Attachment]</a>', type: ''};
        expect(isReportMessageAttachment(message)).toBe(false);

        message = {text: '[Attachment]', html: '<a href="https://www.google.com/?data-expensify-source=" target="_blank" rel="noreferrer noopener">[Attachment]</a>', type: ''};
        expect(isReportMessageAttachment(message)).toBe(false);
    });
});

describe('isAttachmentOnlyMessage', () => {
    it('returns true for a translated attachment-only message', () => {
        const message: Message = {
            text: CONST.ATTACHMENT_MESSAGE_TEXT,
            html: '<img src="https://www.expensify.com/chat-attachments/test.jpg" data-expensify-source="https://www.expensify.com/chat-attachments/test.jpg" />',
            translationKey: CONST.TRANSLATION_KEYS.ATTACHMENT,
            type: '',
        };

        expect(isAttachmentOnlyMessage(message)).toBe(true);
    });

    it('returns true for an attachment-only file message', () => {
        const message: Message = {
            text: 'file-sample_100kB.doc https://www.expensify.com/chat-attachments/test.doc',
            html: '<a href="https://www.expensify.com/chat-attachments/test.doc" data-expensify-source="https://www.expensify.com/chat-attachments/test.doc">file-sample_100kB.doc</a>',
            type: '',
        };

        expect(isAttachmentOnlyMessage(message)).toBe(true);
    });

    it('returns false for an attachment with text', () => {
        const message: Message = {
            text: 'AAAAAAAAA\n\nfile-sample_100kB.doc https://www.expensify.com/chat-attachments/test.doc',
            html: 'AAAAAAAAA<br /><br /><a href="https://www.expensify.com/chat-attachments/test.doc" data-expensify-source="https://www.expensify.com/chat-attachments/test.doc">file-sample_100kB.doc</a>',
            type: '',
        };

        expect(isAttachmentOnlyMessage(message)).toBe(false);
    });

    it('returns false for a non-attachment message', () => {
        const message: Message = {
            text: 'Hello world',
            html: 'Hello world',
            type: '',
        };

        expect(isAttachmentOnlyMessage(message)).toBe(false);
    });
});
