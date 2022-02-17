/**
 * iOS has incorrect selection(caret) position when using setNativeProps
 * to update text and selection concurrently.
 * Issue: https://github.com/facebook/react-native/issues/33077
 */

import React from 'react';
import {propTypes, defaultProps} from './IOUAmount/IOUAmountPropTypes';
import IOUAmountInput from '../../../../components/IOUAmountInput';
import * as IOUAmountUtils from '../../../../libs/IOUAmountUtils';

class IOUAmountPage extends React.Component {
    constructor(props) {
        super(props);
        this.updateAmountNumberPad = this.updateAmountNumberPad.bind(this);
        this.updateAmount = this.updateAmount.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.state = {
            amount: props.selectedAmount,
            selection: {
                start: props.selectedAmount.length,
                end: props.selectedAmount.length,
            },
        };
    }

    /**
     * Callback function to update UI-triggered selection changes in local selection.
     * @param {Event} e
     */
    onSelectionChange(e) {
        this.setState({selection: e.nativeEvent.selection});
    }

    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     *
     * @param {String} key
     * @returns {String}
     */
    updateAmountNumberPad(key) {
        return this.setState((prevState) => {
            const {amount, selection} = this.props.calculateAmountAndSelection(key, prevState.selection, prevState.amount);
            return {amount, selection};
        });
    }

    /**
     * Update amount on amount change
     * Validate new amount with decimal number regex up to 8 digits and 2 decimal digit
     *
     * @param {String} text - Changed text from user input
     */
    updateAmount(text) {
        this.setState((prevState) => {
            const amount = IOUAmountUtils.replaceAllDigits(text, this.props.fromLocaleDigit);
            return IOUAmountUtils.validateAmount(amount)
                ? {amount: IOUAmountUtils.stripCommaFromAmount(amount)}
                : prevState;
        });
    }


    render() {
        return (
            <IOUAmountInput
                amount={this.state.amount}
                updateAmount={this.updateAmount}
                updateAmountNumberPad={this.updateAmountNumberPad}
                onSelectionChange={this.onSelectionChange}
                selection={this.state.selection}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                isValueControlled
            />
        );
    }
}

IOUAmountPage.propTypes = propTypes;
IOUAmountPage.defaultProps = defaultProps;

export default IOUAmountPage;
