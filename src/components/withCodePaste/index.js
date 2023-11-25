import {useNavigation} from '@react-navigation/native';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import _ from 'lodash';
import React, {forwardRef, useCallback, useEffect, useRef} from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';

function withCodePaste(WrappedComponent, isUnmountedOnBlur = true) {
    function WithCodePaste({checkComposerVisibility, ...props}, ref) {
        const textInputRef = useRef(null);
        const navigation = useNavigation();

        const setTextInputRef = (el) => {
            textInputRef.current = el;
            if (_.isFunction(ref)) {
                ref(el);
            }
        };
        /**
         * Set pasted text to clipboard
         * @param {String} text
         */
        const paste = useCallback((text) => {
            try {
                document.execCommand('insertText', false, text);
                // Pointer will go out of sight when a large paragraph is pasted on the web. Refocusing the input keeps the cursor in view.
                textInputRef.current.blur();
                textInputRef.current.focus();
                // eslint-disable-next-line no-empty
            } catch (e) {}
        }, []);

        /**
         * Manually place the pasted HTML into Composer
         *
         * @param {String} html - pasted HTML
         */
        const handlePastedHTML = useCallback(
            (html) => {
                const parser = new ExpensiMark();
                paste(parser.htmlToMarkdown(html));
            },
            [paste],
        );

        /**
         * Paste the plaintext content into Composer.
         *
         * @param {ClipboardEvent} event
         */
        const handlePastePlainText = useCallback(
            (event) => {
                const plainText = event.clipboardData.getData('text/plain');
                paste(plainText);
            },
            [paste],
        );

        const handlePaste = useCallback(
            (event) => {
                const isVisible = checkComposerVisibility && _.isFunction(checkComposerVisibility) && checkComposerVisibility();
                const isFocused = textInputRef.current.isFocused();

                if (!(isFocused || isVisible)) {
                    return;
                }

                if (textInputRef.current !== event.target) {
                    // To make sure the text input does not capture paste events from other inputs, we check where the event originated
                    // If it did originate in another input, we return early to prevent the text input from handling the paste
                    const isTargetInput = event.target.nodeName === 'INPUT' || event.target.nodeName === 'TEXTAREA' || event.target.contentEditable === 'true';
                    if (isTargetInput) {
                        return;
                    }

                    textInputRef.current.focus();
                }

                event.preventDefault();

                const {types} = event.clipboardData;
                const TEXT_HTML = 'text/html';

                // If paste contains HTML
                if (types.includes(TEXT_HTML)) {
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
            [handlePastedHTML, handlePastePlainText, checkComposerVisibility],
        );

        useEffect(() => {
            // we need to handle listeners on navigation focus/blur if the component (like Composer) is not unmounting
            // when navigating away to different screen (report)
            let unsubscribeFocus;
            let unsubscribeBlur;
            if (!isUnmountedOnBlur) {
                unsubscribeFocus = navigation.addListener('focus', () => document.addEventListener('paste', handlePaste));
                unsubscribeBlur = navigation.addListener('blur', () => document.removeEventListener('paste', handlePaste));
            }
            if (textInputRef.current) {
                document.addEventListener('paste', handlePaste);
            }

            return () => {
                if (!isUnmountedOnBlur) {
                    unsubscribeFocus();
                    unsubscribeBlur();
                }
                document.removeEventListener('paste', handlePaste);
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                checkComposerVisibility={checkComposerVisibility}
                ref={setTextInputRef}
            />
        );
    }

    WithCodePaste.displayName = `WithCodePaste(${getComponentDisplayName(WrappedComponent)})`;
    return forwardRef(WithCodePaste);
}

export default withCodePaste;
