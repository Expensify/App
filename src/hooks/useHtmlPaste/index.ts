import emojis, {emojiNameTable} from '@assets/emojis';

import {isMobileSafari} from '@libs/Browser';
import {containsOnlyEmojis} from '@libs/EmojiUtils';
import {isStandaloneURL, toMarkdownLink} from '@libs/MarkdownLinkHelpers';
import Parser from '@libs/Parser';

import CONST from '@src/CONST';

import {Str} from 'expensify-common';
import {DomUtils, parseDocument} from 'htmlparser2';
import {useCallback, useEffect, useRef} from 'react';

import type UseHtmlPaste from './types';

const insertAtCaret = (target: HTMLElement, insertedText: string, maxLength: number) => {
    const currentText = target.textContent ?? '';

    let availableLength = maxLength - currentText.length;
    if (availableLength <= 0) {
        return;
    }

    let text = insertedText;

    const selection = window.getSelection();
    if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        availableLength -= selectedText.length;
        if (availableLength <= 0) {
            return;
        }
        text = text.slice(0, availableLength);
        range.deleteContents();

        const node = document.createTextNode(text);
        range.insertNode(node);

        // Move caret to the end of the newly inserted text node.
        range.setStart(node, node.length);
        range.setEnd(node, node.length);
        selection.setBaseAndExtent(range.startContainer, range.startOffset, range.endContainer, range.endOffset);

        // Dispatch input event to trigger Markdown Input to parse the new text
        target.dispatchEvent(new Event('input', {bubbles: true}));
    }
};

/**
 * Converts an iOS Safari emoji image filename into its Unicode emoji.
 * For example, `1f389@2x.png` becomes `🎉` after its codepoint is decoded.
 *
 * @param alt The image alt text to inspect.
 * @returns The decoded emoji, or an empty string when the filename is invalid or is not an emoji.
 */
function getEmojiFromImageAlt(alt: string): string {
    // iOS Safari can paste emoji images as blob URLs with codepoint filenames in alt text.
    const emojiHexCodepoints = alt.match(CONST.REGEX.EMOJI_IMAGE_ALT)?.at(1);

    if (!emojiHexCodepoints) {
        return '';
    }

    const codepoints = emojiHexCodepoints.split('-').map((codepoint) => Number.parseInt(codepoint, 16));

    if (codepoints.some((codepoint) => Number.isNaN(codepoint) || codepoint > 0x10ffff)) {
        return '';
    }

    const emoji = String.fromCodePoint(...codepoints);
    return containsOnlyEmojis(emoji) ? emoji : '';
}

/**
 * Checks whether an image contains Slack's metadata identifying it as an emoji.
 *
 * @param image The image element to inspect.
 * @returns `true` when Slack's emoji metadata is present; otherwise, `false`.
 */
function isEmojiImage(image: HTMLImageElement): boolean {
    const dataset = image.dataset;

    return dataset.stringifyEmoji !== undefined || dataset.stringifyType === 'emoji';
}

/**
 * Replaces different whitespace sequences with one space so HTML text and clipboard text can be compared.
 *
 * @param text Text extracted from HTML or the clipboard.
 * @returns Trimmed text with equivalent whitespace represented by one space.
 */
function normalizeClipboardText(text: string): string {
    return text.replaceAll(/\s+/g, ' ').trim();
}

/**
 * Escapes regular-expression characters before literal HTML text is added to a dynamic pattern.
 *
 * @param text Literal text to escape.
 * @returns Text that can be safely inserted into a regular expression.
 */
function escapeRegExp(text: string): string {
    return text.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts readable text from HTML while replacing candidate images with unique markers.
 *
 * @param node Current HTML node to inspect.
 * @param imageMarkers Map of candidate images to their unique markers.
 * @returns Text representation of the node with image positions preserved.
 */
function getTextWithImageMarkers(node: Node, imageMarkers: Map<Node, string>): string {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? '';
    }

    if (node.nodeName === 'BR') {
        return ' ';
    }

    if (node.nodeName === 'IMG') {
        return imageMarkers.get(node) ?? '';
    }

    const text = Array.from(node.childNodes)
        .map((childNode) => getTextWithImageMarkers(childNode, imageMarkers))
        .join('');

    return CONST.HTML_BLOCK_ELEMENT_NAMES.has(node.nodeName) ? ` ${text} ` : text;
}

/**
 * Finds Slack shortcodes that occupy the same positions as candidate images in iOS Safari HTML.
 *
 * Safari removes Slack's identifying data attributes, so the plain-text clipboard value is used
 * only as positional evidence. All images participate in the comparison so their own plain-text
 * representations are not dropped. The returned map does not approve an image by itself; the Unicode
 * value is checked again before the image is replaced.
 *
 * @param htmlDocument Parsed clipboard HTML document containing candidate images.
 * @param plainText Plain-text clipboard value from the same paste event.
 * @returns A map from each candidate image to its matching shortcode.
 */
function getIOSSafariEmojiShortcodes(htmlDocument: Document, plainText: string): Map<HTMLImageElement, string> {
    const shortcodes = new Map<HTMLImageElement, string>();
    if (!isMobileSafari() || !plainText) {
        return shortcodes;
    }

    const images = Array.from(htmlDocument.images);
    const emojiImages = new Set(images.filter((image) => image.src.startsWith('blob:') && CONST.REGEX.EMOJI_IMAGE_ALT.test(image.alt)));
    if (emojiImages.size === 0) {
        return shortcodes;
    }

    const imageMarkers = new Map<Node, string>();
    for (const [index, image] of images.entries()) {
        imageMarkers.set(image, `${CONST.EMOJI_IMAGE_MARKER_PREFIX}${index}${CONST.EMOJI_IMAGE_MARKER_SUFFIX}`);
    }

    const htmlText = normalizeClipboardText(getTextWithImageMarkers(htmlDocument.body, imageMarkers));
    let pattern = '^';
    let previousMarkerEnd = 0;

    for (const image of images) {
        const marker = imageMarkers.get(image);
        if (!marker) {
            return shortcodes;
        }

        const markerStart = htmlText.indexOf(marker, previousMarkerEnd);
        if (markerStart < 0) {
            return shortcodes;
        }

        pattern += escapeRegExp(htmlText.slice(previousMarkerEnd, markerStart));
        const normalizedAlt = normalizeClipboardText(image.alt);
        const imageTextPattern = normalizedAlt ? `${CONST.REGEX.SLACK_EMOJI_SHORTCODE_PATTERN}|${escapeRegExp(normalizedAlt)}` : `${CONST.REGEX.SLACK_EMOJI_SHORTCODE_PATTERN}|`;
        pattern += `(${imageTextPattern})`;
        previousMarkerEnd = markerStart + marker.length;
    }

    pattern += `${escapeRegExp(htmlText.slice(previousMarkerEnd))}$`;
    const match = normalizeClipboardText(plainText).match(new RegExp(pattern, 'u'));
    if (!match) {
        return shortcodes;
    }

    for (const [index, image] of images.entries()) {
        if (!emojiImages.has(image)) {
            continue;
        }

        const shortcode = match.at(index + 1);
        if (shortcode && CONST.REGEX.SLACK_EMOJI_SHORTCODE.test(shortcode)) {
            shortcodes.set(image, shortcode);
        }
    }

    return shortcodes;
}

/**
 * Resolves a Slack shortcode to its Unicode emoji, including an optional skin tone.
 *
 * @param shortcode Slack shortcode such as `:tada:` or `:+1::skin-tone-4:`.
 * @returns The matching Unicode emoji, or an empty string when the shortcode is unsupported.
 */
function getEmojiFromShortcode(shortcode: string): string {
    const match = shortcode.match(CONST.REGEX.SLACK_EMOJI_SHORTCODE);
    if (!match) {
        return '';
    }

    const [, name, skinTone] = match;
    const emoji = emojiNameTable[name] ?? emojis.find((item) => 'name' in item && item.aliases?.includes(name));
    if (!emoji || 'header' in emoji) {
        return '';
    }

    if (!skinTone) {
        return emoji.code;
    }

    return emoji.types?.at(6 - Number(skinTone)) ?? '';
}

/**
 * Removes variation selectors before comparing equivalent emoji representations.
 *
 * @param emoji Unicode emoji to normalize for comparison.
 * @returns Emoji text without U+FE0F variation selectors.
 */
function normalizeEmojiForComparison(emoji: string): string {
    return emoji.replaceAll('\uFE0F', '');
}

/**
 * Verifies that a Safari blob image is the emoji represented by the shortcode at its exact position.
 *
 * @param image Candidate image from the pasted HTML.
 * @param shortcodeAtImagePosition Plain-text shortcode matched to this image position.
 * @returns `true` only when the Safari, blob, filename, shortcode, and Unicode checks all pass.
 */
function isIOSSafariEmojiImage(image: HTMLImageElement, shortcodeAtImagePosition?: string): boolean {
    if (!isMobileSafari() || !image.src.startsWith('blob:') || !CONST.REGEX.EMOJI_IMAGE_ALT.test(image.alt) || !shortcodeAtImagePosition) {
        return false;
    }

    const emojiFromImageAlt = getEmojiFromImageAlt(image.alt);
    const emojiFromShortcode = getEmojiFromShortcode(shortcodeAtImagePosition);

    return !!emojiFromImageAlt && !!emojiFromShortcode && normalizeEmojiForComparison(emojiFromImageAlt) === normalizeEmojiForComparison(emojiFromShortcode);
}

/**
 * Returns the text that should replace an emoji image during paste.
 *
 * @param image Image element being pasted.
 * @param shortcodeAtImagePosition Safari shortcode matched to this image's HTML position.
 * @returns Slack shortcode, Unicode emoji, or an empty string when the image should remain unchanged.
 */
function getEmojiReplacementText(image: HTMLImageElement, shortcodeAtImagePosition?: string): string {
    // Browsers that preserve Slack's data-* metadata can identify emoji images directly.
    if (isEmojiImage(image)) {
        const shortcode = image.dataset.stringifyEmoji;
        return shortcode?.length ? shortcode : image.alt;
    }

    // iOS Safari removes Slack's data-* metadata, so use the filename only to verify the corresponding plain-text shortcode.
    if (isIOSSafariEmojiImage(image, shortcodeAtImagePosition)) {
        return shortcodeAtImagePosition ?? '';
    }

    return '';
}

/**
 * Replaces recognized emoji image tags while preserving every other character from the original clipboard HTML.
 *
 * @param html Original clipboard HTML.
 * @param images Images parsed from the clipboard HTML.
 * @param replacements Replacement text keyed by its corresponding parsed image.
 * @returns Clipboard HTML with only recognized emoji image tags replaced.
 */
function replaceEmojiImagesInHTML(html: string, images: HTMLImageElement[], replacements: Map<HTMLImageElement, string>): string {
    if (replacements.size === 0) {
        return html;
    }

    const sourceDocument = parseDocument(html, {withStartIndices: true, withEndIndices: true});
    const sourceImages = DomUtils.getElementsByTagName('img', sourceDocument, true);
    if (sourceImages.length !== images.length) {
        return html;
    }

    const sourceReplacements: Array<{startIndex: number; endIndex: number; text: string}> = [];
    for (const [index, image] of images.entries()) {
        const replacement = replacements.get(image);
        if (!replacement) {
            continue;
        }

        const sourceImage = sourceImages.at(index);
        if (sourceImage?.startIndex === null || sourceImage?.startIndex === undefined || sourceImage.endIndex === null) {
            return html;
        }

        sourceReplacements.push({
            startIndex: sourceImage.startIndex,
            endIndex: sourceImage.endIndex,
            text: Str.htmlEncode(replacement),
        });
    }

    let htmlWithEmojiReplacements = html;
    for (const replacement of sourceReplacements.toSorted((first, second) => second.startIndex - first.startIndex)) {
        htmlWithEmojiReplacements = htmlWithEmojiReplacements.slice(0, replacement.startIndex) + replacement.text + htmlWithEmojiReplacements.slice(replacement.endIndex + 1);
    }

    return htmlWithEmojiReplacements;
}

const useHtmlPaste: UseHtmlPaste = (textInputRef, preHtmlPasteCallback, isActive = false, maxLength = CONST.MAX_COMMENT_LENGTH + 1) => {
    /**
     * Set pasted text to clipboard
     * @param {String} text
     */
    const paste = useCallback(
        (text: string) => {
            try {
                const textInputHTMLElement = textInputRef.current as HTMLElement;
                if (textInputHTMLElement?.hasAttribute('contenteditable')) {
                    insertAtCaret(textInputHTMLElement, text, maxLength);
                } else {
                    const htmlInput = textInputRef.current as unknown as HTMLInputElement;
                    const availableLength = maxLength - (htmlInput.value?.length ?? 0);
                    htmlInput.setRangeText(text.slice(0, availableLength));
                }

                requestAnimationFrame(() => {
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const caretRect = range.getBoundingClientRect();
                        const inputRect = textInputHTMLElement.getBoundingClientRect();

                        // Calculate position need to scroll to
                        const scrollLeft = Math.max(0, caretRect.left - inputRect.left + textInputHTMLElement.scrollLeft - textInputHTMLElement.clientWidth / 2);
                        const scrollTop = Math.max(0, caretRect.top - inputRect.top + textInputHTMLElement.scrollTop - textInputHTMLElement.clientHeight / 2);

                        // Auto scroll to the position of cursor
                        textInputHTMLElement.scrollLeft = scrollLeft;
                        textInputHTMLElement.scrollTop = scrollTop;
                    }
                });

                // Pointer will go out of sight when a large paragraph is pasted on the web. Refocusing the input keeps the cursor in view.
                // To avoid the keyboard toggle issue in mWeb if using blur() and focus() functions, we just need to dispatch the event to trigger the onFocus handler
                // We need to trigger the bubbled "focusin" event to make sure the onFocus handler is triggered
                textInputHTMLElement.dispatchEvent(
                    new FocusEvent('focusin', {
                        bubbles: true,
                    }),
                );
            } catch (e) {}
            // We only need to set the callback once.
        },
        [maxLength, textInputRef],
    );

    /**
     * Manually place the pasted HTML into Composer
     *
     * @param {String} html - pasted HTML
     */
    const handlePastedHTML = useCallback(
        (html: string) => {
            paste(Parser.htmlToMarkdown(html, {}));
        },
        [paste],
    );

    /**
     * Paste the plaintext content into Composer.
     * If the clipboard contains a single URL and there is selected text, wrap the selected text in a markdown link.
     */
    const handlePastePlainText = useCallback(
        (event: ClipboardEvent) => {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const clipboardText = event.clipboardData?.getData('text/plain') || event.clipboardData?.getData('text/uri-list');
            if (!clipboardText) {
                return;
            }

            const selection = window.getSelection?.();
            const selectedText = selection?.toString() ?? '';

            if (isStandaloneURL(clipboardText) && selectedText) {
                paste(toMarkdownLink(selectedText, clipboardText));
                return;
            }

            paste(clipboardText);
        },
        [paste],
    );

    const handlePaste = useCallback(
        (event: ClipboardEvent) => {
            if (!textInputRef.current) {
                return;
            }

            if (preHtmlPasteCallback?.(event)) {
                return;
            }

            const isFocused = textInputRef.current?.isFocused();

            if (!isFocused) {
                return;
            }

            event.preventDefault();

            const TEXT_HTML = 'text/html';

            // If paste contains HTML
            if (event.clipboardData?.types?.includes(TEXT_HTML)) {
                const pastedHTML = event.clipboardData.getData(TEXT_HTML);

                const domparser = new DOMParser();
                const htmlDocument = domparser.parseFromString(pastedHTML, TEXT_HTML);
                const embeddedImages = Array.from(htmlDocument.images);
                const iOSSafariEmojiShortcodes = getIOSSafariEmojiShortcodes(htmlDocument, event.clipboardData.getData('text/plain'));
                const emojiImageReplacements = new Map<HTMLImageElement, string>();

                // Collect emoji replacements before parsing HTML so they do not become inaccessible markdown image URLs.
                for (const image of embeddedImages) {
                    const emojiText = getEmojiReplacementText(image, iOSSafariEmojiShortcodes.get(image));

                    if (!emojiText) {
                        continue;
                    }

                    emojiImageReplacements.set(image, emojiText);
                }

                // If HTML starts with <p dir="ltr">, it means that the text was copied from the markdown input from the native app
                // and was saved to clipboard with additional styling, so we need to treat this as plain text to avoid adding unnecessary characters.
                if (pastedHTML.startsWith('<p dir="ltr">')) {
                    handlePastePlainText(event);
                    return;
                }
                handlePastedHTML(replaceEmojiImagesInHTML(pastedHTML, embeddedImages, emojiImageReplacements));
                return;
            }
            handlePastePlainText(event);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [handlePastedHTML, handlePastePlainText, preHtmlPasteCallback],
    );

    const handlePasteRef = useRef<(event: ClipboardEvent) => void>(handlePaste);
    useEffect(() => {
        handlePasteRef.current = handlePaste;
    }, [handlePaste]);

    useEffect(() => {
        if (!isActive) {
            return;
        }

        const listener = (event: ClipboardEvent) => {
            handlePasteRef.current(event);
        };

        document.addEventListener('paste', listener, true);

        return () => {
            document.removeEventListener('paste', listener, true);
        };
    }, [isActive]);

    return {
        handlePastePlainText,
    };
};

export default useHtmlPaste;
