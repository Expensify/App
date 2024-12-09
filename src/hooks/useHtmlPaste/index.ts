import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect} from 'react';
import Parser from '@libs/Parser';
import type UseHtmlPaste from './types';

const insertByCommand = (text: string) => {
    document.execCommand('insertText', false, text);
};

const insertAtCaret = (target: HTMLElement, text: string) => {
    const selection = window.getSelection();
    if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const node = document.createTextNode(text);
        range.insertNode(node);

        // Move caret to the end of the newly inserted text node.
        range.setStart(node, node.length);
        range.setEnd(node, node.length);
        selection.setBaseAndExtent(range.startContainer, range.startOffset, range.endContainer, range.endOffset);

        // Dispatch input event to trigger Markdown Input to parse the new text
        target.dispatchEvent(new Event('input', {bubbles: true}));
    } else {
        insertByCommand(text);
    }
};

const useHtmlPaste: UseHtmlPaste = (textInputRef, preHtmlPasteCallback, removeListenerOnScreenBlur = false) => {
    const navigation = useNavigation();

    /**
     * Set pasted text to clipboard
     * @param {String} text
     */
    const paste = useCallback((text: string) => {
        try {
            const textInputHTMLElement = textInputRef.current as HTMLElement;
            if (textInputHTMLElement?.hasAttribute('contenteditable')) {
                insertAtCaret(textInputHTMLElement, text);
            } else {
                insertByCommand(text);
            }

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
    }, []);

    /**
     * Manually place the pasted HTML into Composer
     *
     * @param {String} html - pasted HTML
     */
    const handlePastedHTML = useCallback(
        (html: string) => {
            paste(Parser.htmlToMarkdown(html));
        },
        [paste],
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
                handlePastedHTML(pastedHTML);
                return;
            }
            handlePastePlainText(event);
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [handlePastedHTML, handlePastePlainText, preHtmlPasteCallback],
    );

    useEffect(() => {
        // we need to re-register listener on navigation focus/blur if the component (like Composer) is not unmounting
        // when navigating away to different screen (report) to avoid paste event on other screen being wrongly handled
        // by current screen paste listener
        let unsubscribeFocus: () => void;
        let unsubscribeBlur: () => void;
        if (removeListenerOnScreenBlur) {
            unsubscribeFocus = navigation.addListener('focus', () => document.addEventListener('paste', handlePaste, true));
            unsubscribeBlur = navigation.addListener('blur', () => document.removeEventListener('paste', handlePaste, true));
        }

        document.addEventListener('paste', handlePaste, true);

        return () => {
            if (removeListenerOnScreenBlur) {
                unsubscribeFocus();
                unsubscribeBlur();
            }
            document.removeEventListener('paste', handlePaste, true);
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
};

export default useHtmlPaste;
