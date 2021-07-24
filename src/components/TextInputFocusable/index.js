import React from 'react';
import {TextInput, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Growl from '../../libs/Growl';
import themeColors from '../../styles/themes/default';
import CONST from '../../CONST';

const propTypes = {
    /** Maximum number of lines in the text input */
    maxLines: PropTypes.number,

    /** The default value of the comment box */
    defaultValue: PropTypes.string,

    /** The value of the comment box */
    value: PropTypes.string,

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

    /** Callback to fire when a file has being dragged over the text input & report body */
    onDragOver: PropTypes.func,

    /** Callback to fire when a file has been dragged into the text input & report body */
    onDragEnter: PropTypes.func,

    /** Callback to fire when the user is no longer dragging over the text input & report body */
    onDragLeave: PropTypes.func,

    /** Callback to fire when a file is dropped on the text input & report body */
    onDrop: PropTypes.func,

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

    ...withLocalizePropTypes,
};

const defaultProps = {
    defaultValue: undefined,
    value: undefined,
    maxLines: -1,
    onPasteFile: () => {},
    shouldClear: false,
    onClear: () => {},
    style: null,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {},
    onDrop: () => {},
    isDisabled: false,
    autoFocus: false,
    forwardedRef: null,
    onSelectionChange: () => {},
    selection: {
        start: 0,
        end: 0,
    },
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
 * On web we like to have the Text Input field always focused so the user can easily type a new chat
 */
class TextInputFocusable extends React.Component {
    constructor(props) {
        super(props);

        const initialValue = props.defaultValue
            ? `${props.defaultValue}`
            : `${props.value || ''}`;

        this.state = {
            numberOfLines: 1,
            selection: {
                start: initialValue.length,
                end: initialValue.length,
            },
        };
        this.selection = {
            start: initialValue.length,
            end: initialValue.length,
        };
        this.saveSelection = this.saveSelection.bind(this);
        this.dragNDropListener = this.dragNDropListener.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
        this.handlePastedHTML = this.handlePastedHTML.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
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
            // Firefox will not allow dropping unless we call preventDefault on the dragover event
            // We listen on document to extend the Drop area beyond Composer
            document.addEventListener('dragover', this.dragNDropListener);
            document.addEventListener('dragenter', this.dragNDropListener);
            document.addEventListener('dragleave', this.dragNDropListener);
            document.addEventListener('drop', this.dragNDropListener);
            this.textInput.addEventListener('paste', this.handlePaste);
            this.textInput.addEventListener('wheel', this.handleWheel);
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.shouldClear && this.props.shouldClear) {
            this.textInput.clear();
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({numberOfLines: 1});
            this.props.onClear();
        }
        if (prevProps.defaultValue !== this.props.defaultValue) {
            this.updateNumberOfLines();
        }

        if (prevProps.selection !== this.props.selection) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({selection: this.props.selection});
        }
    }

    componentWillUnmount() {
        if (this.textInput) {
            document.removeEventListener('dragover', this.dragNDropListener);
            document.removeEventListener('dragenter', this.dragNDropListener);
            document.removeEventListener('dragleave', this.dragNDropListener);
            document.removeEventListener('drop', this.dragNDropListener);
            this.textInput.removeEventListener('paste', this.handlePaste);
            this.textInput.removeEventListener('wheel', this.handleWheel);
        }
    }

    /**
     * Calculates the max number of lines the text input can have
     *
     * @param {Number} lineHeight
     * @param {Number} paddingTopAndBottom
     * @param {Number} scrollHeight
     *
     * @returns {Number}
     */
    getNumberOfLines(lineHeight, paddingTopAndBottom, scrollHeight) {
        const maxLines = this.props.maxLines;
        let newNumberOfLines = Math.ceil((scrollHeight - paddingTopAndBottom) / lineHeight);
        newNumberOfLines = maxLines <= 0 ? newNumberOfLines : Math.min(newNumberOfLines, maxLines);
        return newNumberOfLines;
    }

    /**
     * Handles all types of drag-N-drop events on the composer
     *
     * @param {Object} e native Event
     * @memberof TextInputFocusable
     */
    dragNDropListener(e) {
        let isOriginComposer = false;
        const handler = () => {
            switch (e.type) {
                case 'dragover':
                    e.preventDefault();
                    this.props.onDragOver(e, isOriginComposer);
                    break;
                case 'dragenter':
                    e.dataTransfer.dropEffect = 'copy';
                    this.props.onDragEnter(e, isOriginComposer);
                    break;
                case 'dragleave':
                    this.props.onDragLeave(e, isOriginComposer);
                    break;
                case 'drop':
                    this.props.onDrop(e, isOriginComposer);
                    break;
                default: break;
            }
        };

        // We first check if drop target is composer so that it can be highlighted
        if (this.textInput.contains(e.target)) {
            isOriginComposer = true;
            handler();
            return;
        }

        if (document.getElementById(CONST.REPORT.DROP_NATIVE_ID).contains(e.target)) {
            handler();
        }
    }

    /**
     * Keeps track of user cursor position on the Composer
     *
     * @param {{nativeEvent: {selection: any}}} event
     * @memberof TextInputFocusable
     */
    saveSelection(event) {
        this.selection = event.nativeEvent.selection;
        this.props.onSelectionChange(event);
    }

    /**
     * Manually place the pasted HTML into Composer
     *
     * @param {String} html - pasted HTML
     * @memberof TextInputFocusable
     */
    handlePastedHTML(html) {
        const parser = new ExpensiMark();
        const markdownText = parser.htmlToMarkdown(html);
        const beforeCursorText = this.textInput.value.substring(0, this.selection.start);
        const afterCursorText = this.textInput.value.substring(this.selection.end);
        this.textInput.value = beforeCursorText + markdownText + afterCursorText;
        const newCursorPosition = beforeCursorText.length + markdownText.length;
        this.setState({selection: {start: newCursorPosition, end: newCursorPosition}});
        this.updateNumberOfLines();
        this.props.onChangeText(this.textInput.value);
    }

    /**
     * Check the paste event for an attachment, parse the data and call onPasteFile from props with the selected file,
     * Otherwise, convert pasted HTML to Markdown and set it on the composer.
     *
     * @param {ClipboardEvent} event
     */
    handlePaste(event) {
        const {files, types} = event.clipboardData;
        const TEXT_HTML = 'text/html';

        // If paste contains files, then trigger file management
        if (files.length > 0) {
            // Prevent the default so we do not post the file name into the text box
            event.preventDefault();
            this.props.onPasteFile(event.clipboardData.files[0]);
            return;
        }

        // If paste contains HTML
        if (types.includes(TEXT_HTML)) {
            const pastedHTML = event.clipboardData.getData(TEXT_HTML);

            event.preventDefault();
            const domparser = new DOMParser();
            const embeddedImages = domparser.parseFromString(pastedHTML, TEXT_HTML).images;

            // If HTML has img tag, then fetch images from it.
            if (embeddedImages.length > 0) {
                fetch(embeddedImages[0].src)
                    .then((response) => {
                        if (!response.ok) { throw Error(response.statusText); }
                        return response.blob();
                    })
                    .then((x) => {
                        const extension = IMAGE_EXTENSIONS[x.type];
                        if (!extension) {
                            throw new Error(this.props.translate('textInputFocusable.noExtentionFoundForMimeType'));
                        }

                        return new File([x], `pasted_image.${extension}`, {});
                    })
                    .then(this.props.onPasteFile)
                    .catch(() => {
                        const errorDesc = this.props.translate('textInputFocusable.problemGettingImageYouPasted');
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
        }
    }

    /**
     * Manually scrolls the text input, then prevents the event from being passed up to the parent.
     * @param {Object} event native Event
     */
    handleWheel(event) {
        if (event.target === document.activeElement) {
            this.textInput.scrollTop += event.deltaY;
            event.preventDefault();
            event.stopPropagation();
        }
    }

    /**
     * Check the current scrollHeight of the textarea (minus any padding) and
     * divide by line height to get the total number of rows for the textarea.
     */
    updateNumberOfLines() {
        const computedStyle = window.getComputedStyle(this.textInput);
        const lineHeight = parseInt(computedStyle.lineHeight, 10) || 20;
        const paddingTopAndBottom = parseInt(computedStyle.paddingBottom, 10)
            + parseInt(computedStyle.paddingTop, 10);

        // We have to reset the rows back to the minimum before updating so that the scrollHeight is not
        // affected by the previous row setting. If we don't, rows will be added but not removed on backspace/delete.
        this.setState({numberOfLines: 1}, () => {
            this.setState({
                numberOfLines: this.getNumberOfLines(lineHeight, paddingTopAndBottom, this.textInput.scrollHeight),
            });
        });
    }

    render() {
        const propStyles = StyleSheet.flatten(this.props.style);
        propStyles.outline = 'none';
        const propsWithoutStyles = _.omit(this.props, 'style');
        return (
            <TextInput
                placeholderTextColor={themeColors.placeholderText}
                ref={el => this.textInput = el}
                selection={this.state.selection}
                onChange={() => {
                    this.updateNumberOfLines();
                }}
                onSelectionChange={this.saveSelection}
                numberOfLines={this.state.numberOfLines}
                style={propStyles}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...propsWithoutStyles}
                disabled={this.props.isDisabled}
            />
        );
    }
}

TextInputFocusable.propTypes = propTypes;
TextInputFocusable.defaultProps = defaultProps;

export default withLocalize(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <TextInputFocusable {...props} forwardedRef={ref} />
)));
