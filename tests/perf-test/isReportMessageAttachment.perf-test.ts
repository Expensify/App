import type {Message} from '@src/types/onyx/ReportAction';

import {measureFunction} from 'reassure';

import {isReportMessageAttachment} from '../../src/libs/isReportMessageAttachment';

const SAMPLE_MESSAGES: Message[] = [
    // .doc attachment-only after OpenReport: text = "filename URL" (the parser-bound case)
    {
        text: 'sample.doc https://www.expensify.com/chat-attachments/123/w_abc.doc',
        html: '<a href="https://www.expensify.com/chat-attachments/123/w_abc.doc" data-expensify-source="https://www.expensify.com/chat-attachments/123/w_abc.doc">sample.doc</a>',
        type: '',
    },
    // image attachment-only (translationKey path)
    {
        text: '[Attachment]',
        html: '<img src="https://www.expensify.com/chat-attachments/123/img.jpg" data-expensify-source="https://www.expensify.com/chat-attachments/123/img.jpg" />',
        type: '',
        translationKey: 'common.attachment',
    },
    {
        text: 'Here is the file\nsample.pdf https://www.expensify.com/chat-attachments/123/s.pdf',
        html: 'Here is the file<br /><br /><a href="https://www.expensify.com/chat-attachments/123/s.pdf" data-expensify-source="https://www.expensify.com/chat-attachments/123/s.pdf">sample.pdf</a>',
        type: '',
    },
    {text: 'Just a normal chat message with some words in it', html: 'Just a normal chat message with some words in it', type: ''},
    {text: 'https://example.com', html: '<a href="https://example.com" data-raw-href="https://example.com" target="_blank" rel="noreferrer noopener">https://example.com</a>', type: ''},
];

// One classification pass over a long chat history (called per message on list renders / LHN).
const LONG_CHAT_HISTORY: Message[] = Array.from({length: 2000}, () => SAMPLE_MESSAGES).flat();

test('[isReportMessageAttachment] classify a 10k-message chat history', async () => {
    await measureFunction(() => {
        for (const message of LONG_CHAT_HISTORY) {
            isReportMessageAttachment(message);
        }
    });
});
