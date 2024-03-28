import lodashDebounce from 'lodash/debounce';
import type {BaseSyntheticEvent, ForwardedRef} from 'react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
// eslint-disable-next-line no-restricted-imports
import type {DimensionValue, NativeSyntheticEvent, Text as RNText, TextInput, TextInputKeyPressEventData, TextInputSelectionChangeEventData, TextStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import type {AnimatedMarkdownTextInputRef} from '@components/RNMarkdownTextInput';
import RNMarkdownTextInput from '@components/RNMarkdownTextInput';
import Text from '@components/Text';
import useHtmlPaste from '@hooks/useHtmlPaste';
import useIsScrollBarVisible from '@hooks/useIsScrollBarVisible';
import useMarkdownStyle from '@hooks/useMarkdownStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import * as ComposerUtils from '@libs/ComposerUtils';
import updateIsFullComposerAvailable from '@libs/ComposerUtils/updateIsFullComposerAvailable';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import isEnterWhileComposition from '@libs/KeyboardShortcut/isEnterWhileComposition';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import CONST from '@src/CONST';
import type {ComposerProps} from './types';

/**
 * Retrieves the characters from the specified cursor position up to the next space or new line.
 *
 * @param inputString - The input string.
 * @param cursorPosition - The position of the cursor within the input string.
 * @returns - The substring from the cursor position up to the next space or new line.
 *                     If no space or new line is found, returns the substring from the cursor position to the end of the input string.
 */
const getNextChars = (inputString: string, cursorPosition: number): string => {
    // Get the substring starting from the cursor position
    const subString = inputString.substring(cursorPosition);

    // Find the index of the next space or new line character
    const spaceIndex = subString.search(/[ \n]/);

    if (spaceIndex === -1) {
        return subString;
    }

    // If there is a space or new line, return the substring up to the space or new line
    return subString.substring(0, spaceIndex);
};

// Enable Markdown parsing.
// On web we like to have the Text Input field always focused so the user can easily type a new chat
function Composer(
    {
        value,
        defaultValue,
        maxLines = -1,
        onKeyPress = () => {},
        style,
        shouldClear = false,
        autoFocus = false,
        isFullComposerAvailable = false,
        shouldCalculateCaretPosition = false,
        numberOfLines: numberOfLinesProp = 0,
        isDisabled = false,
        onClear = () => {},
        onPasteFile = () => {},
        onSelectionChange = () => {},
        onNumberOfLinesChange = () => {},
        setIsFullComposerAvailable = () => {},
        checkComposerVisibility = () => false,
        selection: selectionProp = {
            start: 0,
            end: 0,
        },
        isReportActionCompose = false,
        isComposerFullSize = false,
        shouldContainScroll = false,
        ...props
    }: ComposerProps,
    ref: ForwardedRef<TextInput | HTMLInputElement>,
) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const markdownStyle = useMarkdownStyle();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();
    const textRef = useRef<HTMLElement & RNText>(null);
    const textInput = useRef<AnimatedMarkdownTextInputRef | null>(null);
    const [numberOfLines, setNumberOfLines] = useState(numberOfLinesProp);
    const [selection, setSelection] = useState<
        | {
              start: number;
              end?: number;
          }
        | undefined
    >({
        start: selectionProp.start,
        end: selectionProp.end,
    });
    const [caretContent, setCaretContent] = useState('');
    const [valueBeforeCaret, setValueBeforeCaret] = useState('');
    const [textInputWidth, setTextInputWidth] = useState('');
    const [isRendered, setIsRendered] = useState(false);
    const isScrollBarVisible = useIsScrollBarVisible(textInput, value ?? '');
    const [prevScroll, setPrevScroll] = useState<number | undefined>();

    useEffect(() => {
        if (!shouldClear) {
            return;
        }
        textInput.current?.clear();
        setNumberOfLines(1);
        onClear();
    }, [shouldClear, onClear]);

    useEffect(() => {
        setSelection((prevSelection) => {
            if (!!prevSelection && selectionProp.start === prevSelection.start && selectionProp.end === prevSelection.end) {
                return;
            }
            return selectionProp;
        });
    }, [selectionProp]);

    /**
     *  Adds the cursor position to the selection change event.
     */
    const addCursorPositionToSelectionChange = (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
        const webEvent = event as BaseSyntheticEvent<TextInputSelectionChangeEventData>;

        if (shouldCalculateCaretPosition && isRendered) {
            // we do flushSync to make sure that the valueBeforeCaret is updated before we calculate the caret position to receive a proper position otherwise we will calculate position for the previous state
            flushSync(() => {
                setValueBeforeCaret(webEvent.target.value.slice(0, webEvent.nativeEvent.selection.start));
                setCaretContent(getNextChars(value ?? '', webEvent.nativeEvent.selection.start));
            });
            const selectionValue = {
                start: webEvent.nativeEvent.selection.start,
                end: webEvent.nativeEvent.selection.end,
                positionX: (textRef.current?.offsetLeft ?? 0) - CONST.SPACE_CHARACTER_WIDTH,
                positionY: textRef.current?.offsetTop,
            };

            onSelectionChange({
                ...webEvent,
                nativeEvent: {
                    ...webEvent.nativeEvent,
                    selection: selectionValue,
                },
            });
            setSelection(selectionValue);
        } else {
            onSelectionChange(webEvent);
            setSelection(webEvent.nativeEvent.selection);
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
                const isTargetInput = eventTarget?.nodeName === 'INPUT' || eventTarget?.nodeName === 'TEXTAREA' || eventTarget?.contentEditable === 'true';
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
                onPasteFile(event.clipboardData.files[0]);
                return true;
            }

            // If paste contains base64 image
            if (clipboardDataHtml?.includes(CONST.IMAGE_BASE64_MATCH)) {
                const domparser = new DOMParser();
                const pastedHTML = clipboardDataHtml;
                const embeddedImages = domparser.parseFromString(pastedHTML, TEXT_HTML)?.images;

                if (embeddedImages.length > 0 && embeddedImages[0].src) {
                    const src = embeddedImages[0].src;
                    const file = FileUtils.base64ToFile(src, 'image.png');
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

    /**
     * Check the current scrollHeight of the textarea (minus any padding) and
     * divide by line height to get the total number of rows for the textarea.
     */
    const updateNumberOfLines = useCallback(() => {
        if (!textInput.current) {
            return;
        }
        // we reset the height to 0 to get the correct scrollHeight
        textInput.current.style.height = '0';
        const computedStyle = window.getComputedStyle(textInput.current);
        const lineHeight = parseInt(computedStyle.lineHeight, 10) || 20;
        const paddingTopAndBottom = parseInt(computedStyle.paddingBottom, 10) + parseInt(computedStyle.paddingTop, 10);
        setTextInputWidth(computedStyle.width);

        const computedNumberOfLines = ComposerUtils.getNumberOfLines(lineHeight, paddingTopAndBottom, textInput.current.scrollHeight, maxLines);
        const generalNumberOfLines = computedNumberOfLines === 0 ? numberOfLinesProp : computedNumberOfLines;

        onNumberOfLinesChange(generalNumberOfLines);
        updateIsFullComposerAvailable({isFullComposerAvailable, setIsFullComposerAvailable}, generalNumberOfLines);
        setNumberOfLines(generalNumberOfLines);
        textInput.current.style.height = 'auto';
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, maxLines, numberOfLinesProp, onNumberOfLinesChange, isFullComposerAvailable, setIsFullComposerAvailable, windowWidth]);

    useEffect(() => {
        updateNumberOfLines();
    }, [updateNumberOfLines]);

    const currentNumberOfLines = useMemo(
        () => (isComposerFullSize ? undefined : numberOfLines),

        [isComposerFullSize, numberOfLines],
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
        if (!textInput.current || prevScroll === undefined) {
            return;
        }
        textInput.current.scrollTop = prevScroll;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isComposerFullSize]);

    useHtmlPaste(textInput, handlePaste, true);

    useEffect(() => {
        if (typeof ref === 'function') {
            ref(textInput.current);
        }
        setIsRendered(true);

        return () => {
            if (isReportActionCompose) {
                return;
            }
            ReportActionComposeFocusManager.clear();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleKeyPress = useCallback(
        (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
            // Prevent onKeyPress from being triggered if the Enter key is pressed while text is being composed
            if (!onKeyPress || isEnterWhileComposition(e as unknown as KeyboardEvent)) {
                return;
            }

            onKeyPress(e);
        },
        [onKeyPress],
    );

    const renderElementForCaretPosition = (
        <View
            style={{
                position: 'absolute',
                zIndex: -1,
                opacity: 0,
            }}
        >
            <Text style={[StyleSheet.flatten([style, styles.noSelect]), numberOfLines < maxLines ? styles.overflowHidden : {}, {maxWidth: textInputWidth as DimensionValue}]}>
                {`${valueBeforeCaret} `}
                <Text
                    numberOfLines={1}
                    ref={textRef}
                >
                    {`${caretContent}`}
                </Text>
            </Text>
        </View>
    );

    const scrollStyleMemo = useMemo(() => {
        if (shouldContainScroll) {
            return isScrollBarVisible ? [styles.overflowScroll, styles.overscrollBehaviorContain] : styles.overflowHidden;
        }
        return [
            // We are hiding the scrollbar to prevent it from reducing the text input width,
            // so we can get the correct scroll height while calculating the number of lines.
            numberOfLines < maxLines ? styles.overflowHidden : {},
        ];
    }, [shouldContainScroll, isScrollBarVisible, maxLines, numberOfLines, styles.overflowHidden, styles.overflowScroll, styles.overscrollBehaviorContain]);

    const inputStyleMemo = useMemo(
        () => [
            StyleSheet.flatten([style, {outline: 'none'}]),
            StyleUtils.getComposeTextAreaPadding(numberOfLines, isComposerFullSize),
            Browser.isMobileSafari() || Browser.isSafari() ? styles.rtlTextRenderForSafari : {},
            scrollStyleMemo,
            isComposerFullSize ? ({height: '100%', maxHeight: 'none' as DimensionValue} as TextStyle) : undefined,
        ],

        [numberOfLines, scrollStyleMemo, styles.rtlTextRenderForSafari, style, StyleUtils, isComposerFullSize],
    );

    return (
        <>
            <RNMarkdownTextInput
                autoComplete="off"
                autoCorrect={!Browser.isMobileSafari()}
                placeholderTextColor={theme.placeholderText}
                ref={(el) => (textInput.current = el)}
                selection={selection}
                style={inputStyleMemo}
                markdownStyle={markdownStyle}
                value={value}
                defaultValue={defaultValue}
                autoFocus={autoFocus}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...props}
                onSelectionChange={addCursorPositionToSelectionChange}
                numberOfLines={currentNumberOfLines}
                disabled={isDisabled}
                onKeyPress={handleKeyPress}
                onFocus={(e) => {
                    ReportActionComposeFocusManager.onComposerFocus(() => {
                        if (!textInput.current) {
                            return;
                        }

                        textInput.current.focus();
                    });

                    props.onFocus?.(e);
                }}
            />
            {shouldCalculateCaretPosition && renderElementForCaretPosition}
        </>
    );
}

Composer.displayName = 'Composer';

export default React.forwardRef(Composer);
