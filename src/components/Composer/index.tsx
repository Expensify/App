import {useNavigation} from '@react-navigation/native';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import React, {BaseSyntheticEvent, ForwardedRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import {
    DimensionValue,
    NativeSyntheticEvent,
    Text as RNText,
    StyleProp,
    StyleSheet,
    TextInput,
    TextInputFocusEventData,
    TextInputKeyPressEventData,
    TextInputProps,
    TextInputSelectionChangeEventData,
    TextStyle,
    View,
} from 'react-native';
import {AnimatedProps} from 'react-native-reanimated';
import RNTextInput from '@components/RNTextInput';
import Text from '@components/Text';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import * as ComposerUtils from '@libs/ComposerUtils';
import updateIsFullComposerAvailable from '@libs/ComposerUtils/updateIsFullComposerAvailable';
import isEnterWhileComposition from '@libs/KeyboardShortcut/isEnterWhileComposition';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

type ComposerProps = {
    /** Maximum number of lines in the text input */
    maxLines?: number;

    /** The default value of the comment box */
    defaultValue?: string;

    /** The value of the comment box */
    value?: string;

    /** Number of lines for the comment */
    numberOfLines?: number;

    /** Callback method to update number of lines for the comment */
    onNumberOfLinesChange?: (numberOfLines: number) => void;

    /** Callback method to handle pasting a file */
    onPasteFile?: (file?: File) => void;

    /** General styles to apply to the text input */
    // eslint-disable-next-line react/forbid-prop-types
    style?: StyleProp<TextStyle>;

    /** If the input should clear, it actually gets intercepted instead of .clear() */
    shouldClear?: boolean;

    /** When the input has cleared whoever owns this input should know about it */
    onClear?: () => void;

    /** Whether or not this TextInput is disabled. */
    isDisabled?: boolean;

    /** Set focus to this component the first time it renders.
  Override this in case you need to set focus on one field out of many, or when you want to disable autoFocus */
    autoFocus?: boolean;

    /** Update selection position on change */
    onSelectionChange?: (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => void;

    /** Selection Object */
    selection?: {
        start: number;
        end?: number;
    };

    /** Whether the full composer can be opened */
    isFullComposerAvailable?: boolean;

    /** Allow the full composer to be opened */
    setIsFullComposerAvailable?: () => void;

    /** Should we calculate the caret position */
    shouldCalculateCaretPosition?: boolean;

    /** Function to check whether composer is covered up or not */
    checkComposerVisibility?: () => boolean;

    /** Whether this is the report action compose */
    isReportActionCompose?: boolean;

    /** Whether the sull composer is open */
    isComposerFullSize?: boolean;

    onKeyPress?: (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;

    onFocus?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
};

/**
 * Retrieves the characters from the specified cursor position up to the next space or new line.
 *
 * @param str - The input string.
 * @param cursorPos - The position of the cursor within the input string.
 * @returns - The substring from the cursor position up to the next space or new line.
 *                     If no space or new line is found, returns the substring from the cursor position to the end of the input string.
 */
const getNextChars = (str: string, cursorPos: number) => {
    // Get the substring starting from the cursor position
    const substr = str.substring(cursorPos);

    // Find the index of the next space or new line character
    const spaceIndex = substr.search(/[ \n]/);

    if (spaceIndex === -1) {
        return substr;
    }

    // If there is a space or new line, return the substring up to the space or new line
    return substr.substring(0, spaceIndex);
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
        ...props
    }: ComposerProps,
    ref: ForwardedRef<React.Component<AnimatedProps<TextInputProps>>>,
) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const navigation = useNavigation();
    const textRef = useRef<HTMLElement & RNText>(null);
    const textInput = useRef<HTMLTextAreaElement & TextInput>();
    const initialValue = defaultValue ? `${defaultValue}` : `${value ?? ''}`;
    const [numberOfLines, setNumberOfLines] = useState(numberOfLinesProp);
    const [selection, setSelection] = useState<
        | {
              start: number;
              end?: number;
          }
        | undefined
    >({
        start: initialValue.length,
        end: initialValue.length,
    });
    const [caretContent, setCaretContent] = useState('');
    const [valueBeforeCaret, setValueBeforeCaret] = useState('');
    const [textInputWidth, setTextInputWidth] = useState('');

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
                return prevSelection;
            }
            return selectionProp;
        });
    }, [selectionProp]);

    /**
     *  Adds the cursor position to the selection change event.
     *
     * @param event
     */
    const addCursorPositionToSelectionChange = (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
        const webEvent = event as BaseSyntheticEvent<TextInputSelectionChangeEventData>;

        if (shouldCalculateCaretPosition) {
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
     * Set pasted text to clipboard
     * @param {String} text
     */
    const paste = useCallback((text?: string) => {
        try {
            document.execCommand('insertText', false, text);
            // Pointer will go out of sight when a large paragraph is pasted on the web. Refocusing the input keeps the cursor in view.
            textInput.current?.blur();
            textInput.current?.focus();
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
            paste(plainText);
        },
        [paste],
    );

    /**
     * Check the paste event for an attachment, parse the data and call onPasteFile from props with the selected file,
     * Otherwise, convert pasted HTML to Markdown and set it on the composer.
     */
    const handlePaste = useCallback(
        (event: ClipboardEvent) => {
            const isVisible = checkComposerVisibility();
            const isFocused = textInput.current?.isFocused();

            if (!(isVisible || isFocused)) {
                return;
            }

            if (textInput.current !== event.target) {
                const eventTarget = event.target as HTMLInputElement | HTMLTextAreaElement | null;

                // To make sure the composer does not capture paste events from other inputs, we check where the event originated
                // If it did originate in another input, we return early to prevent the composer from handling the paste
                const isTargetInput = eventTarget?.nodeName === 'INPUT' || eventTarget?.nodeName === 'TEXTAREA' || eventTarget?.contentEditable === 'true';
                if (isTargetInput) {
                    return;
                }

                textInput.current?.focus();
            }

            event.preventDefault();

            const TEXT_HTML = 'text/html';

            // If paste contains files, then trigger file management
            if (event.clipboardData?.files.length && event.clipboardData.files.length > 0) {
                // Prevent the default so we do not post the file name into the text box
                onPasteFile(event.clipboardData?.files[0]);
                return;
            }

            // If paste contains HTML
            if (event.clipboardData?.types.includes(TEXT_HTML)) {
                const pastedHTML = event.clipboardData?.getData(TEXT_HTML);

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
        [onPasteFile, handlePastedHTML, checkComposerVisibility, handlePastePlainText],
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

    useEffect(() => {
        // we need to handle listeners on navigation focus/blur as Composer is not unmounting
        // when navigating away to different report
        const unsubscribeFocus = navigation.addListener('focus', () => document.addEventListener('paste', handlePaste));
        const unsubscribeBlur = navigation.addListener('blur', () => document.removeEventListener('paste', handlePaste));

        if (typeof ref === 'function' && textInput.current) {
            ref(textInput.current);
        }

        if (textInput.current) {
            document.addEventListener('paste', handlePaste);
        }

        return () => {
            if (!isReportActionCompose) {
                ReportActionComposeFocusManager.clear();
            }
            unsubscribeFocus();
            unsubscribeBlur();
            document.removeEventListener('paste', handlePaste);
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
            <Text
                multiline
                style={[StyleSheet.flatten([style, styles.noSelect]), numberOfLines < maxLines ? styles.overflowHidden : {}, {maxWidth: textInputWidth as DimensionValue}]}
            >
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

    // const inputStyleMemo: StyleProp<AnimatedStyle<StyleProp<TextStyle>>> = useMemo(
    const inputStyleMemo: StyleProp<TextStyle> = useMemo(
        () => [
            // We are hiding the scrollbar to prevent it from reducing the text input width,
            // so we can get the correct scroll height while calculating the number of lines.
            numberOfLines < maxLines ? styles.overflowHidden : {},

            StyleSheet.flatten([style, {outline: 'none'}]),
            StyleUtils.getComposeTextAreaPadding(numberOfLines, isComposerFullSize),
            Browser.isMobileSafari() || Browser.isSafari() ? styles.rtlTextRenderForSafari : {},
        ],

        [numberOfLines, maxLines, styles.overflowHidden, styles.rtlTextRenderForSafari, style, isComposerFullSize],
    );

    return (
        <>
            <RNTextInput
                autoComplete="off"
                autoCorrect={!Browser.isMobileSafari()}
                placeholderTextColor={theme.placeholderText}
                ref={(el: TextInput & HTMLTextAreaElement) => (textInput.current = el)}
                selection={selection}
                style={inputStyleMemo}
                value={value}
                defaultValue={defaultValue}
                autoFocus={autoFocus}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...props}
                onSelectionChange={addCursorPositionToSelectionChange}
                rows={numberOfLines}
                disabled={isDisabled}
                onKeyPress={handleKeyPress}
                onFocus={(e) => {
                    ReportActionComposeFocusManager.onComposerFocus(() => {
                        if (!textInput.current) {
                            return;
                        }

                        textInput.current.focus();
                    });
                    if (props?.onFocus) {
                        props.onFocus(e);
                    }
                }}
            />
            {shouldCalculateCaretPosition && renderElementForCaretPosition}
        </>
    );
}

Composer.displayName = 'Composer';

const ComposerWithRef = React.forwardRef(Composer);

export default ComposerWithRef;
