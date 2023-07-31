import React, {useEffect, useState, useRef, useCallback} from 'react';
import {View, InteractionManager} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import {useFocusEffect} from '@react-navigation/native';
import styles from '../../../../styles/styles';
import BigNumberPad from '../../../../components/BigNumberPad';
import * as CurrencyUtils from '../../../../libs/CurrencyUtils';
import * as MoneyRequestUtils from '../../../../libs/MoneyRequestUtils';
import Button from '../../../../components/Button';
import * as DeviceCapabilities from '../../../../libs/DeviceCapabilities';
import TextInputWithCurrencySymbol from '../../../../components/TextInputWithCurrencySymbol';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import useLocalize from '../../../../hooks/useLocalize';
import * as propTypes from './moneyRequestAmountFormPropTypes';
import CONST from "../../../../CONST";

const amountViewID = 'amountView';
const numPadContainerViewID = 'numPadContainerView';
const numPadViewID = 'numPadView';

function MoneyRequestAmountForm({amount = 0, currency = CONST.CURRENCY.USD, isEditing = false, title = '', onBackButtonPress, onCurrencyButtonPress, onSubmitButtonPress}) {
    const {translate, toLocaleDigit, fromLocaleDigit, numberFormat} = useLocalize();

    const selectedAmountAsString = amount ? CurrencyUtils.convertToWholeUnit(currency, amount).toString() : '';

    const [currentAmount, setCurrentAmount] = useState(selectedAmountAsString);
    const [shouldUpdateSelection, setShouldUpdateSelection] = useState(true);

    const [selection, setSelection] = useState({
        start: selectedAmountAsString.length,
        end: selectedAmountAsString.length,
    });

    const textInput = useRef(null);

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

    /**
     * Focus text input
     */
    const focusTextInput = () => {
        // Component may not be initialized due to navigation transitions
        // Wait until interactions are complete before trying to focus
        InteractionManager.runAfterInteractions(() => {
            // Focus text input
            if (!textInput.current) {
                return;
            }

            textInput.current.focus();
        });
    };

    /**
     * Convert amount to whole unit and update selection
     *
     * @param {String} currencyCode
     * @param {Number} amountInCurrencyUnits
     */
    const saveAmountToState = (currencyCode, amountInCurrencyUnits) => {
        if (!currencyCode || !amountInCurrencyUnits) {
            return;
        }
        const amountAsStringForState = CurrencyUtils.convertToWholeUnit(currencyCode, amountInCurrencyUnits).toString();
        setCurrentAmount(amountAsStringForState);
        setSelection({
            start: amountAsStringForState.length,
            end: amountAsStringForState.length,
        });
    };

    useEffect(() => {
        saveAmountToState(currency, amount);
    }, [amount, currency]);

    useFocusEffect(
        useCallback(() => {
            focusTextInput();
        }, []),
    );

    /**
     * Sets the state according to amount that is passed
     * @param {String} newAmount - Changed amount from user input
     */
    const setNewAmount = (newAmount) => {
        // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
        // More info: https://github.com/Expensify/App/issues/16974
        const newAmountWithoutSpaces = MoneyRequestUtils.stripSpacesFromAmount(newAmount);
        // Use a shallow copy of selection to trigger setSelection
        // More info: https://github.com/Expensify/App/issues/16385
        if (!MoneyRequestUtils.validateAmount(newAmountWithoutSpaces)) {
            setCurrentAmount((prevAmount) => prevAmount);
            setSelection((prevSelection) => ({...prevSelection}));
            return;
        }
        setCurrentAmount((prevAmount) => {
            setSelection((prevSelection) => MoneyRequestUtils.getNewSelection(prevSelection, prevAmount.length, newAmountWithoutSpaces.length));
            return MoneyRequestUtils.stripCommaFromAmount(newAmountWithoutSpaces);
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
     * Update amount on amount change
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit
     *
     * @param {String} text - Changed text from user input
     */
    const updateAmount = (text) => {
        const newAmount = MoneyRequestUtils.addLeadingZero(MoneyRequestUtils.replaceAllDigits(text, fromLocaleDigit));
        setNewAmount(newAmount);
    };

    /**
     * Submit amount and navigate to a proper page
     *
     */
    const handleSubmit = useCallback(() => {
        onSubmitButtonPress(currentAmount);
    }, [onSubmitButtonPress, currentAmount]);

    const formattedAmount = MoneyRequestUtils.replaceAllDigits(currentAmount, toLocaleDigit);
    const buttonText = isEditing ? translate('common.save') : translate('common.next');

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            onEntryTransitionEnd={focusTextInput}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={title}
                        onBackButtonPress={onBackButtonPress}
                    />
                    <View
                        nativeID={amountViewID}
                        onMouseDown={(event) => onMouseDown(event, [amountViewID])}
                        style={[styles.flex1, styles.flexRow, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}
                    >
                        <TextInputWithCurrencySymbol
                            formattedAmount={formattedAmount}
                            onChangeAmount={updateAmount}
                            onCurrencyButtonPress={onCurrencyButtonPress}
                            placeholder={numberFormat(0)}
                            ref={textInput}
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
                        ) : null}
                        <Button
                            success
                            style={[styles.w100, styles.mt5]}
                            onPress={handleSubmit}
                            pressOnEnter
                            isDisabled={!currentAmount.length || parseFloat(currentAmount) < 0.01}
                            text={buttonText}
                        />
                    </View>
                </View>
            )}
        </ScreenWrapper>
    );
}

MoneyRequestAmountForm.propTypes = propTypes;
MoneyRequestAmountForm.displayName = 'MoneyRequestAmountForm';

export default MoneyRequestAmountForm;
