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

    // Attachment-only = one or more attachment tags and nothing else; any text/element outside them → attachment+text.
    let attachmentCount = 0;
    let hasOtherContent = false;
    // Holds the tag name of the open <a>/<video> attachment so its inner filename text isn't counted as user content.
    let openAttachmentTagName: string | null = null;

    const parser = new HtmlParser({
        ontext: (text) => {
            if (openAttachmentTagName || !text.trim()) {
                return;
            }
            hasOtherContent = true;
        },
        onopentag: (name, attribs) => {
            if (openAttachmentTagName || name === 'br') {
                return;
            }
            if (ATTACHMENT_TAGS.has(name) && !!attribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE]) {
                attachmentCount += 1;
                if (name === 'a' || name === 'video') {
                    openAttachmentTagName = name;
                }
                return;
            }
            hasOtherContent = true;
        },
        onclosetag: (name) => {
            if (name !== openAttachmentTagName) {
                return;
            }
            openAttachmentTagName = null;
        },
    });
    parser.write(message.html);
    parser.end();

    return attachmentCount > 0 && !hasOtherContent;
}

// eslint-disable-next-line import/prefer-default-export
export {isReportMessageAttachment};
