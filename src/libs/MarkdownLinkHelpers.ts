import {Str} from 'expensify-common';

/**
 * Returns true if `text` is a single token URL (no whitespace), allowing optional angle-bracket wrappers.
 */
const isStandaloneURL = (text: string): boolean => {
    if (!text) {
        return false;
    }
    const trimmed = text.trim();
    if (/\s/.test(trimmed)) {
        return false;
    }
    const unwrapped = trimmed.replace(/^<|>$/g, '');
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
        .replace(/\r?\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return collapsed.replace(/\[/g, '&#91;').replace(/\]/g, '&#93;');
};

/**
 * Sanitize the URL for Markdown link. Remove surrounding < > if present and encode it
 * to avoid raw spaces or other invalid characters inside the parentheses.
 * We won't alter semantics otherwise.
 */
const sanitizeUrlForMarkdown = (url: string): string => {
    const trimmed = (url || '').trim();
    const unwrapped = trimmed.replace(/^<|>$/g, '');
    try {
        return encodeURI(unwrapped);
    } catch {
        return unwrapped;
    }
};

/**
 * Build a Markdown link: [escaped-selected-text](sanitized-url)
 * We do NOT wrap the URL in < > here — angle brackets are only valid for "autolinks", not inside link destinations.
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
 *
 * options.maxLength (optional) allows the caller to guard against growing past a message limit.
 */
const detectAndRewritePaste = (prevText: string, selectionStart: number, selectionEnd: number, insertedText: string, options?: {maxLength?: number}): DetectRewriteResult => {
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

    if (options?.maxLength && newText.length > options.maxLength) {
        // If replacing would exceed the configured limit, bail out and don't rewrite.
        return {text: null, didReplace: false};
    }

    return {text: newText, didReplace: true};
};

export {isStandaloneURL, escapeLinkText, sanitizeUrlForMarkdown, toMarkdownLink, detectAndRewritePaste};
