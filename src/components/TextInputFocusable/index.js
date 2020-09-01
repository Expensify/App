import React from 'react';
import {TextInput} from 'react-native';
import PropTypes from 'prop-types';

/**
 * On web we like to have the Text Input field always focused so the user can easily type a new chat
 */
class TextInputFocusable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            numberOfLines: 1,
        };
        this.updateNumberOfLines = this.updateNumberOfLines.bind(this);
    }

    componentDidMount() {
        this.focusInput();
    }

    componentDidUpdate(prevProps) {
        this.focusInput();

        // Need to chek against previous value so it does not create a infinite loop
        if (this.props.value !== prevProps.value && this.props.value === '' && this.state.numberOfLines !== 1) {
            this.resetLines();
        }
    }

    /**
     * Resets the number of lines to 1
     *
     * @private
     */
    resetLines() {
        this.setState({numberOfLines: 1});
    }

    /**
     * Check the current scrollHeight of the textarea (minus any padding) and
     * divide by line height to get the total number of rows for the textarea.
     *
     * @param {object} event
     */
    updateNumberOfLines(event) {
        const target = event.nativeEvent.target;
        const computedStyle = window.getComputedStyle(target);
        const lineHeight = parseInt(computedStyle.lineHeight, 10) || 20;
        const paddingTopAndBottom = parseInt(computedStyle.paddingBottom, 10)
            + parseInt(computedStyle.paddingTop, 10);

        // We have to reset the rows back to the minimum before updating so that the scrollHeight is not
        // affected by the previous row setting. If we don't, rows will be added but not removed on backspace/delete.
        this.setState({numberOfLines: 1}, () => {
            this.setState({
                numberOfLines: Math.ceil((target.scrollHeight - paddingTopAndBottom) / lineHeight)
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
                onChange={(event) => {
                    this.updateNumberOfLines(event);
                }}
                numberOfLines={this.state.numberOfLines}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...this.props}
            />
        );
    }
}

const propTypes = {
    // The value of the comment box
    value: PropTypes.string.isRequired,
};
TextInputFocusable.propTypes = propTypes;

export default TextInputFocusable;
