import CONST from '@src/CONST';

const attachmentAnchorURLRegex = new RegExp(CONST.ATTACHMENT_OR_RECEIPT_LOCAL_URL, 'i');
const ANCHOR_HREF_REGEX = /href="([^"]*)"/i;
// A line break right after the anchor is absorbed: the block already ends the line, so keeping it adds an empty one.
const ANCHOR_TAG_REGEX = /<a\s([^>]*)>([\s\S]*?)<\/a>(?:<br \/>)?/gi;

function getAnchorHref(attributes: string): string | undefined {
    return attributes.match(ANCHOR_HREF_REGEX)?.at(1);
}

function hasAttachmentAttributes(attributes: string): boolean {
    return attributes.includes(` ${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}="`) || attributes.includes(` ${CONST.ATTACHMENT_ID_ATTRIBUTE}="`);
}

/**
 * An edit round-trips the comment through the server, which returns the file anchor without its attachment
 * attributes. The stored URL still names the action the file was uploaded to, so a matching ID is what is left to
 * recognize it by. A link someone pasted to another message's attachment names a different action and stays a link.
 */
function isOwnAttachmentURL(href: string, reportActionID: string | undefined): boolean {
    return !!reportActionID && attachmentAnchorURLRegex.test(href) && href.match(CONST.REGEX.ATTACHMENT.ATTACHMENT_SOURCE_ID)?.at(1) === reportActionID;
}

/**
 * A file anchor renders as a card, and native Text cannot lay a card out inside an inline run: it collapses, overlaps
 * the line above or hides the "(edited)" label after it. Each file anchor gets its own block instead, which is how an
 * attachment-only message is laid out. One recognized by its URL also gets the attachment ID, so the renderer reaches
 * the same answer from the markup rather than repeating the check.
 */
function wrapAttachmentAnchorsInBlocks(html: string, reportActionID: string | undefined): string {
    if (!html.includes('<a ')) {
        return html;
    }
    return html.replaceAll(ANCHOR_TAG_REGEX, (match: string, attributes: string, label: string) => {
        if (hasAttachmentAttributes(attributes)) {
            return `<attachment-block><a ${attributes}>${label}</a></attachment-block>`;
        }
        if (!isOwnAttachmentURL(getAnchorHref(attributes) ?? '', reportActionID)) {
            return match;
        }
        return `<attachment-block><a ${attributes} ${CONST.ATTACHMENT_ID_ATTRIBUTE}="${reportActionID}">${label}</a></attachment-block>`;
    });
}

export {getAnchorHref, isOwnAttachmentURL, wrapAttachmentAnchorsInBlocks};
