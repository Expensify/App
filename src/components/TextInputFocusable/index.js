import React from 'react';
import {TextInput} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';

const propTypes = {
    // Maximum number of lines in the text input
    maxLines: PropTypes.number,

    // The default value of the comment box
    defaultValue: PropTypes.string.isRequired,

    // A ref to forward to the text input
    forwardedRef: PropTypes.func.isRequired,

    // If the input should clear, it actually gets intercepted instead of .clear()
    shouldClear: PropTypes.bool,

    // When the input has cleared whoever owns this input should know about it
    onClear: PropTypes.func,
};

const defaultProps = {
    maxLines: -1,
    shouldClear: false,
    onClear: () => {},
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
        return (
            <TextInput
                ref={el => this.textInput = el}
                onChange={() => {
                    this.updateNumberOfLines();
                }}
                numberOfLines={this.state.numberOfLines}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...this.props}
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
