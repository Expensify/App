import {useNavigation} from '@react-navigation/native';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import React, {ComponentType, ForwardedRef, forwardRef, RefAttributes, useCallback, useEffect, useRef} from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';

type WithCodePasteProps = {
    checkComposerVisibility?: () => boolean;
};

function withCodePaste<TProps extends WithCodePasteProps>(
    WrappedComponent: ComponentType<TProps & RefAttributes<HTMLInputElement>>,
    isUnmountedOnBlur = true,
): (props: TProps & RefAttributes<HTMLInputElement>) => React.ReactElement | null {
    function WithCodePaste({checkComposerVisibility, ...props}: TProps, ref: ForwardedRef<HTMLInputElement>) {
        const textInputRef = useRef<
            | (HTMLInputElement & {
                  isFocused?: () => boolean;
              })
            | null
        >(null);
        const navigation = useNavigation();

        const setTextInputRef = (el: HTMLInputElement) => {
            textInputRef.current = el;
            if (!ref) {
                return;
            }
            if (typeof ref === 'function') {
                ref(el);
            } else if ('current' in ref) {
                // eslint-disable-next-line no-param-reassign
                ref.current = el;
            }
        };
        /**
         * Set pasted text to clipboard
         * @param {String} text
         */
        const paste = useCallback((text: string) => {
            try {
                document.execCommand('insertText', false, text);
                // Pointer will go out of sight when a large paragraph is pasted on the web. Refocusing the input keeps the cursor in view.
                textInputRef.current?.blur();
                textInputRef.current?.focus();
                // eslint-disable-next-line no-empty
            } catch (e) {}
        }, []);

        /**
         * Manually place the pasted HTML into Composer
         *
         * @param {String} html - pasted HTML
         */
        const handlePastedHTML = useCallback(
            (html: string) => {
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
                const isVisible = typeof checkComposerVisibility === 'function' && checkComposerVisibility();
                const isFocused = textInputRef.current?.isFocused?.();

                if (textInputRef.current?.isFocused && !isFocused && !isVisible) {
                    return;
                }

                if (textInputRef.current !== event.target) {
                    // To make sure the text input does not capture paste events from other inputs, we check where the event originated
                    // If it did originate in another input, we return early to prevent the text input from handling the paste
                    const target = event.target as HTMLInputElement;
                    const isTargetInput = (target && target.nodeName === 'INPUT') || target.nodeName === 'TEXTAREA' || target.contentEditable === 'true';

                    if (isTargetInput) {
                        return;
                    }

                    textInputRef.current?.focus();
                }

                event.preventDefault();

                const types = event.clipboardData?.types;
                const TEXT_HTML = 'text/html';

                // If paste contains HTML
                if (types && types.includes(TEXT_HTML)) {
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
            let unsubscribeFocus: () => void;
            let unsubscribeBlur: () => void;
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
                {...(props as TProps)}
                checkComposerVisibility={checkComposerVisibility}
                ref={setTextInputRef}
            />
        );
    }

    WithCodePaste.displayName = `WithCodePaste(${getComponentDisplayName(WrappedComponent)})`;
    return forwardRef(WithCodePaste);
}

export default withCodePaste;
