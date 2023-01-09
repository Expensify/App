import React from 'react';
import {
    View,
    InteractionManager,
} from 'react-native';
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
    selectedAmount: PropTypes.string.isRequired,

    /* Onyx Props */

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({

        /** Whether or not the IOU step is loading (retrieving users preferred currency) */
        loading: PropTypes.bool,

        /** Selected Currency Code of the current IOU */
        selectedCurrencyCode: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

class IOUAmountPage extends React.Component {
    constructor(props) {
        super(props);

        this.updateAmountNumberPad = this.updateAmountNumberPad.bind(this);
        this.updateAmount = this.updateAmount.bind(this);
        this.stripCommaFromAmount = this.stripCommaFromAmount.bind(this);
        this.focusTextInput = this.focusTextInput.bind(this);
        this.navigateToCurrencySelectionPage = this.navigateToCurrencySelectionPage.bind(this);
        this.shouldUpdateSelection = true;

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

        // Focus automatically after navigating back from currency selector
        this.unsubscribeNavFocus = this.props.navigation.addListener('focus', () => {
            this.focusTextInput();
        });
    }

    componentWillUnmount() {
        this.unsubscribeNavFocus();
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
        if (!this.validateAmount(newAmount)) {
            return prevState;
        }
        const selection = this.getNewSelection(prevState.selection, prevState.amount.length, newAmount.length);
        return {amount: this.stripCommaFromAmount(newAmount), selection};
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
        if (this.props.iouType === CONST.IOU.IOU_TYPE.SEND) {
            return Navigation.navigate(ROUTES.getIouSendCurrencyRoute(this.props.reportID));
        }
        return Navigation.navigate(ROUTES.getIouRequestCurrencyRoute(this.props.reportID));
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
                    <TextInputWithCurrencySymbol
                        formattedAmount={formattedAmount}
                        onChangeAmount={this.updateAmount}
                        onCurrencyButtonPress={this.navigateToCurrencySelectionPage}
                        placeholder={this.props.numberFormat(0)}
                        preferredLocale={this.props.preferredLocale}
                        ref={el => this.textInput = el}
                        selectedCurrencyCode={this.props.iou.selectedCurrencyCode || CONST.CURRENCY.USD}
                        selection={this.state.selection}
                        onSelectionChange={(e) => {
                            if (!this.shouldUpdateSelection) {
                                return;
                            }
                            this.setState({selection: e.nativeEvent.selection});
                        }}
                    />
                </View>
                <View style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper]}>
                    {DeviceCapabilities.canUseTouchScreen()
                        ? (
                            <BigNumberPad
                                numberPressed={this.updateAmountNumberPad}
                                longPressHandlerStateChanged={state => this.shouldUpdateSelection = !state}
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

export default compose(
    withLocalize,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
    }),
)(IOUAmountPage);
