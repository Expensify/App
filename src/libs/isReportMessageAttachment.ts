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

    // First node decides: attachment tag → attachment-only; anything else (text, plain link, mention) → attachment+text.
    let result = false;
    let firstNodeSeen = false;

    const parser = new HtmlParser({
        ontext: (text) => {
            if (firstNodeSeen || !text.trim()) {
                return;
            }
            firstNodeSeen = true;
        },
        onopentag: (name, attribs) => {
            if (firstNodeSeen) {
                return;
            }
            firstNodeSeen = true;
            result = ATTACHMENT_TAGS.has(name) && !!attribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE];
        },
    });
    parser.write(message.html);
    parser.end();

    return result;
}

// eslint-disable-next-line import/prefer-default-export
export {isReportMessageAttachment};
