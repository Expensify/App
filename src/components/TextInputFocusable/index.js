import React from 'react';
import {TextInput, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';

const propTypes = {
    // Maximum number of lines in the text input
    maxLines: PropTypes.number,

    // The default value of the comment box
    defaultValue: PropTypes.string.isRequired,

    // Callback method to handle pasting a file
    onPasteFile: PropTypes.func,

    // A ref to forward to the text input
    forwardedRef: PropTypes.func.isRequired,

    // General styles to apply to the text input
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    // If the input should clear, it actually gets intercepted instead of .clear()
    shouldClear: PropTypes.bool,

    // When the input has cleared whoever owns this input should know about it
    onClear: PropTypes.func,
};

const defaultProps = {
    maxLines: -1,
    onPasteFile: () => {},
    shouldClear: false,
    onClear: () => {},
    style: null,
};

/**
 * On web we like to have the Text Input field always focused so the user can easily type a new chat
 */
class TextInputFocusable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            numberOfLines: 1,
        };
    }

    componentDidMount() {
        this.focusInput();

        // This callback prop is used by the parent component using the constructor to
        // get a ref to the inner textInput element e.g. if we do
        // <constructor ref={el => this.textInput = el} /> this will not
        // return a ref to the component, but rather the HTML element by default
        if (this.props.forwardedRef && _.isFunction(this.props.forwardedRef)) {
            this.props.forwardedRef(this.textInput);
        }

        // There is no onPaste for TextInput in react-native so we will add event
        // listener here and unbind when the component unmounts
        if (this.textInput) {
            this.textInput.addEventListener('paste', this.checkForAttachment.bind(this));
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
    }

    componentWillUnmount() {
        if (this.textInput) {
            this.textInput.removeEventListener('paste', this.checkForAttachment.bind(this));
        }
    }

    /**
     * Calculates the max number of lines the text input can have
     *
     * @param {number} lineHeight
     * @param {number} paddingTopAndBottom
     * @param {number} scrollHeight
     *
     * @returns {number}
     */
    getNumberOfLines(lineHeight, paddingTopAndBottom, scrollHeight) {
        const maxLines = this.props.maxLines;
        let newNumberOfLines = Math.ceil((scrollHeight - paddingTopAndBottom) / lineHeight);
        newNumberOfLines = maxLines <= 0 ? newNumberOfLines : Math.min(newNumberOfLines, maxLines);
        return newNumberOfLines;
    }

    /**
     * Check the paste event for an attachment and
     * fire the callback with the selected file
     *
     * @param {ClipboardEvent} event
     */
    checkForAttachment(event) {
        if (event.clipboardData.files.length > 0) {
            // Prevent the default so we do not post the file name into the text box
            event.preventDefault();
            this.props.onPasteFile(event.clipboardData.files[0]);
        }
    }

    /**
     * Check the current scrollHeight of the textarea (minus any padding) and
     * divide by line height to get the total number of rows for the textarea.
     *
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
                numberOfLines: this.getNumberOfLines(lineHeight, paddingTopAndBottom, this.textInput.scrollHeight)
            });
        });
    }

    focusInput() {
        this.textInput.focus();
    }

    render() {
        const propStyles = StyleSheet.flatten(this.props.style);
        propStyles.outline = 'none';
        const propsWithoutStyles = _.omit(this.props, 'style');
        return (
            <TextInput
                ref={el => this.textInput = el}
                onChange={() => {
                    this.updateNumberOfLines();
                }}
                numberOfLines={this.state.numberOfLines}
                style={propStyles}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...propsWithoutStyles}
            />
        );
    }
}

TextInputFocusable.propTypes = propTypes;
TextInputFocusable.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <TextInputFocusable {...props} forwardedRef={ref} />
));
