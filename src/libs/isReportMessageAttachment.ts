import {Parser as HtmlParser} from 'htmlparser2';
import CONST from '@src/CONST';
import type {Message} from '@src/types/onyx/ReportAction';

const ATTACHMENT_TAGS = new Set(['a', 'img', 'video']);
// Leading space + `="` (not a bare substring) so a URL query param like `?data-expensify-source=` isn't a false positive.
const ATTACHMENT_SOURCE_TOKEN = ` ${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}="`;

// Keyed by Onyx message identity: re-renders pass the same immutable object, so parse at most once per message.
const resultCache = new WeakMap<Message, boolean>();

function computeIsReportMessageAttachment(html: string, text: string, translationKey: string | undefined): boolean {
    // Optimistic attachment-only messages carry this translationKey; the server drops it after sync.
    if (translationKey === CONST.TRANSLATION_KEYS.ATTACHMENT) {
        return true;
    }

    // Fast path: no source attribute → not an attachment (avoids the parser for most messages).
    if (!html.includes(ATTACHMENT_SOURCE_TOKEN)) {
        return false;
    }

    // image/video attachment-only keep text "[Attachment]"; only .doc/.pdf (text = "filename URL") need the parser.
    if (text === CONST.ATTACHMENT_MESSAGE_TEXT) {
        return true;
    }

    let hasAttachment = false;
    let hasOtherContent = false;
    // Depth >0 = inside the attachment's subtree; its inner nodes (filename/markup) aren't user content.
    let depth = 0;

    const parser = new HtmlParser({
        ontext: (nodeText) => {
            if (depth > 0 || !nodeText.trim()) {
                return;
            }
            hasOtherContent = true;
        },
        onopentag: (name, attribs) => {
            if (depth > 0) {
                depth += 1;
                return;
            }
            if (name === 'br') {
                return;
            }
            if (ATTACHMENT_TAGS.has(name) && !!attribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE]) {
                hasAttachment = true;
                if (name === 'a' || name === 'video') {
                    depth = 1;
                }
                return;
            }
            hasOtherContent = true;
        },
        onclosetag: () => {
            if (depth <= 0) {
                return;
            }
            depth -= 1;
        },
    });
    parser.write(html);
    parser.end();

    return hasAttachment && !hasOtherContent;
}

/**
 * Returns true for attachment-only messages (no user-typed text), false for attachment+text and non-attachment messages.
 */
function isReportMessageAttachment(message: Message | undefined): boolean {
    if (!message?.text || !message.html) {
        return false;
    }

    const cached = resultCache.get(message);
    if (cached !== undefined) {
        return cached;
    }

    const result = computeIsReportMessageAttachment(message.html, message.text, message.translationKey);
    resultCache.set(message, result);
    return result;
}

// eslint-disable-next-line import/prefer-default-export
export {isReportMessageAttachment};
