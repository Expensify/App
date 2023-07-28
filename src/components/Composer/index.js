import React, {useState, useRef, useEffect, useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import {flushSync} from 'react-dom';
import RNTextInput from '../RNTextInput';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Growl from '../../libs/Growl';
import themeColors from '../../styles/themes/default';
import updateIsFullComposerAvailable from '../../libs/ComposerUtils/updateIsFullComposerAvailable';
import * as ComposerUtils from '../../libs/ComposerUtils';
import * as Browser from '../../libs/Browser';
import * as StyleUtils from '../../styles/StyleUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import compose from '../../libs/compose';
import styles from '../../styles/styles';
import Text from '../Text';
import isEnterWhileComposition from '../../libs/KeyboardShortcut/isEnterWhileComposition';
import CONST from '../../CONST';
import withNavigation from '../withNavigation';

const propTypes = {
    /** Maximum number of lines in the text input */
    maxLines: PropTypes.number,

    /** The default value of the comment box */
    defaultValue: PropTypes.string,

    /** The value of the comment box */
    value: PropTypes.string,

    /** Number of lines for the comment */
    numberOfLines: PropTypes.number,

    /** Callback method to update number of lines for the comment */
    onNumberOfLinesChange: PropTypes.func,

    /** Callback method to handle pasting a file */
    onPasteFile: PropTypes.func,

    /** A ref to forward to the text input */
    forwardedRef: PropTypes.func,

    /** General styles to apply to the text input */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    /** If the input should clear, it actually gets intercepted instead of .clear() */
    shouldClear: PropTypes.bool,

    /** When the input has cleared whoever owns this input should know about it */
    onClear: PropTypes.func,

    /** Whether or not this TextInput is disabled. */
    isDisabled: PropTypes.bool,

    /** Set focus to this component the first time it renders.
    Override this in case you need to set focus on one field out of many, or when you want to disable autoFocus */
    autoFocus: PropTypes.bool,

    /** Update selection position on change */
    onSelectionChange: PropTypes.func,

    /** Selection Object */
    selection: PropTypes.shape({
        start: PropTypes.number,
        end: PropTypes.number,
    }),

    /** Whether the full composer can be opened */
    isFullComposerAvailable: PropTypes.bool,

    /** Allow the full composer to be opened */
    setIsFullComposerAvailable: PropTypes.func,

    /** Whether the composer is full size */
    isComposerFullSize: PropTypes.bool,

    /** Should we calculate the caret position */
    shouldCalculateCaretPosition: PropTypes.bool,

    /** Function to check whether composer is covered up or not */
    checkComposerVisibility: PropTypes.func,

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    defaultValue: undefined,
    value: undefined,
    numberOfLines: undefined,
    onNumberOfLinesChange: () => {},
    maxLines: -1,
    onPasteFile: () => {},
    shouldClear: false,
    onClear: () => {},
    style: null,
    isDisabled: false,
    autoFocus: false,
    forwardedRef: null,
    onSelectionChange: () => {},
    selection: {
        start: 0,
        end: 0,
    },
    isFullComposerAvailable: false,
    setIsFullComposerAvailable: () => {},
    isComposerFullSize: false,
    shouldCalculateCaretPosition: false,
    checkComposerVisibility: () => false,
};

const IMAGE_EXTENSIONS = {
    'image/bmp': 'bmp',
    'image/gif': 'gif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/svg+xml': 'svg',
    'image/tiff': 'tiff',
    'image/webp': 'webp',
};

// Get characters from the cursor to the next space or new line
const getNextChars = (str, cursorPos) => {
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
function Composer({onKeyPress, style, ...props}) {
    const textRef = useRef(null);
    const textInput = useRef(null);
    const initialValue = props.defaultValue ? `${props.defaultValue}` : `${props.value || ''}`;
    const [numberOfLines, setNumberOfLines] = useState(props.numberOfLines);
    const [selection, setSelection] = useState({
        start: initialValue.length,
        end: initialValue.length,
    });
    const [caretContent, setCaretContent] = useState('');
    const [valueBeforeCaret, setValueBeforeCaret] = useState('');
    const [textInputWidth, setTextInputWidth] = useState('');

    useEffect(() => {
        if (!props.shouldClear) {
            return;
        }
        textInput.current.clear();
        setNumberOfLines(1);
        props.onClear();
    }, [props.shouldClear]);

    useEffect(() => {
        setSelection(props.selection);
    }, [props.selection]);

    /**
     *  Adds the cursor position to the selection change event.
     *
     * @param {Event} event
     */
    const addCursorPositionToSelectionChange = (event) => {
        flushSync(() => {
            setValueBeforeCaret(event.target.value.slice(0, event.nativeEvent.selection.start));
            setCaretContent(getNextChars(props.value, event.nativeEvent.selection.start));
        });

        props.onSelectionChange({
            nativeEvent: {
                selection: {
                    start: event.nativeEvent.selection.start,
                    end: event.nativeEvent.selection.end,
                    positionX: textRef.current.offsetLeft - CONST.SPACE_CHARACTER_WIDTH,
                    positionY: textRef.current.offsetTop,
                },
            },
        });
    };

    // /**
    //  * Set pasted text to clipboard
    //  * @param {String} text
    //  */
    const paste = useCallback((text) => {
        try {
            document.execCommand('insertText', false, text);
            // Pointer will go out of sight when a large paragraph is pasted on the web. Refocusing the input keeps the cursor in view.
            textInput.current.blur();
            textInput.current.focus();
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
     * Check the paste event for an attachment, parse the data and call onPasteFile from props with the selected file,
     * Otherwise, convert pasted HTML to Markdown and set it on the composer.
     *
     * @param {ClipboardEvent} event
     */
    const handlePaste = useCallback(
        (event) => {
            const isVisible = props.checkComposerVisibility();
            const isFocused = textInput.current.isFocused();

            if (!(isVisible || isFocused)) {
                return;
            }

            if (textInput.current !== event.target) {
                return;
            }

            event.preventDefault();

            const {files, types} = event.clipboardData;
            const TEXT_HTML = 'text/html';

            // If paste contains files, then trigger file management
            if (files.length > 0) {
                // Prevent the default so we do not post the file name into the text box
                props.onPasteFile(event.clipboardData.files[0]);
                return;
            }

            // If paste contains HTML
            if (types.includes(TEXT_HTML)) {
                const pastedHTML = event.clipboardData.getData(TEXT_HTML);

                const domparser = new DOMParser();
                const embeddedImages = domparser.parseFromString(pastedHTML, TEXT_HTML).images;

                // If HTML has img tag, then fetch images from it.
                if (embeddedImages.length > 0 && embeddedImages[0].src) {
                    // If HTML has emoji, then treat this as plain text.
                    if (embeddedImages[0].dataset && embeddedImages[0].dataset.stringifyType === 'emoji') {
                        const plainText = event.clipboardData.getData('text/plain');
                        paste(plainText);
                        return;
                    }
                    fetch(embeddedImages[0].src)
                        .then((response) => {
                            if (!response.ok) {
                                throw Error(response.statusText);
                            }
                            return response.blob();
                        })
                        .then((x) => {
                            const extension = IMAGE_EXTENSIONS[x.type];
                            if (!extension) {
                                throw new Error(props.translate('composer.noExtensionFoundForMimeType'));
                            }

                            return new File([x], `pasted_image.${extension}`, {});
                        })
                        .then(props.onPasteFile)
                        .catch(() => {
                            const errorDesc = props.translate('composer.problemGettingImageYouPasted');
                            Growl.error(errorDesc);

                            /*
                             * Since we intercepted the user-triggered paste event to check for attachments,
                             * we need to manually set the value and call the `onChangeText` handler.
                             * Synthetically-triggered paste events do not affect the document's contents.
                             * See https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event for more details.
                             */
                            handlePastedHTML(pastedHTML);
                        });
                    return;
                }

                handlePastedHTML(pastedHTML);
                return;
            }

            const plainText = event.clipboardData.getData('text/plain');

            paste(plainText);
        },
        [props.onPasteFile, props.translate, paste, handlePastedHTML],
    );

    /**
     * Manually scrolls the text input, then prevents the event from being passed up to the parent.
     * @param {Object} event native Event
     */
    const handleWheel = useCallback((event) => {
        if (event.target !== document.activeElement) {
            return;
        }

        textInput.current.scrollTop += event.deltaY;
        event.preventDefault();
        event.stopPropagation();
    }, []);

    useEffect(() => {
        if (textInput.current === null) {
            return;
        }
        updateIsFullComposerAvailable(props, props.numberOfLines);

        // we reset the height to 0 to get the correct scrollHeight
        textInput.current.style.height = 0;
        const computedStyle = window.getComputedStyle(textInput.current);
        const lineHeight = parseInt(computedStyle.lineHeight, 10) || 20;
        const paddingTopAndBottom = parseInt(computedStyle.paddingBottom, 10) + parseInt(computedStyle.paddingTop, 10);
        setTextInputWidth(computedStyle.width);

        const computedNumberOfLines = ComposerUtils.getNumberOfLines(props.maxLines, lineHeight, paddingTopAndBottom, textInput.current.scrollHeight);
        const generalNumberOfLines = computedNumberOfLines === 0 ? props.numberOfLines : computedNumberOfLines;

        props.onNumberOfLinesChange(generalNumberOfLines);
        updateIsFullComposerAvailable(props, generalNumberOfLines);
        setNumberOfLines(generalNumberOfLines);
        textInput.current.style.height = 'auto';
    }, [props.value, props.maxLines, props.numberOfLines, props.isComposerFullSize]);

    const handleKeyPress = useCallback(
        (e) => {
            // Prevent onKeyPress from being triggered if the Enter key is pressed while text is being composed
            if (!onKeyPress || isEnterWhileComposition(e)) {
                return;
            }
            onKeyPress(e);
        },
        [onKeyPress],
    );

    /**
     * Set the TextInput Ref
     *
     * @param {Element} el
     */
    const setTextInputRef = useCallback((el) => {
        textInput.current = el;

        if (_.isFunction(props.forwardedRef)) {
            props.forwardedRef(textInput.current);
        }

        if (textInput.current) {
            textInput.current.addEventListener('paste', handlePaste);
            textInput.current.addEventListener('wheel', handleWheel);
        }
    }, []);

    useEffect(() => {
        // we need to handle listeners on navigation focus/blur as Composer is not unmounting
        // when navigating away to different report
        const unsubscribeFocus = props.navigation.addListener('focus', () => document.addEventListener('paste', handlePaste));
        const unsubscribeBlur = props.navigation.addListener('blur', () => document.removeEventListener('paste', handlePaste));

        return () => {
            unsubscribeFocus();
            unsubscribeBlur();
            document.removeEventListener('paste', handlePaste);
            textInput.current.removeEventListener('wheel', handleWheel);
        };
    }, []);

    const renderElementForCaretPosition = (
        <View
            style={{
                position: 'absolute',
                bottom: -2000,
                zIndex: -1,
                opacity: 0,
            }}
        >
            <Text
                multiline
                style={[StyleSheet.flatten([style, styles.noSelect]), numberOfLines < props.maxLines ? styles.overflowHidden : {}, {maxWidth: textInputWidth}]}
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

    return (
        <>
            <RNTextInput
                autoComplete="off"
                autoCorrect={!Browser.isMobileSafari()}
                placeholderTextColor={themeColors.placeholderText}
                ref={setTextInputRef}
                selection={selection}
                style={[
                    StyleSheet.flatten([style, {outline: 'none'}]),

                    // We are hiding the scrollbar to prevent it from reducing the text input width,
                    // so we can get the correct scroll height while calculating the number of lines.
                    numberOfLines < props.maxLines ? styles.overflowHidden : {},
                    StyleUtils.getComposeTextAreaPadding(props.numberOfLines),
                ]}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...props}
                onSelectionChange={addCursorPositionToSelectionChange}
                numberOfLines={numberOfLines}
                disabled={props.isDisabled}
                onKeyPress={handleKeyPress}
            />
            {props.shouldCalculateCaretPosition && renderElementForCaretPosition}
        </>
    );
}

Composer.propTypes = propTypes;
Composer.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withNavigation,
)(
    React.forwardRef((props, ref) => (
        <Composer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    )),
);
