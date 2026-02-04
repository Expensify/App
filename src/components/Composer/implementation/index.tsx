import type {MarkdownStyle} from '@expensify/react-native-live-markdown';
import {useIsFocused} from '@react-navigation/native';
import lodashDebounce from 'lodash/debounce';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {TextInputKeyPressEvent, TextInputSelectionChangeEvent} from 'react-native';
import {DeviceEventEmitter, StyleSheet} from 'react-native';
import type {ComposerProps} from '@components/Composer/types';
import type {AnimatedMarkdownTextInputRef} from '@components/RNMarkdownTextInput';
import RNMarkdownTextInput from '@components/RNMarkdownTextInput';
import useHtmlPaste from '@hooks/useHtmlPaste';
import useIsScrollBarVisible from '@hooks/useIsScrollBarVisible';
import useMarkdownStyle from '@hooks/useMarkdownStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {isMobileSafari, isSafari} from '@libs/Browser';
import {containsOnlyEmojis} from '@libs/EmojiUtils';
import {base64ToFile} from '@libs/fileDownload/FileUtils';
import isEnterWhileComposition from '@libs/KeyboardShortcut/isEnterWhileComposition';
import Parser from '@libs/Parser';
import CONST from '@src/CONST';

const excludeNoStyles: Array<keyof MarkdownStyle> = [];
const excludeReportMentionStyle: Array<keyof MarkdownStyle> = ['mentionReport'];
const imagePreviewAuthRequiredURLs = [CONST.EXPENSIFY_URL, CONST.STAGING_EXPENSIFY_URL];

// Enable Markdown parsing.
// On web we like to have the Text Input field always focused so the user can easily type a new chat
function Composer({
    value,
    defaultValue,
    maxLines = -1,
    onKeyPress = () => {},
    style,
    autoFocus = false,
    shouldCalculateCaretPosition = false,
    isDisabled = false,
    onClear = () => {},
    onPasteFile = () => {},
    onSelectionChange = () => {},
    checkComposerVisibility = () => false,
    selection: selectionProp = {
        start: 0,
        end: 0,
    },
    isComposerFullSize = false,
    onContentSizeChange,
    shouldContainScroll = true,
    isGroupPolicyReport = false,
    ref,
    ...props
}: ComposerProps) {
    const textContainsOnlyEmojis = useMemo(() => containsOnlyEmojis(Parser.htmlToText(Parser.replace(value ?? ''))), [value]);
    const theme = useTheme();
    const styles = useThemeStyles();
    const markdownStyle = useMarkdownStyle(textContainsOnlyEmojis, !isGroupPolicyReport ? excludeReportMentionStyle : excludeNoStyles);
    const StyleUtils = useStyleUtils();
    const textInput = useRef<AnimatedMarkdownTextInputRef | null>(null);
    const [selection, setSelection] = useState<
        | {
              start: number;
              end?: number;
              positionX?: number;
              positionY?: number;
          }
        | undefined
    >({
        start: selectionProp.start,
        end: selectionProp.end,
    });
    const [isRendered, setIsRendered] = useState(false);

    const isScrollBarVisible = useIsScrollBarVisible(textInput, value ?? '');
    const [prevScroll, setPrevScroll] = useState<number | undefined>();
    const [prevHeight, setPrevHeight] = useState<number | undefined>();
    const isReportFlatListScrolling = useRef(false);

    useEffect(() => {
        if (!!selection && selectionProp.start === selection.start && selectionProp.end === selection.end) {
            return;
        }
        setSelection(selectionProp);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectionProp]);

    /**
     *  Adds the cursor position to the selection change event.
     */
    const addCursorPositionToSelectionChange = (event: TextInputSelectionChangeEvent) => {
        const sel = window.getSelection();
        if (shouldCalculateCaretPosition && isRendered && sel) {
            const range = sel.getRangeAt(0).cloneRange();
            range.collapse(true);
            const rect = range.getClientRects()[0] || range.startContainer.parentElement?.getClientRects()[0];
            const containerRect = textInput.current?.getBoundingClientRect();

            let x = 0;
            let y = 0;
            if (rect && containerRect) {
                x = rect.left - containerRect.left;
                y = rect.top - containerRect.top + (textInput?.current?.scrollTop ?? 0) - rect.height / 2;
            }

            const selectionValue = {
                start: event.nativeEvent.selection.start,
                end: event.nativeEvent.selection.end,
                positionX: x - CONST.SPACE_CHARACTER_WIDTH,
                positionY: y,
            };

            onSelectionChange({
                ...event,
                nativeEvent: {
                    ...event.nativeEvent,
                    selection: selectionValue,
                },
            });
            setSelection(selectionValue);
        } else {
            onSelectionChange(event);
            setSelection(event.nativeEvent.selection);
        }
    };

    /**
     * Check the paste event for an attachment, parse the data and call onPasteFile from props with the selected file,
     * Otherwise, convert pasted HTML to Markdown and set it on the composer.
     */
    const handlePaste = useCallback(
        (event: ClipboardEvent) => {
            const isVisible = checkComposerVisibility();
            const isFocused = textInput.current?.isFocused();
            const isContenteditableDivFocused = document.activeElement?.nodeName === 'DIV' && document.activeElement?.hasAttribute('contenteditable');

            if (!(isVisible || isFocused)) {
                return true;
            }

            if (textInput.current !== event.target && !(isContenteditableDivFocused && !event.clipboardData?.files.length)) {
                const eventTarget = event.target as HTMLInputElement | HTMLTextAreaElement | null;
                // To make sure the composer does not capture paste events from other inputs, we check where the event originated
                // If it did originate in another input, we return early to prevent the composer from handling the paste
                const isTargetInput = eventTarget?.nodeName === CONST.ELEMENT_NAME.INPUT || eventTarget?.nodeName === CONST.ELEMENT_NAME.TEXTAREA || eventTarget?.contentEditable === 'true';
                if (isTargetInput || (!isFocused && isContenteditableDivFocused && event.clipboardData?.files.length)) {
                    return true;
                }

                textInput.current?.focus();
            }

            event.preventDefault();

            const TEXT_HTML = 'text/html';

            const clipboardDataHtml = event.clipboardData?.getData(TEXT_HTML) ?? '';

            // If paste contains files, then trigger file management
            if (event.clipboardData?.files.length && event.clipboardData.files.length > 0) {
                // Prevent the default so we do not post the file name into the text box
                onPasteFile(Array.from(event.clipboardData.files));
                return true;
            }

            // If paste contains base64 image
            if (clipboardDataHtml?.includes(CONST.IMAGE_BASE64_MATCH)) {
                const domparser = new DOMParser();
                const pastedHTML = clipboardDataHtml;
                const embeddedImages = domparser.parseFromString(pastedHTML, TEXT_HTML)?.images;

                if (embeddedImages.length > 0 && embeddedImages[0].src) {
                    const src = embeddedImages[0].src;
                    const file = base64ToFile(src, 'image.png');
                    onPasteFile(file);
                    return true;
                }
            }

            // If paste contains image from Google Workspaces ex: Sheets, Docs, Slide, etc
            if (clipboardDataHtml?.includes(CONST.GOOGLE_DOC_IMAGE_LINK_MATCH)) {
                const domparser = new DOMParser();
                const pastedHTML = clipboardDataHtml;
                const embeddedImages = domparser.parseFromString(pastedHTML, TEXT_HTML).images;

                if (embeddedImages.length > 0 && embeddedImages[0]?.src) {
                    const src = embeddedImages[0].src;
                    if (src.includes(CONST.GOOGLE_DOC_IMAGE_LINK_MATCH)) {
                        fetch(src)
                            .then((response) => response.blob())
                            .then((blob) => {
                                const file = new File([blob], 'image.jpg', {type: 'image/jpeg'});
                                onPasteFile(file);
                            });
                        return true;
                    }
                }
            }
            return false;
        },
        [onPasteFile, checkComposerVisibility],
    );

    useEffect(() => {
        if (!textInput.current) {
            return;
        }
        const debouncedSetPrevScroll = lodashDebounce(() => {
            if (!textInput.current) {
                return;
            }
            setPrevScroll(textInput.current.scrollTop);
        }, 100);

        textInput.current.addEventListener('scroll', debouncedSetPrevScroll);
        return () => {
            textInput.current?.removeEventListener('scroll', debouncedSetPrevScroll);
        };
    }, []);

    useEffect(() => {
        const scrollingListener = DeviceEventEmitter.addListener(CONST.EVENTS.SCROLLING, (scrolling: boolean) => {
            isReportFlatListScrolling.current = scrolling;
        });

        return () => scrollingListener.remove();
    }, []);

    useEffect(() => {
        const handleWheel = (e: MouseEvent) => {
            if (isReportFlatListScrolling.current) {
                e.preventDefault();
                return;
            }

            // When the composer has no scrollable content, the stopPropagation will prevent the inverted wheel event handler on the Chat body
            // which defaults to the browser wheel behavior. This causes the chat body to scroll in the opposite direction creating jerky behavior.
            if (textInput.current && textInput.current.scrollHeight <= textInput.current.clientHeight) {
                return;
            }
            e.stopPropagation();
        };
        textInput.current?.addEventListener('wheel', handleWheel, {passive: false});

        return () => {
            textInput.current?.removeEventListener('wheel', handleWheel);
        };
    }, []);

    useEffect(() => {
        if (!textInput.current || prevScroll === undefined || prevHeight === undefined) {
            return;
        }
        textInput.current.scrollTop = prevScroll + prevHeight - textInput.current.clientHeight;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isComposerFullSize]);

    const isActive = useIsFocused();
    useHtmlPaste(textInput, handlePaste, isActive);

    useEffect(() => {
        setIsRendered(true);
    }, []);

    const clear = useCallback(() => {
        if (!textInput.current) {
            return;
        }

        const currentText = textInput.current.value;
        textInput.current.clear();

        // We need to reset the selection to 0,0 manually after clearing the text input on web
        const selectionEvent = {
            nativeEvent: {
                selection: {
                    start: 0,
                    end: 0,
                },
            },
        } as TextInputSelectionChangeEvent;
        onSelectionChange(selectionEvent);
        setSelection({start: 0, end: 0});

        onClear(currentText);
    }, [onClear, onSelectionChange]);

    useImperativeHandle(ref, () => {
        const textInputRef = textInput.current;
        if (!textInputRef) {
            throw new Error('textInputRef is not available. This should never happen and indicates a developer error.');
        }

        return {
            ...textInputRef,
            // Overwrite clear with our custom implementation, which mimics how the native TextInput's clear method works
            clear,
            // We have to redefine these methods as they are inherited by prototype chain and are not accessible directly
            blur: () => textInputRef.blur(),
            focus: () => textInputRef.focus(),
            get scrollTop() {
                return textInputRef.scrollTop;
            },
        };
    }, [clear]);

    const handleKeyPress = useCallback(
        (e: TextInputKeyPressEvent) => {
            // Prevent onKeyPress from being triggered if the Enter key is pressed while text is being composed
            if (!onKeyPress || isEnterWhileComposition(e as unknown as KeyboardEvent)) {
                return;
            }

            onKeyPress(e);
        },
        [onKeyPress],
    );

    const scrollStyleMemo = useMemo(() => {
        if (shouldContainScroll) {
            return isScrollBarVisible ? [styles.overflowScroll, styles.overscrollBehaviorContain] : styles.overflowHidden;
        }
        return styles.overflowAuto;
    }, [shouldContainScroll, styles.overflowAuto, styles.overflowScroll, styles.overscrollBehaviorContain, styles.overflowHidden, isScrollBarVisible]);

    const inputStyleMemo = useMemo(
        () => [
            StyleSheet.flatten([style, {outline: 'none'}]),
            StyleUtils.getComposeTextAreaPadding(isComposerFullSize, textContainsOnlyEmojis),
            isMobileSafari() || isSafari() ? styles.rtlTextRenderForSafari : {},
            scrollStyleMemo,
            StyleUtils.getComposerMaxHeightStyle(maxLines, isComposerFullSize),
            isComposerFullSize ? {height: '100%', maxHeight: 'none'} : undefined,
            textContainsOnlyEmojis ? styles.onlyEmojisTextLineHeight : {},
        ],

        [style, styles.rtlTextRenderForSafari, styles.onlyEmojisTextLineHeight, scrollStyleMemo, StyleUtils, maxLines, isComposerFullSize, textContainsOnlyEmojis],
    );

    return (
        <RNMarkdownTextInput
            id={CONST.COMPOSER.NATIVE_ID}
            autoComplete="off"
            autoCorrect={!isMobileSafari()}
            placeholderTextColor={theme.placeholderText}
            ref={(el) => {
                textInput.current = el;
            }}
            selection={selection}
            style={[inputStyleMemo]}
            markdownStyle={markdownStyle}
            value={value}
            defaultValue={defaultValue}
            autoFocus={autoFocus}
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
            onSelectionChange={addCursorPositionToSelectionChange}
            onContentSizeChange={(e) => {
                setPrevHeight(e.nativeEvent.contentSize.height);
                onContentSizeChange?.(e);
            }}
            disabled={isDisabled}
            onKeyPress={handleKeyPress}
            addAuthTokenToImageURLCallback={addEncryptedAuthTokenToURL}
            imagePreviewAuthRequiredURLs={imagePreviewAuthRequiredURLs}
        />
    );
}

export default Composer;
