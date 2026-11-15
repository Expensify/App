import {buildAccountIDToNameMap} from '@hooks/useAccountIDToNameMap';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import {buildReportIDToNameMap} from '@hooks/useReportIDToNameMap';

import {isStandaloneURL, toMarkdownLink} from '@libs/MarkdownLinkHelpers';
import Parser from '@libs/Parser';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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
 * Identifies emoji images using explicit metadata or known emoji asset formats.
 *
 * @param image The image element to inspect.
 * @returns Whether the image has enough emoji-specific information to use its text.
 */
function isEmojiImage(image: HTMLImageElement): boolean {
    const dataset = image.dataset;

    if (dataset.stringifyEmoji !== undefined || dataset.stringifyType === 'emoji' || dataset.emoji !== undefined || dataset.type === 'emoji') {
        return true;
    }

    // Some sources omit data-* fields, so alt text alone must not identify an image as an emoji.
    const source = image.getAttribute('src') ?? '';
    const patterns = CONST.REGEX.EMOJI_IMAGE_SOURCE;
    const isTeamsEmoji = image.getAttribute('itemType') === CONST.TEAMS_EMOJI_ITEM_TYPE && !!image.getAttribute('itemid') && patterns.TEAMS.test(source);
    const discourseName = patterns.DISCOURSE.exec(source)?.[1];
    const isDiscourseEmoji = !!discourseName && image.classList.contains('emoji') && image.alt === `:${discourseName}:` && image.title === image.alt;

    return isTeamsEmoji || isDiscourseEmoji || patterns.META.test(source) || patterns.YOUTUBE.test(source);
}

/**
 * Returns the source's emoji text without translating names or converting between shortcodes and Unicode.
 *
 * @param image Image element being pasted.
 * @returns The emoji metadata value or alt text, or an empty string when the image should remain unchanged.
 */
function getEmojiReplacementText(image: HTMLImageElement): string {
    if (!isEmojiImage(image)) {
        return '';
    }

    // Slack, Gmail, and Discord supply the emoji text in data-* fields; other recognized formats use alt.
    const dataset = image.dataset;
    return dataset.stringifyEmoji || dataset.emoji || (dataset.type === 'emoji' ? dataset.name : '') || image.alt;
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
    const [personalDetailsList] = useAllPersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    /**
     * Set pasted text to clipboard
     * @param {String} text
     */
    const paste = useCallback(
        (text: string) => {
            try {
                const textInputHTMLElement = textInputRef.current;
                if (!(textInputHTMLElement instanceof HTMLElement)) {
                    return;
                }
                if (textInputHTMLElement.hasAttribute('contenteditable')) {
                    insertAtCaret(textInputHTMLElement, text, maxLength);
                } else if (textInputHTMLElement instanceof HTMLInputElement || textInputHTMLElement instanceof HTMLTextAreaElement) {
                    const availableLength = maxLength - (textInputHTMLElement.value?.length ?? 0);
                    textInputHTMLElement.setRangeText(text.slice(0, availableLength));
                } else {
                    return;
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
            // Built here rather than in render so it costs nothing until a paste actually happens.
            paste(Parser.htmlToMarkdown(html, {reportIDToName: buildReportIDToNameMap(reports), accountIDToName: buildAccountIDToNameMap(personalDetailsList)}));
        },
        [paste, reports, personalDetailsList],
    );

    /**
     * Paste the plaintext content into Composer.
     * If the clipboard contains a single URL and there is selected text, wrap the selected text in a markdown link.
     */
    const handlePastePlainText = useCallback(
        (event: ClipboardEvent) => {
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

                // Native markdown input adds this wrapper and styling when copied, so preserve its original plain text.
                if (pastedHTML.startsWith('<p dir="ltr">')) {
                    handlePastePlainText(event);
                    return;
                }

                const domparser = new DOMParser();
                const htmlDocument = domparser.parseFromString(pastedHTML, TEXT_HTML);
                const embeddedImages = Array.from(htmlDocument.images);
                const emojiImageReplacements = new Map<HTMLImageElement, string>();

                // Collect emoji replacements before parsing HTML so they do not become inaccessible markdown image URLs.
                for (const image of embeddedImages) {
                    const emojiText = getEmojiReplacementText(image);

                    if (!emojiText) {
                        continue;
                    }

                    emojiImageReplacements.set(image, emojiText);
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
