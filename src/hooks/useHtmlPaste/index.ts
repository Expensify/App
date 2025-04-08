import {useCallback, useEffect} from 'react';
import Parser from '@libs/Parser';
import CONST from '@src/CONST';
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
                // eslint-disable-next-line no-empty
            } catch (e) {}
            // We only need to set the callback once.
            // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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
            paste(Parser.htmlToMarkdown(html.slice(0, maxLength)));
        },
        [paste, maxLength],
    );

    /**
     * Paste the plaintext content into Composer.
     *
     * @param {ClipboardEvent} event
     */
    const handlePastePlainText = useCallback(
        (event: ClipboardEvent) => {
            const plainText = event.clipboardData?.getData('text/plain');
            if (plainText) {
                paste(plainText);
            }
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
                const embeddedImages = domparser.parseFromString(pastedHTML, TEXT_HTML).images;

                // Exclude parsing img tags in the HTML, as fetching the image via fetch triggers a connect-src Content-Security-Policy error.
                if (embeddedImages.length > 0 && embeddedImages[0].src) {
                    // If HTML has emoji, then treat this as plain text.
                    if (embeddedImages[0].dataset && embeddedImages[0].dataset.stringifyType === 'emoji') {
                        handlePastePlainText(event);
                        return;
                    }
                }
                // If HTML starts with <p dir="ltr">, it means that the text was copied from the markdown input from the native app
                // and was saved to clipboard with additional styling, so we need to treat this as plain text to avoid adding unnecessary characters.
                if (pastedHTML.startsWith('<p dir="ltr">')) {
                    handlePastePlainText(event);
                    return;
                }
                handlePastedHTML(pastedHTML);
                return;
            }
            handlePastePlainText(event);
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [handlePastedHTML, handlePastePlainText, preHtmlPasteCallback],
    );

    useEffect(() => {
        if (!isActive) {
            return;
        }
        document.addEventListener('paste', handlePaste, true);

        return () => {
            document.removeEventListener('paste', handlePaste, true);
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isActive]);
};

export default useHtmlPaste;
