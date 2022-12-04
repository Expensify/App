import React from 'react';
import {StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Str from 'expensify-common/lib/str';
import RNTextInput from '../RNTextInput';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Growl from '../../libs/Growl';
import themeColors from '../../styles/themes/default';
import CONST from '../../CONST';
import updateIsFullComposerAvailable from '../../libs/ComposerUtils/updateIsFullComposerAvailable';
import getNumberOfLines from '../../libs/ComposerUtils/index';

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

    /** Whether the full composer can be opened */
    isFullComposerAvailable: PropTypes.bool,

    /** Allow the full composer to be opened */
    setIsFullComposerAvailable: PropTypes.func,

    /** Whether the composer is full size */
    isComposerFullSize: PropTypes.bool,

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
    isFullComposerAvailable: false,
    setIsFullComposerAvailable: () => {},
    isComposerFullSize: false,
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

const COPY_DROP_EFFECT = 'copy';

/**
 * Enable Markdown parsing.
 * On web we like to have the Text Input field always focused so the user can easily type a new chat
 */
class Composer extends React.Component {
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
        this.dragNDropListener = this.dragNDropListener.bind(this);
        this.paste = this.paste.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
        this.handlePastedHTML = this.handlePastedHTML.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.shouldCallUpdateNumberOfLines = this.shouldCallUpdateNumberOfLines.bind(this);
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

        if (prevProps.value !== this.props.value
            || prevProps.defaultValue !== this.props.defaultValue
            || prevProps.isComposerFullSize !== this.props.isComposerFullSize) {
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

        document.removeEventListener('dragover', this.dragNDropListener);
        document.removeEventListener('dragenter', this.dragNDropListener);
        document.removeEventListener('dragleave', this.dragNDropListener);
        document.removeEventListener('drop', this.dragNDropListener);
        this.textInput.removeEventListener('paste', this.handlePaste);
        this.textInput.removeEventListener('wheel', this.handleWheel);
    }

    /**
     * Handles all types of drag-N-drop events on the composer
     *
     * @param {Object} e native Event
     */
    dragNDropListener(e) {
        let isOriginComposer = false;
        const handler = () => {
            // Setting dropEffect for dragover is required for '+' icon on certain platforms/browsers (eg. Safari)
            switch (e.type) {
                case 'dragover':
                    e.preventDefault();
                    e.dataTransfer.dropEffect = COPY_DROP_EFFECT;
                    this.props.onDragOver(e, isOriginComposer);
                    break;
                case 'dragenter':
                    e.dataTransfer.dropEffect = COPY_DROP_EFFECT;
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
     * Set pasted text to clipboard
     * @param {String} text
     */
    paste(text) {
        try {
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
                    this.paste(Str.htmlDecode(plainText));
                    return;
                }
                fetch(embeddedImages[0].src)
                    .then((response) => {
                        if (!response.ok) { throw Error(response.statusText); }
                        return response.blob();
                    })
                    .then((x) => {
                        const extension = IMAGE_EXTENSIONS[x.type];
                        if (!extension) {
                            throw new Error(this.props.translate('composer.noExtentionFoundForMimeType'));
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
        this.paste(Str.htmlDecode(plainText));
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
            const paddingTopAndBottom = parseInt(computedStyle.paddingBottom, 10)
            + parseInt(computedStyle.paddingTop, 10);
            const numberOfLines = getNumberOfLines(this.props.maxLines, lineHeight, paddingTopAndBottom, this.textInput.scrollHeight);
            updateIsFullComposerAvailable(this.props, numberOfLines);
            this.setState({
                numberOfLines,
            });
        });
    }

    render() {
        const propStyles = StyleSheet.flatten(this.props.style);
        propStyles.outline = 'none';
        const propsWithoutStyles = _.omit(this.props, 'style');
        return (
            <RNTextInput
                autoComplete="off"
                placeholderTextColor={themeColors.placeholderText}
                ref={el => this.textInput = el}
                selection={this.state.selection}
                onChange={this.shouldCallUpdateNumberOfLines}
                onSelectionChange={this.onSelectionChange}
                numberOfLines={this.state.numberOfLines}
                style={propStyles}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...propsWithoutStyles}
                disabled={this.props.isDisabled}
            />
        );
    }
}

Composer.propTypes = propTypes;
Composer.defaultProps = defaultProps;

export default withLocalize(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <Composer {...props} forwardedRef={ref} />
)));
