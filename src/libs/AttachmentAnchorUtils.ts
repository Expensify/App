import CONST from '@src/CONST';

const attachmentAnchorURLRegex = new RegExp(CONST.ATTACHMENT_OR_RECEIPT_LOCAL_URL, 'i');
const ANCHOR_HREF_REGEX = /href="([^"]*)"/i;
// A line break right after the anchor is absorbed: the block already ends the line, so keeping it adds an empty one.
const ANCHOR_TAG_REGEX = /<a\s([^>]*)>([\s\S]*?)<\/a>(?:<br \/>)?/gi;

function getAnchorHref(attributes: string): string | undefined {
    return attributes.match(ANCHOR_HREF_REGEX)?.at(1);
}

// A file card is drawn from the anchor's own label, so an anchor holding a picture or a clip has no name to show
// and renders the media itself.
function holdsMedia(label: string): boolean {
    return /<(?:img|video)\b/i.test(label);
}

const SOURCE_ATTRIBUTE_REGEX = new RegExp(`(?:^|\\s)${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}="([^"]*)"`, 'i');
const ATTACHMENT_ID_ATTRIBUTE_REGEX = new RegExp(`(?:^|\\s)${CONST.ATTACHMENT_ID_ATTRIBUTE}="([^"]*)"`, 'i');

/**
 * A file card downloads with the viewer's auth token. The server strips the source attribute from a link to another
 * host but keeps the attachment ID, so the ID only makes a file of a link on our own attachment host.
 */
function isAttachmentAnchor(href: string | undefined, source: string | undefined, attachmentID: string | undefined): boolean {
    return !!source || (!!attachmentID && attachmentAnchorURLRegex.test(href ?? ''));
}

function isAttachmentAnchorTag(attributes: string): boolean {
    return isAttachmentAnchor(getAnchorHref(attributes), attributes.match(SOURCE_ATTRIBUTE_REGEX)?.at(1), attributes.match(ATTACHMENT_ID_ATTRIBUTE_REGEX)?.at(1));
}

/**
 * An edit round-trips the comment through the server, which returns the file anchor without its attachment
 * attributes. The stored URL still names the action the file was uploaded to, so a matching ID is what is left to
 * recognize it by. A link someone pasted to another message's attachment names a different action and stays a link.
 */
function isOwnAttachmentURL(href: string, reportActionID: string | undefined): boolean {
    return !!reportActionID && attachmentAnchorURLRegex.test(href) && href.match(CONST.REGEX.ATTACHMENT.ATTACHMENT_SOURCE_ID)?.at(1) === reportActionID;
}

function isFileCardAnchor(attributes: string, label: string, reportActionID: string | undefined): boolean {
    return !holdsMedia(label) && (isAttachmentAnchorTag(attributes) || isOwnAttachmentURL(getAnchorHref(attributes) ?? '', reportActionID));
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
        if (!isFileCardAnchor(attributes, label, reportActionID)) {
            return match;
        }
        const restoredID = isAttachmentAnchorTag(attributes) ? '' : ` ${CONST.ATTACHMENT_ID_ATTRIBUTE}="${reportActionID}"`;
        return `<attachment-block><a ${attributes}${restoredID}>${label}</a></attachment-block>`;
    });
}

// The parser only reads an anchor as "[Attachment]" while it carries `data-expensify-source`, which the server drops on edit.
function replaceAttachmentAnchorsWithText(html: string, reportActionID: string | undefined): string {
    if (!html.includes('<a ')) {
        return html;
    }
    return html.replaceAll(ANCHOR_TAG_REGEX, (match: string, attributes: string, label: string) => {
        if (!isFileCardAnchor(attributes, label, reportActionID)) {
            return match;
        }
        return `${CONST.ATTACHMENT_MESSAGE_TEXT}${match.endsWith('<br />') ? '<br />' : ''}`;
    });
}

export {getAnchorHref, isAttachmentAnchor, isAttachmentAnchorTag, isOwnAttachmentURL, replaceAttachmentAnchorsWithText, wrapAttachmentAnchorsInBlocks};
