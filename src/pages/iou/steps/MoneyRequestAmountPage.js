import React from 'react';
import {View, InteractionManager} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import BigNumberPad from '../../../components/BigNumberPad';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import Button from '../../../components/Button';
import CONST from '../../../CONST';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import TextInputWithCurrencySymbol from '../../../components/TextInputWithCurrencySymbol';

const propTypes = {
    /** Whether or not this IOU has multiple participants */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** The ID of the report this screen should display */
    reportID: PropTypes.string.isRequired,

    /** Callback to inform parent modal of success */
    onStepComplete: PropTypes.func.isRequired,

    /** Previously selected amount to show if the user comes back to this screen */
    selectedAmount: PropTypes.number.isRequired,

    /** Text to display on the button that "saves" the amount */
    buttonText: PropTypes.string.isRequired,

    /* Onyx Props */

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({
        /** Selected Currency Code of the current IOU */
        selectedCurrencyCode: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    iou: {
        selectedCurrencyCode: CONST.CURRENCY.USD,
    },
};
class MoneyRequestAmountPage extends React.Component {
    constructor(props) {
        super(props);

        this.updateAmountNumberPad = this.updateAmountNumberPad.bind(this);
        this.updateLongPressHandlerState = this.updateLongPressHandlerState.bind(this);
        this.updateAmount = this.updateAmount.bind(this);
        this.stripCommaFromAmount = this.stripCommaFromAmount.bind(this);
        this.stripSpacesFromAmount = this.stripSpacesFromAmount.bind(this);
        this.focusTextInput = this.focusTextInput.bind(this);
        this.navigateToCurrencySelectionPage = this.navigateToCurrencySelectionPage.bind(this);
        this.amountViewID = 'amountView';
        this.numPadContainerViewID = 'numPadContainerView';
        this.numPadViewID = 'numPadView';

        const selectedAmountAsString = props.selectedAmount ? props.selectedAmount.toString() : '';
        this.state = {
            amount: selectedAmountAsString,
            shouldUpdateSelection: true,
            selection: {
                start: selectedAmountAsString.length,
                end: selectedAmountAsString.length,
            },
        };
    }

    componentDidMount() {
        this.focusTextInput();

        // Focus automatically after navigating back from currency selector
        this.unsubscribeNavFocus = this.props.navigation.addListener('focus', () => {
            this.focusTextInput();
        });
    }

    componentWillUnmount() {
        this.unsubscribeNavFocus();
    }

    /**
     * Event occurs when a user presses a mouse button over an DOM element.
     *
     * @param {Event} event
     * @param {Array<string>} nativeIds
     */
    onMouseDown(event, nativeIds) {
        const relatedTargetId = lodashGet(event, 'nativeEvent.target.id');
        if (!_.contains(nativeIds, relatedTargetId)) {
            return;
        }
        event.preventDefault();
        if (!this.textInput.isFocused()) {
            this.textInput.focus();
        }
    }

    /**
     * Returns the new selection object based on the updated amount's length
     *
     * @param {Object} oldSelection
     * @param {Number} prevLength
     * @param {Number} newLength
     * @returns {Object}
     */
    getNewSelection(oldSelection, prevLength, newLength) {
        const cursorPosition = oldSelection.end + (newLength - prevLength);
        return {start: cursorPosition, end: cursorPosition};
    }

    /**
     * Returns new state object if the updated amount is valid
     *
     * @param {Object} prevState
     * @param {String} newAmount - Changed amount from user input
     * @returns {Object}
     */
    getNewState(prevState, newAmount) {
        // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
        // More info: https://github.com/Expensify/App/issues/16974
        const newAmountWithoutSpaces = this.stripSpacesFromAmount(newAmount);
        if (!this.validateAmount(newAmountWithoutSpaces)) {
            // Use a shallow copy of selection to trigger setSelection
            // More info: https://github.com/Expensify/App/issues/16385
            return {amount: prevState.amount, selection: {...prevState.selection}};
        }
        const selection = this.getNewSelection(prevState.selection, prevState.amount.length, newAmountWithoutSpaces.length);
        return {amount: this.stripCommaFromAmount(newAmountWithoutSpaces), selection};
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
        const absAmount = parseFloat((this.stripCommaFromAmount(amount) * 100).toFixed(2)).toString();

        // The following logic will prevent users from pasting an amount that is excessively long in length,
        // which would result in the 'absAmount' value being expressed in scientific notation or becoming infinity.
        if (/\D/.test(absAmount)) {
            return CONST.IOU.AMOUNT_MAX_LENGTH + 1;
        }

        /*
        Return the sum of leading zeroes length and absolute amount length(including fraction digits).
        When the absolute amount is 0, add 2 to the leading zeroes length to represent fraction digits.
        */
        return leadingZeroesLength + (absAmount === '0' ? 2 : absAmount.length);
    }

    /**
     * Check if amount is a decimal up to 3 digits
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
     * Strip spaces from the amount
     *
     * @param {String} amount
     * @returns {String}
     */
    stripSpacesFromAmount(amount) {
        return amount.replace(/\s+/g, '');
    }

    /**
     * Adds a leading zero to the amount if user entered just the decimal separator
     *
     * @param {String} amount - Changed amount from user input
     * @returns {String}
     */
    addLeadingZero(amount) {
        return amount === '.' ? '0.' : amount;
    }

    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     *
     * @param {String} key
     */
    updateAmountNumberPad(key) {
        if (!this.textInput.isFocused()) {
            this.textInput.focus();
        }

        // Backspace button is pressed
        if (key === '<' || key === 'Backspace') {
            if (this.state.amount.length > 0) {
                this.setState((prevState) => {
                    const selectionStart = prevState.selection.start === prevState.selection.end ? prevState.selection.start - 1 : prevState.selection.start;
                    const amount = `${prevState.amount.substring(0, selectionStart)}${prevState.amount.substring(prevState.selection.end)}`;
                    return this.getNewState(prevState, amount);
                });
            }
            return;
        }

        this.setState((prevState) => {
            const amount = this.addLeadingZero(`${prevState.amount.substring(0, prevState.selection.start)}${key}${prevState.amount.substring(prevState.selection.end)}`);
            return this.getNewState(prevState, amount);
        });
    }

    /**
     * Update long press value, to remove items pressing on <
     *
     * @param {Boolean} value - Changed text from user input
     */
    updateLongPressHandlerState(value) {
        this.setState({shouldUpdateSelection: !value});
    }

    /**
     * Update amount on amount change
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit
     *
     * @param {String} text - Changed text from user input
     */
    updateAmount(text) {
        this.setState((prevState) => {
            const amount = this.addLeadingZero(this.replaceAllDigits(text, this.props.fromLocaleDigit));
            return this.getNewState(prevState, amount);
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

    navigateToCurrencySelectionPage() {
        if (this.props.hasMultipleParticipants) {
            return Navigation.navigate(ROUTES.getIouBillCurrencyRoute(this.props.reportID));
        }
        if (this.props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.SEND) {
            return Navigation.navigate(ROUTES.getIouSendCurrencyRoute(this.props.reportID));
        }
        return Navigation.navigate(ROUTES.getIouRequestCurrencyRoute(this.props.reportID));
    }

    render() {
        const formattedAmount = this.replaceAllDigits(this.state.amount, this.props.toLocaleDigit);

        return (
            <>
                <View
                    nativeID={this.amountViewID}
                    onMouseDown={(event) => this.onMouseDown(event, [this.amountViewID])}
                    style={[styles.flex1, styles.flexRow, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}
                >
                    <TextInputWithCurrencySymbol
                        formattedAmount={formattedAmount}
                        onChangeAmount={this.updateAmount}
                        onCurrencyButtonPress={this.navigateToCurrencySelectionPage}
                        placeholder={this.props.numberFormat(0)}
                        ref={(el) => (this.textInput = el)}
                        selectedCurrencyCode={this.props.iou.selectedCurrencyCode}
                        selection={this.state.selection}
                        onSelectionChange={(e) => {
                            if (!this.state.shouldUpdateSelection) {
                                return;
                            }
                            this.setState({selection: e.nativeEvent.selection});
                        }}
                    />
                </View>
                <View
                    onMouseDown={(event) => this.onMouseDown(event, [this.numPadContainerViewID, this.numPadViewID])}
                    style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper]}
                    nativeID={this.numPadContainerViewID}
                >
                    {DeviceCapabilities.canUseTouchScreen() ? (
                        <BigNumberPad
                            nativeID={this.numPadViewID}
                            numberPressed={this.updateAmountNumberPad}
                            longPressHandlerStateChanged={this.updateLongPressHandlerState}
                        />
                    ) : (
                        <View />
                    )}

                    <Button
                        success
                        style={[styles.w100, styles.mt5]}
                        onPress={() => this.props.onStepComplete(this.state.amount)}
                        pressOnEnter
                        isDisabled={!this.state.amount.length || parseFloat(this.state.amount) < 0.01}
                        text={this.props.buttonText}
                    />
                </View>
            </>
        );
    }
}

MoneyRequestAmountPage.propTypes = propTypes;
MoneyRequestAmountPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
    }),
)(MoneyRequestAmountPage);
