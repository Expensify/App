import React from 'react';
import {
    View,
    InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import BigNumberPad from '../../../components/BigNumberPad';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import Button from '../../../components/Button';
import CONST from '../../../CONST';
import canUseTouchScreen from '../../../libs/canUseTouchscreen';
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
        this.focusTextInput = this.focusTextInput.bind(this);
        this.navigateToCurrencySelectionPage = this.navigateToCurrencySelectionPage.bind(this);

        this.state = {
            amount: props.selectedAmount.replace('.', this.props.fromLocaleDigit('.')),
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
        const decimalSeparator = this.props.fromLocaleDigit('.');
        const decimalNumberRegex = RegExp(String.raw`^\d+([${decimalSeparator}]\d{0,2})?$`, 'i');
        return amount === '' || (decimalNumberRegex.test(amount) && this.calculateAmountLength(amount) <= CONST.IOU.AMOUNT_MAX_LENGTH);
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
                this.setState(prevState => ({
                    amount: prevState.amount.slice(0, -1),
                }));
            }
            return;
        }

        this.setState((prevState) => {
            const amount = this.addLeadingZero(`${prevState.amount}${key}`);
            return this.validateAmount(amount) ? {amount} : prevState;
        });
    }

    /**
     * Update amount on amount change
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit
     *
     * @param {String} amount - Changed amount from user input
     */
    updateAmount(amount) {
        const newAmount = this.addLeadingZero(amount);
        this.setState(prevState => (this.validateAmount(newAmount) ? {amount: newAmount} : prevState));
    }

    /**
     * Adds a leading zero to amount if user entered just the decimal separator
     *
     * @param {String} amount - Changed amount from user input
     * @returns {String}
     */
    addLeadingZero(amount) {
        const decimalSeparator = this.props.fromLocaleDigit('.');
        if (amount === decimalSeparator) {
            return `0${decimalSeparator}`;
        }
        return amount;
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
                        formattedAmount={this.state.amount}
                        onChangeAmount={this.updateAmount}
                        onCurrencyButtonPress={this.navigateToCurrencySelectionPage}
                        placeholder={this.props.numberFormat(0)}
                        preferredLocale={this.props.preferredLocale}
                        ref={el => this.textInput = el}
                        selectedCurrencyCode={this.props.iou.selectedCurrencyCode || CONST.CURRENCY.USD}
                    />
                </View>
                <View style={[styles.w100, styles.justifyContentEnd]}>
                    {canUseTouchScreen()
                        ? (
                            <BigNumberPad
                                numberPressed={this.updateAmountNumberPad}
                            />
                        ) : <View />}

                    <Button
                        success
                        style={[styles.w100, styles.mt5]}
                        onPress={() => this.props.onStepComplete(this.state.amount.replace(this.props.fromLocaleDigit('.'), '.'))}
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
