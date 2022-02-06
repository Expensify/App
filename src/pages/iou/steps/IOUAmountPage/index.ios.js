import React from 'react';
import {
    View,
    TouchableOpacity,
    InteractionManager,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../../../ONYXKEYS';
import styles from '../../../../styles/styles';
import BigNumberPad from '../../../../components/BigNumberPad';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import withLocalize from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import Button from '../../../../components/Button';
import Text from '../../../../components/Text';
import CONST from '../../../../CONST';
import TextInputAutoWidthWithoutKeyboard from '../../../../components/TextInputAutoWidthWithoutKeyboard';
import {propTypes, defaultProps} from './IOUAmountPropTypes';

class IOUAmountPage extends React.Component {
    constructor(props) {
        super(props);

        this.updateAmountNumberPad = this.updateAmountNumberPad.bind(this);
        this.updateAmount = this.updateAmount.bind(this);
        this.stripCommaFromAmount = this.stripCommaFromAmount.bind(this);
        this.focusTextInput = this.focusTextInput.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.calculateAmountAndSelection = this.calculateAmountAndSelection.bind(this);
        this.state = {
            amount: props.selectedAmount,
            selection: {
                start: props.selectedAmount.length,
                end: props.selectedAmount.length,
            },
        };
    }

    componentDidMount() {
        this.focusTextInput();
    }

    componentDidUpdate(prevProps) {
        if (this.props.iou.selectedCurrencyCode === prevProps.iou.selectedCurrencyCode) {
            return;
        }

        this.focusTextInput();
    }

    /**
     * Callback function to update UI-triggered selection changes in local selection.
     * @param {*} e
     */
    onSelectionChange(e) {
        this.setState({selection: e.nativeEvent.selection});
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
     * Returns new value of Selection and Amount
     *
     * @param {String} amount - Current amount in prevState
     * @param {String} key -Key pressed
     * @returns {Object}
     */

    calculateAmountAndSelection(key, selection, amount) {
        const {start, end} = selection;

        // Backspace button is pressed
        if (key === '<' || (key === 'Backspace' && this.state.amount.length > 0)) {
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

        // Number/decimal Keys
        const newAmount = `${amount.slice(0, start)}${key}${amount.slice(end)}`;
        if (!this.validateAmount(newAmount)) {
            return {amount, selection};
        }

        return {amount: newAmount, selection: {start: start + 1, end: start + 1}};
    }

    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     * @param {String} key
     * @returns {String}
     */
    updateAmountNumberPad(key) {
        return this.setState((prevState) => {
            const {amount, selection} = this.calculateAmountAndSelection(key, prevState.selection, prevState.amount);
            return {amount, selection};
        });
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

    render() {
        const formattedAmount = this.replaceAllDigits(this.state.amount, this.props.toLocaleDigit);
        return (
            <>
                <View style={[
                    styles.flex1,
                    styles.flexRow,
                    styles.w100,
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                ]}
                >
                    <TouchableOpacity onPress={() => Navigation.navigate(this.props.hasMultipleParticipants
                        ? ROUTES.getIouBillCurrencyRoute(this.props.reportID)
                        : ROUTES.getIouRequestCurrencyRoute(this.props.reportID))}
                    >
                        <Text style={styles.iouAmountText}>
                            {lodashGet(this.props.currencyList, [this.props.iou.selectedCurrencyCode, 'symbol'])}
                        </Text>
                    </TouchableOpacity>
                    <TextInputAutoWidthWithoutKeyboard
                        inputStyle={styles.iouAmountTextInput}
                        textStyle={styles.iouAmountText}
                        onChangeText={this.updateAmount}
                        ref={el => this.textInput = el}
                        value={formattedAmount}
                        placeholder={this.props.numberFormat(0)}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        selection={this.state.selection}
                        onSelectionChange={this.onSelectionChange}
                    />
                </View>
                <View style={[styles.w100, styles.justifyContentEnd]}>
                    {this.props.isSmallScreenWidth
                        ? (
                            <BigNumberPad
                                numberPressed={this.updateAmountNumberPad}
                            />
                        ) : <View />}

                    <Button
                        success
                        style={[styles.w100, styles.mt5]}
                        onPress={() => this.props.onStepComplete(this.state.amount)}
                        pressOnEnter
                        isDisabled={!this.state.amount.length || parseFloat(this.state.amount) < 0.01}
                        text={this.props.translate('common.next')}
                    />
                </View>
            </>
        );
    }
}

IOUAmountPage.propTypes = propTypes;
IOUAmountPage.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
        iou: {key: ONYXKEYS.IOU},
    }),
)(IOUAmountPage);
