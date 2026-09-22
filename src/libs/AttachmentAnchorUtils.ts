import CONST from '@src/CONST';

const attachmentAnchorURLRegex = new RegExp(CONST.ATTACHMENT_OR_RECEIPT_LOCAL_URL, 'i');
const ANCHOR_HREF_REGEX = /href="([^"]*)"/i;
// A line break right after the anchor is absorbed: the block already ends the line, so keeping it adds an empty one.
const ANCHOR_TAG_REGEX = /<a\s([^>]*)>[\s\S]*?<\/a>(<br \/>)?/gi;

function getAnchorHref(attributes: string): string | undefined {
    return attributes.match(ANCHOR_HREF_REGEX)?.at(1);
}

// The server strips the attachment attributes from an edited anchor, so the URL alone has to identify a file card.
function isAttachmentAnchor(href: string, hasSourceAttribute: boolean, hasIDAttribute: boolean): boolean {
    return hasSourceAttribute || hasIDAttribute || attachmentAnchorURLRegex.test(href);
}

function isAttachmentAnchorAttributes(attributes: string): boolean {
    return isAttachmentAnchor(getAnchorHref(attributes) ?? '', attributes.includes(` ${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}="`), attributes.includes(` ${CONST.ATTACHMENT_ID_ATTRIBUTE}="`));
}

/**
 * A file anchor renders as a card, and native Text cannot lay a card out inside an inline run: it collapses, overlaps
 * the line above or hides the "(edited)" label after it. Each file anchor gets its own block instead, which is how an
 * attachment-only message is laid out.
 */
function wrapAttachmentAnchorsInBlocks(html: string): string {
    if (!html.includes('<a ')) {
        return html;
    }
    return html.replaceAll(ANCHOR_TAG_REGEX, (match: string, attributes: string, lineBreak?: string) => {
        if (!isAttachmentAnchorAttributes(attributes)) {
            return match;
        }
        const anchor = lineBreak ? match.slice(0, -lineBreak.length) : match;
        return `<attachment-block>${anchor}</attachment-block>`;
    });
}

// The parser only turns an anchor into "[Attachment]" while it still carries `data-expensify-source`, which the server drops on edit.
function replaceAttachmentAnchorsWithText(html: string): string {
    if (!html.includes('<a ')) {
        return html;
    }
    return html.replaceAll(ANCHOR_TAG_REGEX, (match: string, attributes: string, lineBreak?: string) =>
        isAttachmentAnchorAttributes(attributes) ? `${CONST.ATTACHMENT_MESSAGE_TEXT}${lineBreak ?? ''}` : match,
    );
}

export {getAnchorHref, isAttachmentAnchor, replaceAttachmentAnchorsWithText, wrapAttachmentAnchorsInBlocks};
