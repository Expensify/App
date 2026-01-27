import {Str} from 'expensify-common';

/**
 * Returns true if `text` is a single token URL (no whitespace), allowing optional angle-bracket wrappers.
 */
const isStandaloneURL = (text: string): boolean => {
    const trimmed = text.trim();
    if (!trimmed) {
        return false;
    }
    if (/\s/.test(trimmed)) {
        return false;
    }
    const unwrapped = trimmed.replaceAll(/^<|>$/g, '');

    // Reject if contains emoji or any non-ASCII characters
    // (valid URLs per RFC 3986 should be ASCII-only)
    // eslint-disable-next-line no-control-regex
    if (/[^\x00-\x7F]/.test(unwrapped)) {
        return false;
    }

    return Str.isValidURL(unwrapped);
};

/**
 * Collapse newlines to spaces, collapse repeated whitespace to single space, trim,
 * and replace opening &#91; and closing &#93; square brackets with HTML codes, which would otherwise break Markdown link text.
 */
const escapeLinkText = (text: string): string => {
    if (!text) {
        return '';
    }
    const collapsed = text
        .replaceAll(/\r?\n+/g, ' ')
        .replaceAll(/\s+/g, ' ')
        .trim();
    return collapsed.replaceAll('[', '&#91;').replaceAll(']', '&#93;');
};

/**
 * Sanitize the URL for Markdown link. Remove surrounding < > if present and encode it
 * to avoid raw spaces or other invalid characters inside the parentheses.
 * We won't alter semantics otherwise.
 */
const sanitizeUrlForMarkdown = (url: string): string => {
    if (!isStandaloneURL(url)) {
        return url;
    }

    const trimmed = (url || '').trim();
    const unwrapped = trimmed.replaceAll(/^<|>$/g, '');

    try {
        return encodeURI(unwrapped);
    } catch {
        return unwrapped;
    }
};

/**
 * Build a Markdown link: [escaped-selected-text](sanitized-url)
 * We do NOT wrap the URL in < > here — angle brackets are only valid for "auto links", not inside link destinations.
 */
const toMarkdownLink = (selectedText: string, url: string): string => {
    const safeText = escapeLinkText(selectedText);
    const safeUrl = sanitizeUrlForMarkdown(url);
    return `[${safeText}](${safeUrl})`;
};

type DetectRewriteResult = {text: string | null; didReplace: boolean};

/**
 * Given prevText and a selection (start/end) and the insertedText (e.g. diff),
 * returns a rewritten text if this looks like "selection replaced by a single URL" and we should turn it into a markdown link.
 */
const detectAndRewritePaste = (prevText: string, selectionStart: number, selectionEnd: number, insertedText: string): DetectRewriteResult => {
    if (!insertedText || !isStandaloneURL(insertedText)) {
        return {text: null, didReplace: false};
    }

    const replacedSelectionLength = Math.max(0, selectionEnd - selectionStart);
    if (replacedSelectionLength === 0) {
        // nothing replaced (user pasted URL without selecting text) -> don't rewrite
        return {text: null, didReplace: false};
    }

    const selectedText = prevText.substring(selectionStart, selectionEnd);
    const replacement = toMarkdownLink(selectedText, insertedText);
    const newText = prevText.slice(0, selectionStart) + replacement + prevText.slice(selectionEnd);

    return {text: newText, didReplace: true};
};
/**
 * Normalizes multiline markdown links by collapsing whitespace and newlines in the link text.
 * This allows markdown links that span multiple lines to be properly recognized and parsed.
 *
 * Examples:
 *   [text\nhere](url) -> [text here](url)
 *   [text\n\nhere](url) -> [text here](url)
 *   [text\n  here](url) -> [text here](url)
 *   [text]\n(url) -> [text](url)
 *   [text\nhere]\n(url) -> [text here](url)
 *
 * @param text - The markdown text that may contain multiline links
 * @returns The text with multiline links normalized to single-line format
 */
const normalizeMultilineMarkdownLinks = (text: string): string => {
    if (!text) {
        return text;
    }

    // Match markdown links that may span multiple lines
    // Pattern: [ followed by text (possibly with newlines) followed by ]
    //          followed by optional whitespace/newlines, then ( followed by URL followed by )
    // We use a non-greedy match to handle multiple links in the same text
    return text.replaceAll(/\[([^\]]*(?:\r?\n[^\]]*)*)\]\s*\(([^)]+)\)/g, (_match: string, linkText: string, url: string) => {
        // Collapse newlines and whitespace in the link text
        const normalizedLinkText = linkText
            .replaceAll(/\r?\n+/g, ' ') // Replace newlines with spaces
            .replaceAll(/\s+/g, ' ') // Collapse multiple spaces to single space
            .trim(); // Remove leading/trailing whitespace

        // Return the normalized link
        return `[${normalizedLinkText}](${url})`;
    });
};
export {isStandaloneURL, escapeLinkText, sanitizeUrlForMarkdown, toMarkdownLink, detectAndRewritePaste, normalizeMultilineMarkdownLinks};
