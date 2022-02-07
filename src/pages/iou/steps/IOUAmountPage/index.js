
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import _ from 'underscore';
import {InteractionManager} from 'react-native';
import CONST from '../../../../CONST';
import IOUAmount from './IOUAmount';

class IOUAmountPage extends Component {
    constructor(props) {
        super(props);
        this.calculateAmountLength = this.calculateAmountLength.bind(this);
        this.validateAmount = this.validateAmount.bind(this);
        this.replaceAllDigits = this.replaceAllDigits.bind(this);
        this.stripCommaFromAmount = this.stripCommaFromAmount.bind(this);
        this.calculateAmountAndSelection = this.calculateAmountAndSelection.bind(this);
    }

    /**
     * @param {String} amount
     * @returns {Number}
     */
    calculateAmountLength(amount) {
        const leadingZeroes = amount.match(/^0+/);
        const leadingZeroesLength = lodashGet(leadingZeroes, '[0].length', 0);
        const absAmount = parseFloat((amount * 100).toFixed(2)).toString();

        /*
    Return the sum of leading zeroes length and absolute amount length(including fraction digits).
    When the absolute amount is 0, add 2 to the leading zeroes length to represent fraction digits.
    */
        return leadingZeroesLength + (absAmount === '0' ? 2 : absAmount.length);
    }

    /**
     * Check if amount is a decimal upto 3 digits
     *
     * @param {String} amount
     * @returns {Boolean}
     */
    validateAmount(amount) {
        const decimalNumberRegex = new RegExp(/^\d+(,\d+)*(\.\d{0,2})?$/, 'i');
        return amount === '' || (decimalNumberRegex.test(amount) && this.calculateAmountLength(amount) <= CONST.IOU.AMOUNT_MAX_LENGTH);
    }

    /**
     * Strip comma from the amount
     *
     * @param {String} amount
     * @returns {String}
     */
    stripCommaFromAmount(amount) {
        return amount.replace(/,/g, '');
    }


    /**
     * Replaces each character by calling `convertFn`. If `convertFn` throws an error, then
     * the original character will be preserved.
     *
     * @param {String} text
     * @param {Function} convertFn - `this.props.fromLocaleDigit` or `this.props.toLocaleDigit`
     * @returns {String}
     */
    replaceAllDigits(text, convertFn) {
        return _.chain([...text])
            .map((char) => {
                try {
                    return convertFn(char);
                } catch {
                    return char;
                }
            })
            .join('')
            .value();
    }

    /**
     * Returns new value of Selection and Amount
     *
     * @param {String} amount - Current amount in prevState
     * @param {String} key -Key pressed
     * @returns {Object}
     */

    calculateAmountAndSelection(key, selection, amount) {
        const {start, end} = selection;

        // Backspace button is pressed
        if (key === '<' || (key === 'Backspace' && amount.length > 0)) {
            if (end === 0) {
                return {amount, selection};
            }

            if (start === end && start > 0) {
                const newAmount = amount.slice(0, start - 1) + amount.slice(end);

                if (!this.validateAmount(newAmount)) {
                    return {amount, selection};
                }

                return {amount: newAmount, selection: {start: start - 1, end: end - 1}};
            }
            const newAmount = amount.slice(0, start) + amount.slice(end);
            return {amount: newAmount, selection: {start, end: start}};
        }

        // Normal Keys
        const newAmount = `${amount.slice(0, start)}${key}${amount.slice(end)}`;
        if (!this.validateAmount(newAmount)) {
            return {amount, selection};
        }

        return {amount: newAmount, selection: {start: start + 1, end: start + 1}};
    }

    /**
     * Focus text input
     */
    focusTextInput() {
    // Component may not initialized due to navigation transitions
    // Wait until interactions are complete before trying to focus
        InteractionManager.runAfterInteractions(() => {
        // Focus text input
            if (!this.textInput) {
                return;
            }

            this.textInput.focus();
        });
    }

    render() {
        return (
            <IOUAmount
                focusTextInput={this.focusTextInput}
                calculateAmountAndSelection={this.calculateAmountAndSelection}
                replaceAllDigits={this.replaceAllDigits}
                stripCommaFromAmount={this.stripCommaFromAmount}
                validateAmount={this.validateAmount}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            />
        );
    }
}

export default IOUAmountPage;
