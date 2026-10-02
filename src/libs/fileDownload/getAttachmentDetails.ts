import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';

import CONST from '@src/CONST';

import type {GetAttachmentDetails} from './types';

/**
 * An edit re-serializes the anchor without `data-expensify-source`, so the attachment is recognized by its own href
 * instead. The auth token gets appended to whatever is returned, so only Expensify-hosted URLs qualify.
 */
const ANCHOR_HREF_AND_LABEL_REGEX = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;

function findAttachmentAnchor(html: string): {href: string; label: string} | undefined {
    const attachmentURLRegex = new RegExp(CONST.ATTACHMENT_OR_RECEIPT_LOCAL_URL, 'i');
    for (const [, href, label] of html.matchAll(ANCHOR_HREF_AND_LABEL_REGEX)) {
        if (attachmentURLRegex.test(href)) {
            return {href, label};
        }
    }
    return undefined;
}

/**
 * Extract the thumbnail URL, source URL and the original filename from the HTML.
 */
const getAttachmentDetails: GetAttachmentDetails = (html) => {
    // Files can be rendered either as anchor tag or as an image so based on that we have to form regex.
    const IS_IMAGE_TAG = /<img([\w\W]+?)\/>/i.test(html);
    const PREVIEW_SOURCE_REGEX = new RegExp(`${CONST.ATTACHMENT_PREVIEW_ATTRIBUTE}*=*"(.+?)"`, 'i');
    const SOURCE_REGEX = new RegExp(`${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}*=*"(.+?)"`, 'i');
    const ORIGINAL_FILENAME_REGEX = IS_IMAGE_TAG ? new RegExp(`${CONST.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE}*=*"(.+?)"`, 'i') : new RegExp('<(?:a|video)[^>]*>([^<]+)</(?:a|video)>', 'i');
    if (!html) {
        return {
            previewSourceURL: null,
            sourceURL: null,
            originalFileName: null,
        };
    }

    // Files created/uploaded/hosted by App should resolve from API ROOT. Other URLs aren't modified
    const attachmentAnchor = IS_IMAGE_TAG ? undefined : findAttachmentAnchor(html);
    const sourceURL = tryResolveUrlFromApiRoot(html.match(SOURCE_REGEX)?.[1] ?? attachmentAnchor?.href ?? '');
    const imageURL = IS_IMAGE_TAG ? tryResolveUrlFromApiRoot(html.match(PREVIEW_SOURCE_REGEX)?.[1] ?? '') : null;
    const previewSourceURL = IS_IMAGE_TAG ? imageURL : sourceURL;
    const originalFileName = attachmentAnchor?.label ?? html.match(ORIGINAL_FILENAME_REGEX)?.[1] ?? null;

    // Update the image URL so the images can be accessed depending on the config environment
    return {
        previewSourceURL,
        sourceURL,
        originalFileName,
    };
};

export default getAttachmentDetails;
