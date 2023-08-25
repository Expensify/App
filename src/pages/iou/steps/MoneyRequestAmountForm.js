import React, {useEffect, useState, useCallback, useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import styles from '../../../styles/styles';
import BigNumberPad from '../../../components/BigNumberPad';
import * as CurrencyUtils from '../../../libs/CurrencyUtils';
import * as MoneyRequestUtils from '../../../libs/MoneyRequestUtils';
import Button from '../../../components/Button';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import TextInputWithCurrencySymbol from '../../../components/TextInputWithCurrencySymbol';
import useLocalize from '../../../hooks/useLocalize';
import CONST from '../../../CONST';

const propTypes = {
    /** IOU amount saved in Onyx */
    amount: PropTypes.number,

    /** Currency chosen by user or saved in Onyx */
    currency: PropTypes.string,

    /** Whether the amount is being edited or not */
    isEditing: PropTypes.bool,

    /** Refs forwarded to the TextInputWithCurrencySymbol */
    forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),

    /** Fired when back button pressed, navigates to currency selection page */
    onCurrencyButtonPress: PropTypes.func.isRequired,

    /** Fired when submit button pressed, saves the given amount and navigates to the next page */
    onSubmitButtonPress: PropTypes.func.isRequired,
};

const defaultProps = {
    amount: 0,
    currency: CONST.CURRENCY.USD,
    forwardedRef: null,
    isEditing: false,
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

const AMOUNT_VIEW_ID = 'amountView';
const NUM_PAD_CONTAINER_VIEW_ID = 'numPadContainerView';
const NUM_PAD_VIEW_ID = 'numPadView';

function MoneyRequestAmountForm({amount, currency, isEditing, forwardedRef, onCurrencyButtonPress, onSubmitButtonPress}) {
    const {translate, toLocaleDigit, numberFormat} = useLocalize();

    const textInput = useRef(null);

    const selectedAmountAsString = amount ? CurrencyUtils.convertToFrontendAmount(amount).toString() : '';

    const [currentAmount, setCurrentAmount] = useState(selectedAmountAsString);
    const [shouldUpdateSelection, setShouldUpdateSelection] = useState(true);

    const [selection, setSelection] = useState({
        start: selectedAmountAsString.length,
        end: selectedAmountAsString.length,
    });

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
        if (!textInput.current) {
            return;
        }
        if (!textInput.current.isFocused()) {
            textInput.current.focus();
        }
    };

    useEffect(() => {
        if (!currency || !amount) {
            return;
        }
        const amountAsStringForState = CurrencyUtils.convertToFrontendAmount(amount).toString();
        setCurrentAmount(amountAsStringForState);
        setSelection({
            start: amountAsStringForState.length,
            end: amountAsStringForState.length,
        });
        // we want to update the state only when the amount is changed
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amount]);

    /**
     * Sets the selection and the amount accordingly to the value passed to the input
     * @param {String} newAmount - Changed amount from user input
     */
    const setNewAmount = (newAmount) => {
        // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
        // More info: https://github.com/Expensify/App/issues/16974
        const newAmountWithoutSpaces = MoneyRequestUtils.stripSpacesFromAmount(newAmount);
        // Use a shallow copy of selection to trigger setSelection
        // More info: https://github.com/Expensify/App/issues/16385
        if (!MoneyRequestUtils.validateAmount(newAmountWithoutSpaces)) {
            setSelection((prevSelection) => ({...prevSelection}));
            return;
        }
        setCurrentAmount((prevAmount) => {
            const strippedAmount = MoneyRequestUtils.stripCommaFromAmount(newAmountWithoutSpaces);
            setSelection((prevSelection) => getNewSelection(prevSelection, prevAmount.length, strippedAmount.length));
            return strippedAmount;
        });
    };

    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     *
     * @param {String} key
     */
    const updateAmountNumberPad = useCallback(
        (key) => {
            if (shouldUpdateSelection && !textInput.current.isFocused()) {
                textInput.current.focus();
            }
            // Backspace button is pressed
            if (key === '<' || key === 'Backspace') {
                if (currentAmount.length > 0) {
                    const selectionStart = selection.start === selection.end ? selection.start - 1 : selection.start;
                    const newAmount = `${currentAmount.substring(0, selectionStart)}${currentAmount.substring(selection.end)}`;
                    setNewAmount(newAmount);
                }
                return;
            }
            const newAmount = MoneyRequestUtils.addLeadingZero(`${currentAmount.substring(0, selection.start)}${key}${currentAmount.substring(selection.end)}`);
            setNewAmount(newAmount);
        },
        [currentAmount, selection, shouldUpdateSelection],
    );

    /**
     * Update long press value, to remove items pressing on <
     *
     * @param {Boolean} value - Changed text from user input
     */
    const updateLongPressHandlerState = useCallback((value) => {
        setShouldUpdateSelection(!value);
        if (!value && !textInput.current.isFocused()) {
            textInput.current.focus();
        }
    }, []);

    /**
     * Submit amount and navigate to a proper page
     */
    const submitAndNavigateToNextPage = useCallback(() => {
        onSubmitButtonPress(currentAmount);
    }, [onSubmitButtonPress, currentAmount]);

    const formattedAmount = MoneyRequestUtils.replaceAllDigits(currentAmount, toLocaleDigit);
    const buttonText = isEditing ? translate('common.save') : translate('common.next');

    return (
        <>
            <View
                nativeID={AMOUNT_VIEW_ID}
                onMouseDown={(event) => onMouseDown(event, [AMOUNT_VIEW_ID])}
                style={[styles.flex1, styles.flexRow, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}
            >
                <TextInputWithCurrencySymbol
                    formattedAmount={formattedAmount}
                    onChangeAmount={setNewAmount}
                    onCurrencyButtonPress={onCurrencyButtonPress}
                    placeholder={numberFormat(0)}
                    ref={(ref) => {
                        if (typeof forwardedRef === 'function') {
                            forwardedRef(ref);
                        } else if (forwardedRef && _.has(forwardedRef, 'current')) {
                            // eslint-disable-next-line no-param-reassign
                            forwardedRef.current = ref;
                        }
                        textInput.current = ref;
                    }}
                    selectedCurrencyCode={currency}
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
                onMouseDown={(event) => onMouseDown(event, [NUM_PAD_CONTAINER_VIEW_ID, NUM_PAD_VIEW_ID])}
                style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper]}
                nativeID={NUM_PAD_CONTAINER_VIEW_ID}
            >
                {DeviceCapabilities.canUseTouchScreen() ? (
                    <BigNumberPad
                        nativeID={NUM_PAD_VIEW_ID}
                        numberPressed={updateAmountNumberPad}
                        longPressHandlerStateChanged={updateLongPressHandlerState}
                    />
                ) : null}
                <Button
                    success
                    style={[styles.w100, styles.mt5]}
                    onPress={submitAndNavigateToNextPage}
                    pressOnEnter
                    isDisabled={!currentAmount.length || parseFloat(currentAmount) < 0.01}
                    text={buttonText}
                />
            </View>
        </>
    );
}

MoneyRequestAmountForm.propTypes = propTypes;
MoneyRequestAmountForm.defaultProps = defaultProps;
MoneyRequestAmountForm.displayName = 'MoneyRequestAmountForm';

export default React.forwardRef((props, ref) => (
    <MoneyRequestAmountForm
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
