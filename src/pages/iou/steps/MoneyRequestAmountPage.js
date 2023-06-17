import React, {useEffect, useState, useRef} from 'react';
import {View, InteractionManager} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import {useFocusEffect} from '@react-navigation/native';
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
    iou: {},
};
function MoneyRequestAmountPage(props) {
    const amountViewID = 'amountView';
    const numPadContainerViewID = 'numPadContainerView';
    const numPadViewID = 'numPadView';
    const selectedAmountAsString = props.selectedAmount ? props.selectedAmount.toString() : '';
    const textInput = useRef(null);

    const [amount, setAmount] = useState(selectedAmountAsString);
    const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(() => (_.isUndefined(props.iou.selectedCurrencyCode) ? CONST.CURRENCY.USD : props.iou.selectedCurrencyCode));
    const [shouldUpdateSelection, setShouldUpdateSelection] = useState(true);
    const [selection, setSelection] = useState({start: selectedAmountAsString.length, end: selectedAmountAsString.length});

    /**
     * Event occurs when a user presses a mouse button over an DOM element.
     *
     * @param {Event} event
     * @param {Array<string>} nativeIds
     */
    const onMouseDown = (event, nativeIds) => {
        const relatedTargetId = lodashGet(event, 'nativeEvent.target.id');
        if (!_.contains(nativeIds, relatedTargetId)) {
            return;
        }
        event.preventDefault();
        if (!textInput.current.isFocused()) {
            textInput.current.focus();
        }
    };

    const getCurrencyFromRouteParams = () => {
        if (props.iou.selectedCurrencyCode === lodashGet(props.route.params, 'currency', '')) {
            return;
        }
        const newSelectedCurrencyCode = lodashGet(props.route.params, 'currency', '');
        if (newSelectedCurrencyCode !== '') {
            setSelectedCurrencyCode(newSelectedCurrencyCode);
        }
    };

    /**
     * Returns the new selection object based on the updated amount's length
     *
     * @param {Object} oldSelection
     * @param {Number} prevLength
     * @param {Number} newLength
     * @returns {Object}
     */
    const getNewSelection = (oldSelection, prevLength, newLength) => {
        const cursorPosition = oldSelection.end + (newLength - prevLength);
        return {start: cursorPosition, end: cursorPosition};
    };

    /**
     * Focus text input
     */
    const focusTextInput = () => {
        // Component may not initialized due to navigation transitions
        // Wait until interactions are complete before trying to focus
        InteractionManager.runAfterInteractions(() => {
            // Focus text input
            if (!textInput.current) {
                return;
            }

            textInput.current.focus();
        });
    };

    useEffect(() => {
        focusTextInput();
    }, []);

    useFocusEffect(() => {
        focusTextInput();
        getCurrencyFromRouteParams();
    });

    /**
     * Strip comma from the amount
     *
     * @param {String} newAmount
     * @returns {String}
     */
    const stripCommaFromAmount = (newAmount) => newAmount.replace(/,/g, '');

    /**
     * Strip spaces from the amount
     *
     * @param {String} newAmount
     * @returns {String}
     */
    const stripSpacesFromAmount = (newAmount) => newAmount.replace(/\s+/g, '');

    /**
     * Adds a leading zero to the amount if user entered just the decimal separator
     *
     * @param {String} newAmount - Changed amount from user input
     * @returns {String}
     */
    const addLeadingZero = (newAmount) => (newAmount === '.' ? '0.' : newAmount);

    /**
     * @param {String} newAmount
     * @returns {Number}
     */
    const calculateAmountLength = (newAmount) => {
        const leadingZeroes = newAmount.match(/^0+/);
        const leadingZeroesLength = lodashGet(leadingZeroes, '[0].length', 0);
        const absAmount = parseFloat((stripCommaFromAmount(newAmount) * 100).toFixed(2)).toString();

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
    };

    /**
     * Check if amount is a decimal up to 3 digits
     *
     * @param {String} newAmount
     * @returns {Boolean}
     */
    const validateAmount = (newAmount) => {
        const decimalNumberRegex = new RegExp(/^\d+(,\d+)*(\.\d{0,2})?$/, 'i');
        return newAmount === '' || (decimalNumberRegex.test(newAmount) && calculateAmountLength(newAmount) <= CONST.IOU.AMOUNT_MAX_LENGTH);
    };

    /**
     * Returns new state object if the updated amount is valid
     * @param {String} newAmount - Changed amount from user input
     */
    const setNewState = (newAmount) => {
        // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
        // More info: https://github.com/Expensify/App/issues/16974
        const newAmountWithoutSpaces = stripSpacesFromAmount(newAmount);
        if (!validateAmount(newAmountWithoutSpaces)) {
            // Use a shallow copy of selection to trigger setSelection
            // More info: https://github.com/Expensify/App/issues/16385
            setAmount(amount);
            setSelection(selection);
            // return {amount: prevState.amount, selection: {...prevState.selection}};
        }
        const newSelection = getNewSelection(selection, amount.length, newAmountWithoutSpaces.length);
        setAmount(stripCommaFromAmount(newAmountWithoutSpaces));
        setSelection(newSelection);
        // return {amount: stripCommaFromAmount(newAmountWithoutSpaces), selection};
    };

    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     *
     * @param {String} key
     */
    const updateAmountNumberPad = (key) => {
        if (shouldUpdateSelection && !textInput.current.isFocused()) {
            textInput.current.focus();
        }
        // Backspace button is pressed
        if (key === '<' || key === 'Backspace') {
            if (amount.length > 0) {
                const selectionStart = selection.start === selection.end ? selection.start - 1 : selection.start;
                const newAmount = `${amount.substring(0, selectionStart)}${amount.substring(selection.end)}`;
                setNewState(newAmount);
            }
            return;
        }
        const newAmount = addLeadingZero(`${amount.substring(0, selection.start)}${key}${amount.substring(selection.end)}`);
        setNewState(newAmount);
    };

    /**
     * Update long press value, to remove items pressing on <
     *
     * @param {Boolean} value - Changed text from user input
     */
    const updateLongPressHandlerState = (value) => {
        setShouldUpdateSelection(!value);
        if (!value && !textInput.current.isFocused()) {
            textInput.current.focus();
        }
    };

    /**
     * Replaces each character by calling `convertFn`. If `convertFn` throws an error, then
     * the original character will be preserved.
     *
     * @param {String} text
     * @param {Function} convertFn - `props.fromLocaleDigit` or `props.toLocaleDigit`
     * @returns {String}
     */
    const replaceAllDigits = (text, convertFn) =>
        _.chain([...text])
            .map((char) => {
                try {
                    return convertFn(char);
                } catch {
                    return char;
                }
            })
            .join('')
            .value();

    /**
     * Update amount on amount change
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit
     *
     * @param {String} text - Changed text from user input
     */
    const updateAmount = (text) => {
        const newAmount = addLeadingZero(replaceAllDigits(text, props.fromLocaleDigit));
        setNewState(newAmount);
    };

    const navigateToCurrencySelectionPage = () => {
        // Remove query from the route and encode it.
        const activeRoute = encodeURIComponent(Navigation.getActiveRoute().replace(/\?.*/, ''));
        if (props.hasMultipleParticipants) {
            return Navigation.navigate(ROUTES.getIouBillCurrencyRoute(props.reportID, selectedCurrencyCode, activeRoute));
        }
        if (props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.SEND) {
            return Navigation.navigate(ROUTES.getIouSendCurrencyRoute(props.reportID, selectedCurrencyCode, activeRoute));
        }
        return Navigation.navigate(ROUTES.getIouRequestCurrencyRoute(props.reportID, selectedCurrencyCode, activeRoute));
    };

    const formattedAmount = replaceAllDigits(amount, props.toLocaleDigit);

    return (
        <>
            <View
                nativeID={amountViewID}
                onMouseDown={(event) => onMouseDown(event, [amountViewID])}
                style={[styles.flex1, styles.flexRow, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}
            >
                <TextInputWithCurrencySymbol
                    formattedAmount={formattedAmount}
                    onChangeAmount={updateAmount}
                    onCurrencyButtonPress={navigateToCurrencySelectionPage}
                    placeholder={props.numberFormat(0)}
                    ref={(el) => (textInput.current = el)}
                    selectedCurrencyCode={selectedCurrencyCode}
                    selection={selection}
                    onSelectionChange={(e) => {
                        if (!shouldUpdateSelection) {
                            return;
                        }
                        setSelection(e.nativeEvent.selection);
                    }}
                />
            </View>
            <View
                onMouseDown={(event) => onMouseDown(event, [numPadContainerViewID, numPadViewID])}
                style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper]}
                nativeID={numPadContainerViewID}
            >
                {DeviceCapabilities.canUseTouchScreen() ? (
                    <BigNumberPad
                        nativeID={numPadViewID}
                        numberPressed={updateAmountNumberPad}
                        longPressHandlerStateChanged={updateLongPressHandlerState}
                    />
                ) : (
                    <View />
                )}

                <Button
                    success
                    style={[styles.w100, styles.mt5]}
                    onPress={() => props.onStepComplete(amount, selectedCurrencyCode)}
                    pressOnEnter
                    isDisabled={!amount.length || parseFloat(amount) < 0.01}
                    text={props.buttonText}
                />
            </View>
        </>
    );
}

MoneyRequestAmountPage.propTypes = propTypes;
MoneyRequestAmountPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
    }),
)(MoneyRequestAmountPage);
