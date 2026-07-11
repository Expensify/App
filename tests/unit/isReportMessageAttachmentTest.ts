import CONST from '@src/CONST';
import type {Message} from '@src/types/onyx/ReportAction';

import {isReportMessageAttachment} from '../../src/libs/isReportMessageAttachment';

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

    it('returns true for optimistic attachment-only via translationKey', () => {
        const message: Message = {
            text: '[Attachment]',
            html: '<a href="blob:https://dev.new.expensify.com:8082/abc" data-expensify-source="blob:https://dev.new.expensify.com:8082/abc">sample.doc</a>',
            type: '',
            translationKey: CONST.TRANSLATION_KEYS.ATTACHMENT,
        };
        expect(isReportMessageAttachment(message)).toBe(true);
    });

    it('returns true for .doc attachment-only after OpenReport sync (text is "filename URL")', () => {
        const message: Message = {
            text: 'sample.doc https://staging.expensify.com/chat-attachments/4271684646135633435/w_87c70962804917e4c6866d052537133ae0a3060e.doc',
            html: '<a href="https://staging.expensify.com/chat-attachments/4271684646135633435/w_87c70962804917e4c6866d052537133ae0a3060e.doc" data-expensify-source="https://staging.expensify.com/chat-attachments/4271684646135633435/w_87c70962804917e4c6866d052537133ae0a3060e.doc" data-attachment-id="123">sample.doc</a>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(true);
    });

    it('returns true for .pdf attachment-only', () => {
        const message: Message = {
            text: 'report.pdf https://www.expensify.com/chat-attachments/123/report.pdf',
            html: '<a href="https://www.expensify.com/chat-attachments/123/report.pdf" data-expensify-source="https://www.expensify.com/chat-attachments/123/report.pdf">report.pdf</a>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(true);
    });

    it('returns true for video attachment-only', () => {
        const message: Message = {
            text: 'demo.mp4',
            html: '<video src="https://www.expensify.com/chat-attachments/123/demo.mp4" data-expensify-source="https://www.expensify.com/chat-attachments/123/demo.mp4">demo.mp4</video>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(true);
    });

    it('returns false for attachment+text (user text before the attachment)', () => {
        const message: Message = {
            text: 'Check this file\nsample.doc https://www.expensify.com/chat-attachments/123/sample.doc',
            html: 'Check this file<br /><br /><a href="https://www.expensify.com/chat-attachments/123/sample.doc" data-expensify-source="https://www.expensify.com/chat-attachments/123/sample.doc">sample.doc</a>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(false);
    });

    it('returns false for a leading user URL + attachment (regression guard for codex bot P2)', () => {
        const message: Message = {
            text: 'https://example.com check this\nsample.doc https://www.expensify.com/chat-attachments/123/sample.doc',
            html: '<a href="https://example.com" data-raw-href="https://example.com" data-link-variant="auto" target="_blank" rel="noreferrer noopener">https://example.com</a> check this<br /><br /><a href="https://www.expensify.com/chat-attachments/123/sample.doc" data-expensify-source="https://www.expensify.com/chat-attachments/123/sample.doc">sample.doc</a>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(false);
    });

    it('returns false for a plain user link with only data-raw-href (no attachment)', () => {
        const message: Message = {
            text: 'https://example.com',
            html: '<a href="https://example.com" data-raw-href="https://example.com" target="_blank" rel="noreferrer noopener">https://example.com</a>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(false);
    });

    it('returns false for a mention before the attachment', () => {
        const message: Message = {
            text: '@user check this\nsample.doc https://www.expensify.com/chat-attachments/123/sample.doc',
            html: '<mention-user accountID="1">@user</mention-user> check this<br /><br /><a href="https://www.expensify.com/chat-attachments/123/sample.doc" data-expensify-source="https://www.expensify.com/chat-attachments/123/sample.doc">sample.doc</a>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(false);
    });

    it('returns false for an attachment with a caption appended after it (regression guard for codex bot P2)', () => {
        const message: Message = {
            text: 'sample.doc https://www.expensify.com/chat-attachments/123/sample.doc my caption',
            html: '<a href="https://www.expensify.com/chat-attachments/123/sample.doc" data-expensify-source="https://www.expensify.com/chat-attachments/123/sample.doc">sample.doc</a> my caption',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(false);
    });

    it('returns true when the anchor inner text (filename) is the only text', () => {
        const message: Message = {
            text: 'sample.doc https://www.expensify.com/chat-attachments/123/sample.doc',
            html: '<a href="https://www.expensify.com/chat-attachments/123/sample.doc" data-expensify-source="https://www.expensify.com/chat-attachments/123/sample.doc">sample.doc</a>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(true);
    });

    it('returns true for multiple attachments with no surrounding text', () => {
        const message: Message = {
            text: 'a.doc https://www.expensify.com/chat-attachments/1/a.doc\nb.pdf https://www.expensify.com/chat-attachments/2/b.pdf',
            html: '<a href="https://www.expensify.com/chat-attachments/1/a.doc" data-expensify-source="https://www.expensify.com/chat-attachments/1/a.doc">a.doc</a><a href="https://www.expensify.com/chat-attachments/2/b.pdf" data-expensify-source="https://www.expensify.com/chat-attachments/2/b.pdf">b.pdf</a>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(true);
    });

    it('returns true for an attachment whose anchor wraps nested markup', () => {
        const message: Message = {
            text: 'sample.doc https://www.expensify.com/chat-attachments/123/sample.doc',
            html: '<a href="https://www.expensify.com/chat-attachments/123/sample.doc" data-expensify-source="https://www.expensify.com/chat-attachments/123/sample.doc">pre<strong>sample</strong>.doc</a>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(true);
    });

    it('returns false for an attachment with nested markup AND a trailing caption', () => {
        const message: Message = {
            text: 'sample.doc https://www.expensify.com/chat-attachments/123/sample.doc see this',
            html: '<a href="https://www.expensify.com/chat-attachments/123/sample.doc" data-expensify-source="https://www.expensify.com/chat-attachments/123/sample.doc">pre<strong>sample</strong>.doc</a> see this',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(false);
    });

    it('returns false for undefined or empty message', () => {
        expect(isReportMessageAttachment(undefined)).toBe(false);
        expect(isReportMessageAttachment({text: '', html: '', type: ''})).toBe(false);
        expect(isReportMessageAttachment({text: 'x', html: undefined as unknown as string, type: ''})).toBe(false);
    });

    it('falls through when translationKey is set but is not the attachment key', () => {
        const message: Message = {
            text: 'sample.doc https://www.expensify.com/chat-attachments/123/sample.doc',
            html: '<a href="https://www.expensify.com/chat-attachments/123/sample.doc" data-expensify-source="https://www.expensify.com/chat-attachments/123/sample.doc">sample.doc</a>',
            type: '',
            translationKey: 'common.download',
        };
        expect(isReportMessageAttachment(message)).toBe(true);
    });

    it('returns false for image attachment + text', () => {
        const message: Message = {
            text: 'check this image\n[Attachment]',
            html: 'check this image<br /><br /><img src="https://www.expensify.com/chat-attachments/123/img.jpg" data-expensify-source="https://www.expensify.com/chat-attachments/123/img.jpg" />',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(false);
    });

    it('returns false for video attachment + text', () => {
        const message: Message = {
            text: 'watch this\ndemo.mp4 https://www.expensify.com/chat-attachments/123/demo.mp4',
            html: 'watch this<br /><br /><video src="https://www.expensify.com/chat-attachments/123/demo.mp4" data-expensify-source="https://www.expensify.com/chat-attachments/123/demo.mp4">demo.mp4</video>',
            type: '',
        };
        expect(isReportMessageAttachment(message)).toBe(false);
    });
});
