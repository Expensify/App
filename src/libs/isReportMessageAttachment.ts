import {Parser as HtmlParser} from 'htmlparser2';
import CONST from '@src/CONST';
import type {Message} from '@src/types/onyx/ReportAction';

const ATTACHMENT_TAGS = new Set(['a', 'img', 'video']);

/**
 * Returns true for attachment-only messages (no user-typed text), false for attachment+text and non-attachment messages.
 */
function isReportMessageAttachment(message: Message | undefined): boolean {
    if (!message?.text || !message.html) {
        return false;
    }

    // Optimistic attachment-only messages carry this translationKey; the server drops it after sync.
    if (message.translationKey === CONST.TRANSLATION_KEYS.ATTACHMENT) {
        return true;
    }

    // Attachment-only = exactly one attachment tag and nothing else; any text/element outside it → attachment+text.
    let attachmentCount = 0;
    let hasOtherContent = false;
    // Skip the filename text inside an open <a>/<video> so it isn't counted as user content.
    let openAttachmentTag: string | null = null;

    const parser = new HtmlParser({
        ontext: (text) => {
            if (openAttachmentTag || !text.trim()) {
                return;
            }
            hasOtherContent = true;
        },
        onopentag: (name, attribs) => {
            if (openAttachmentTag || name === 'br') {
                return;
            }
            if (ATTACHMENT_TAGS.has(name) && !!attribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE]) {
                attachmentCount += 1;
                if (name === 'a' || name === 'video') {
                    openAttachmentTag = name;
                }
                return;
            }
            hasOtherContent = true;
        },
        onclosetag: (name) => {
            if (name !== openAttachmentTag) {
                return;
            }
            openAttachmentTag = null;
        },
    });
    parser.write(message.html);
    parser.end();

    return attachmentCount > 0 && !hasOtherContent;
}

// eslint-disable-next-line import/prefer-default-export
export {isReportMessageAttachment};
