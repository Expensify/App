"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isReportMessageAttachment_1 = require("../../src/libs/isReportMessageAttachment");
describe('isReportMessageAttachment', function () {
    it('returns true if a report action is attachment', function () {
        var message = {
            text: '[Attachment]',
            html: '<img src="https://www.expensify.com/chat-attachments/1260926113061804740/w_66791ca35b3c34c2a0eda4d065d97c9907cadd61.jpg.1024.jpg" data-expensify-source="https://www.expensify.com/chat-attachments/1260926113061804740/w_66791ca35b3c34c2a0eda4d065d97c9907cadd61.jpg" data-name="rn_image_picker_lib_temp_636b71a8-18fd-41a1-9725-6587ffb207a7.jpg" data-expensify-width="4000" data-expensify-height="3000" />',
            type: '',
        };
        expect((0, isReportMessageAttachment_1.isReportMessageAttachment)(message)).toBe(true);
    });
    it('returns false if a report action is not attachment', function () {
        var message = { text: '[Attachment]', html: '<em>[Attachment]</em>', type: '' };
        expect((0, isReportMessageAttachment_1.isReportMessageAttachment)(message)).toBe(false);
        message = { text: '[Attachment]', html: '<a href="https://www.google.com" target="_blank" rel="noreferrer noopener">[Attachment]</a>', type: '' };
        expect((0, isReportMessageAttachment_1.isReportMessageAttachment)(message)).toBe(false);
        message = { text: '[Attachment]', html: '<a href="https://www.google.com/?data-expensify-source=" target="_blank" rel="noreferrer noopener">[Attachment]</a>', type: '' };
        expect((0, isReportMessageAttachment_1.isReportMessageAttachment)(message)).toBe(false);
    });
});
