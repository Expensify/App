/**
 * iOS has incorrect selection(caret) position when using setNativeProps
 * to update text and selection concurrently.
 * Issue: https://github.com/facebook/react-native/issues/33077
 */

import React from 'react';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../../../ONYXKEYS';
import withLocalize from '../../../../../components/withLocalize';
import compose from '../../../../../libs/compose';
import {propTypes, defaultProps} from './IOUAmountPropTypes';
import IOUAmountInput from '../../../../../components/IOUAmountInput';
import * as IOUAmountUtils from '../../../../../libs/IOUAmountUtils';

class IOUAmount extends React.Component {
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
            />
        );
    }
}

IOUAmount.propTypes = propTypes;
IOUAmount.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
        iou: {key: ONYXKEYS.IOU},
    }),
)(IOUAmount);
