import CONST from '@src/CONST';
import type {Message} from '@src/types/onyx/ReportAction';
import {isReportMessageAttachment} from '../../src/libs/isReportMessageAttachment';

describe('isReportMessageAttachment', () => {
    it('returns true if a report action is an image attachment', () => {
        const message: Message = {
            text: '[Attachment]',
            html: '<img src="https://www.expensify.com/chat-attachments/1260926113061804740/w_66791ca35b3c34c2a0eda4d065d97c9907cadd61.jpg.1024.jpg" data-expensify-source="https://www.expensify.com/chat-attachments/1260926113061804740/w_66791ca35b3c34c2a0eda4d065d97c9907cadd61.jpg" data-name="rn_image_picker_lib_temp_636b71a8-18fd-41a1-9725-6587ffb207a7.jpg" data-expensify-width="4000" data-expensify-height="3000" />',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(true);
    });

    it('returns true for document attachment-only (.docx) where text is filename + URL', () => {
        const message: Message = {
            text: 'Sample.docx https://staging.expensify.com/chat-attachments/8260136212361587477/w_5586f35116d3e3cbb98b95a51bfbac3bb921d804.docx',
            html: '<a href="https://staging.expensify.com/chat-attachments/8260136212361587477/w_5586f35116d3e3cbb98b95a51bfbac3bb921d804.docx" data-expensify-source="https://staging.expensify.com/chat-attachments/8260136212361587477/w_5586f35116d3e3cbb98b95a51bfbac3bb921d804.docx" data-attachment-id="9180105352410595168">Sample.docx</a>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(true);
    });

    it('returns true for document attachment-only (.docx) where text is just the filename', () => {
        const message: Message = {
            text: 'test-document.docx',
            html: '<a href="https://www.expensify.com/chat-attachments/123/test-document.docx" data-expensify-source="https://www.expensify.com/chat-attachments/123/test-document.docx" data-attachment-id="456">test-document.docx</a>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(true);
    });

    it('returns true for PDF attachment-only where text is filename + URL', () => {
        const message: Message = {
            text: 'report.pdf https://www.expensify.com/chat-attachments/123/report.pdf',
            html: '<a href="https://www.expensify.com/chat-attachments/123/report.pdf" data-expensify-source="https://www.expensify.com/chat-attachments/123/report.pdf" data-attachment-id="789">report.pdf</a>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(true);
    });

    it('returns true for optimistic attachment-only with translationKey', () => {
        const message: Message = {
            text: 'test-document.docx',
            html: '<a href="file:///tmp/test.docx" data-expensify-source="file:///tmp/test.docx" data-attachment-id="123">test-document.docx</a>',
            type: '',
            translationKey: CONST.TRANSLATION_KEYS.ATTACHMENT,
        };
        expect(isReportMessageAttachment(message)).toBe(true);
    });

    it('returns false for attachment+text messages', () => {
        const message: Message = {
            text: 'Here is the file\ntest-document.docx https://www.expensify.com/chat-attachments/123/test-document.docx',
            html: 'Here is the file<br /><a href="https://www.expensify.com/chat-attachments/123/test-document.docx" data-expensify-source="https://www.expensify.com/chat-attachments/123/test-document.docx" data-attachment-id="456">test-document.docx</a>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(false);
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
