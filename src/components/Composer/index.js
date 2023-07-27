import React from 'react';
import {StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
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

/**
 * Enable Markdown parsing.
 * On web we like to have the Text Input field always focused so the user can easily type a new chat
 */
class Composer extends React.Component {
    constructor(props) {
        super(props);

        const initialValue = props.defaultValue ? `${props.defaultValue}` : `${props.value || ''}`;

        this.state = {
            numberOfLines: props.numberOfLines,
            selection: {
                start: initialValue.length,
                end: initialValue.length,
            },
            valueBeforeCaret: '',
        };

        this.paste = this.paste.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
        this.handlePastedHTML = this.handlePastedHTML.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.shouldCallUpdateNumberOfLines = this.shouldCallUpdateNumberOfLines.bind(this);
        this.addCursorPositionToSelectionChange = this.addCursorPositionToSelectionChange.bind(this);
        this.textRef = React.createRef(null);
        this.unsubscribeBlur = () => null;
        this.unsubscribeFocus = () => null;
    }

    componentDidMount() {
        this.updateNumberOfLines();

        // This callback prop is used by the parent component using the constructor to
        // get a ref to the inner textInput element e.g. if we do
        // <constructor ref={el => this.textInput = el} /> this will not
        // return a ref to the component, but rather the HTML element by default
        if (this.props.forwardedRef && _.isFunction(this.props.forwardedRef)) {
            this.props.forwardedRef(this.textInput);
        }

        // There is no onPaste or onDrag for TextInput in react-native so we will add event
        // listeners here and unbind when the component unmounts
        if (this.textInput) {
            this.textInput.addEventListener('wheel', this.handleWheel);

            // we need to handle listeners on navigation focus/blur as Composer is not unmounting
            // when navigating away to different report
            this.unsubscribeFocus = this.props.navigation.addListener('focus', () => document.addEventListener('paste', this.handlePaste));
            this.unsubscribeBlur = this.props.navigation.addListener('blur', () => document.removeEventListener('paste', this.handlePaste));

            // We need to add paste listener manually as well as navigation focus event is not triggered on component mount
            document.addEventListener('paste', this.handlePaste);
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.shouldClear && this.props.shouldClear) {
            this.textInput.clear();
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({numberOfLines: 1});
            this.props.onClear();
        }

        if (
            prevProps.value !== this.props.value ||
            prevProps.defaultValue !== this.props.defaultValue ||
            prevProps.isComposerFullSize !== this.props.isComposerFullSize ||
            prevProps.windowWidth !== this.props.windowWidth ||
            prevProps.numberOfLines !== this.props.numberOfLines
        ) {
            this.updateNumberOfLines();
        }

        if (prevProps.selection !== this.props.selection) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({selection: this.props.selection});
        }
    }

    componentWillUnmount() {
        if (!this.textInput) {
            return;
        }

        document.removeEventListener('paste', this.handlePaste);
        this.unsubscribeFocus();
        this.unsubscribeBlur();
        this.textInput.removeEventListener('wheel', this.handleWheel);
    }

    // Get characters from the cursor to the next space or new line
    getNextChars(str, cursorPos) {
        // Get the substring starting from the cursor position
        const substr = str.substring(cursorPos);

        // Find the index of the next space or new line character
        const spaceIndex = substr.search(/[ \n]/);

        if (spaceIndex === -1) {
            return substr;
        }

        // If there is a space or new line, return the substring up to the space or new line
        return substr.substring(0, spaceIndex);
    }

    /**
     *  Adds the cursor position to the selection change event.
     *
     * @param {Event} event
     */
    addCursorPositionToSelectionChange(event) {
        if (this.props.shouldCalculateCaretPosition) {
            const newValueBeforeCaret = event.target.value.slice(0, event.nativeEvent.selection.start);

            this.setState(
                {
                    valueBeforeCaret: newValueBeforeCaret,
                    caretContent: this.getNextChars(this.props.value, event.nativeEvent.selection.start),
                },

                () => {
                    const customEvent = {
                        nativeEvent: {
                            selection: {
                                start: event.nativeEvent.selection.start,
                                end: event.nativeEvent.selection.end,
                                positionX: this.textRef.current.offsetLeft - CONST.SPACE_CHARACTER_WIDTH,
                                positionY: this.textRef.current.offsetTop,
                            },
                        },
                    };
                    this.props.onSelectionChange(customEvent);
                },
            );
            return;
        }

        this.props.onSelectionChange(event);
    }

    // Prevent onKeyPress from being triggered if the Enter key is pressed while text is being composed
    handleKeyPress(e) {
        if (!this.props.onKeyPress || isEnterWhileComposition(e)) {
            return;
        }
        this.props.onKeyPress(e);
    }

    /**
     * Set pasted text to clipboard
     * @param {String} text
     */
    paste(text) {
        try {
            this.textInput.focus();
            document.execCommand('insertText', false, text);
            this.updateNumberOfLines();

            // Pointer will go out of sight when a large paragraph is pasted on the web. Refocusing the input keeps the cursor in view.
            this.textInput.blur();
            this.textInput.focus();
            // eslint-disable-next-line no-empty
        } catch (e) {}
    }

    /**
     * Manually place the pasted HTML into Composer
     *
     * @param {String} html - pasted HTML
     */
    handlePastedHTML(html) {
        const parser = new ExpensiMark();
        this.paste(parser.htmlToMarkdown(html));
    }

    /**
     * Check the paste event for an attachment, parse the data and call onPasteFile from props with the selected file,
     * Otherwise, convert pasted HTML to Markdown and set it on the composer.
     *
     * @param {ClipboardEvent} event
     */
    handlePaste(event) {
        const isVisible = this.props.checkComposerVisibility();
        const isFocused = this.textInput.isFocused();

        if (!(isVisible || isFocused)) {
            return;
        }

        if (this.textInput !== event.target) {
            return;
        }

        event.preventDefault();

        const {files, types} = event.clipboardData;
        const TEXT_HTML = 'text/html';

        // If paste contains files, then trigger file management
        if (files.length > 0) {
            // Prevent the default so we do not post the file name into the text box
            this.props.onPasteFile(event.clipboardData.files[0]);
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
                    this.paste(plainText);
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
                            throw new Error(this.props.translate('composer.noExtensionFoundForMimeType'));
                        }

                        return new File([x], `pasted_image.${extension}`, {});
                    })
                    .then(this.props.onPasteFile)
                    .catch(() => {
                        const errorDesc = this.props.translate('composer.problemGettingImageYouPasted');
                        Growl.error(errorDesc);

                        /*
                         * Since we intercepted the user-triggered paste event to check for attachments,
                         * we need to manually set the value and call the `onChangeText` handler.
                         * Synthetically-triggered paste events do not affect the document's contents.
                         * See https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event for more details.
                         */
                        this.handlePastedHTML(pastedHTML);
                    });
                return;
            }

            this.handlePastedHTML(pastedHTML);
            return;
        }

        const plainText = event.clipboardData.getData('text/plain');

        this.paste(plainText);
    }

    /**
     * Manually scrolls the text input, then prevents the event from being passed up to the parent.
     * @param {Object} event native Event
     */
    handleWheel(event) {
        if (event.target !== document.activeElement) {
            return;
        }

        this.textInput.scrollTop += event.deltaY;
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * We want to call updateNumberOfLines only when the parent doesn't provide value in props
     * as updateNumberOfLines is already being called when value changes in componentDidUpdate
     */
    shouldCallUpdateNumberOfLines() {
        if (!_.isEmpty(this.props.value)) {
            return;
        }

        this.updateNumberOfLines();
    }

    /**
     * Check the current scrollHeight of the textarea (minus any padding) and
     * divide by line height to get the total number of rows for the textarea.
     */
    updateNumberOfLines() {
        // Hide the composer expand button so we can get an accurate reading of
        // the height of the text input
        this.props.setIsFullComposerAvailable(false);

        // We have to reset the rows back to the minimum before updating so that the scrollHeight is not
        // affected by the previous row setting. If we don't, rows will be added but not removed on backspace/delete.
        this.setState({numberOfLines: 1}, () => {
            const computedStyle = window.getComputedStyle(this.textInput);
            const lineHeight = parseInt(computedStyle.lineHeight, 10) || 20;
            const paddingTopAndBottom = parseInt(computedStyle.paddingBottom, 10) + parseInt(computedStyle.paddingTop, 10);
            const computedNumberOfLines = ComposerUtils.getNumberOfLines(this.props.maxLines, lineHeight, paddingTopAndBottom, this.textInput.scrollHeight);
            const numberOfLines = computedNumberOfLines === 0 ? this.props.numberOfLines : computedNumberOfLines;
            updateIsFullComposerAvailable(this.props, numberOfLines);
            this.setState({
                numberOfLines,
                width: computedStyle.width,
            });
            this.props.onNumberOfLinesChange(numberOfLines);
        });
    }

    render() {
        const propStyles = StyleSheet.flatten(this.props.style);
        propStyles.outline = 'none';
        const propsWithoutStyles = _.omit(this.props, 'style');

        // This code creates a hidden text component that helps track the caret position in the visible input.
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
                    style={[propStyles, this.state.numberOfLines < this.props.maxLines ? styles.overflowHidden : {}, {maxWidth: this.state.width}]}
                >
                    {`${this.state.valueBeforeCaret} `}
                    <Text
                        numberOfLines={1}
                        ref={this.textRef}
                    >
                        {`${this.state.caretContent}`}
                    </Text>
                </Text>
            </View>
        );

        // We're disabling autoCorrect for iOS Safari until Safari fixes this issue. See https://github.com/Expensify/App/issues/8592
        return (
            <>
                <RNTextInput
                    autoComplete="off"
                    autoCorrect={!Browser.isMobileSafari()}
                    placeholderTextColor={themeColors.placeholderText}
                    ref={(el) => (this.textInput = el)}
                    selection={this.state.selection}
                    onChange={this.shouldCallUpdateNumberOfLines}
                    style={[
                        propStyles,

                        // We are hiding the scrollbar to prevent it from reducing the text input width,
                        // so we can get the correct scroll height while calculating the number of lines.
                        this.state.numberOfLines < this.props.maxLines ? styles.overflowHidden : {},
                        StyleUtils.getComposeTextAreaPadding(this.props.numberOfLines),
                    ]}
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    {...propsWithoutStyles}
                    onSelectionChange={this.addCursorPositionToSelectionChange}
                    numberOfLines={this.state.numberOfLines}
                    disabled={this.props.isDisabled}
                    onKeyPress={this.handleKeyPress}
                />
                {this.props.shouldCalculateCaretPosition && renderElementForCaretPosition}
            </>
        );
    }
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
