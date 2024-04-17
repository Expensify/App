import {useIsFocused} from '@react-navigation/core';
import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import BigNumberPad from '@components/BigNumberPad';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import type {MaybePhraseKey} from '@libs/Localize';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {BaseTextInputRef} from '@src/components/TextInput/BaseTextInput/types';
import CONST from '@src/CONST';
import type {SelectedTabRequest} from '@src/types/onyx';
import MoneyRequestAmountInput from './MoneyRequestAmountInput';

type CurrentMoney = {amount: string; currency: string};

type MoneyRequestAmountFormProps = {
    /** IOU amount saved in Onyx */
    amount?: number;

    /** Calculated tax amount based on selected tax rate */
    taxAmount?: number;

    /** Currency chosen by user or saved in Onyx */
    currency?: string;

    /** Whether the amount is being edited or not */
    isEditing?: boolean;

    /** Whether the currency symbol is pressable */
    isCurrencyPressable?: boolean;

    /** Fired when back button pressed, navigates to currency selection page */
    onCurrencyButtonPress?: () => void;

    /** Fired when submit button pressed, saves the given amount and navigates to the next page */
    onSubmitButtonPress: (currentMoney: CurrentMoney) => void;

    /** The current tab we have navigated to in the expense modal. String that corresponds to the expense type. */
    selectedTab?: SelectedTabRequest;
};

const isAmountInvalid = (amount: string) => !amount.length || parseFloat(amount) < 0.01;
const isTaxAmountInvalid = (currentAmount: string, taxAmount: number, isTaxAmountForm: boolean) =>
    isTaxAmountForm && Number.parseFloat(currentAmount) > CurrencyUtils.convertToFrontendAmount(Math.abs(taxAmount));

const AMOUNT_VIEW_ID = 'amountView';
const NUM_PAD_CONTAINER_VIEW_ID = 'numPadContainerView';
const NUM_PAD_VIEW_ID = 'numPadView';

function MoneyRequestAmountForm(
    {
        amount = 0,
        taxAmount = 0,
        currency = CONST.CURRENCY.USD,
        isCurrencyPressable = true,
        isEditing = false,
        onCurrencyButtonPress,
        onSubmitButtonPress,
        selectedTab = CONST.TAB_REQUEST.MANUAL,
    }: MoneyRequestAmountFormProps,
    forwardedRef: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    const {isExtraSmallScreenHeight} = useWindowDimensions();
    const {translate} = useLocalize();

    const textInput = useRef<BaseTextInputRef | null>(null);
    const moneyRequestAmountInput = useRef<{changeAmount: (amount: string) => void} | null>(null);
    const isTaxAmountForm = Navigation.getActiveRoute().includes('taxAmount');

    const selectedAmountAsString = amount ? CurrencyUtils.convertToFrontendAmount(amount).toString() : '';

    const [currentAmount, setCurrentAmount] = useState(selectedAmountAsString);
    const [formError, setFormError] = useState<MaybePhraseKey>('');
    const [shouldUpdateSelection, setShouldUpdateSelection] = useState(true);

    const isFocused = useIsFocused();
    const wasFocused = usePrevious(isFocused);

    const [selection, setSelection] = useState({
        start: selectedAmountAsString.length,
        end: selectedAmountAsString.length,
    });

    const formattedTaxAmount = CurrencyUtils.convertToDisplayString(Math.abs(taxAmount), currency);

    /**
     * Event occurs when a user presses a mouse button over an DOM element.
     */
    const onMouseDown = (event: React.MouseEvent<Element, MouseEvent>, ids: string[]) => {
        const relatedTargetId = (event.nativeEvent?.target as HTMLElement)?.id;
        if (!ids.includes(relatedTargetId)) {
            return;
        }

        event.preventDefault();
        setSelection({
            start: selection.end,
            end: selection.end,
        });

        if (!textInput.current) {
            return;
        }
        if (!textInput.current.isFocused()) {
            textInput.current.focus();
        }
    };

    const initializeAmount = useCallback((newAmount: number) => {
        const frontendAmount = newAmount ? CurrencyUtils.convertToFrontendAmount(newAmount).toString() : '';
        setCurrentAmount(frontendAmount);
        setSelection({
            start: frontendAmount.length,
            end: frontendAmount.length,
        });
    }, []);

    useEffect(() => {
        if (!currency || typeof amount !== 'number') {
            return;
        }
        initializeAmount(amount);
        // we want to re-initialize the state only when the selected tab or amount changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTab, amount]);

    // Removes text selection if user visits currency selector with selection and comes back
    useEffect(() => {
        if (!isFocused || wasFocused) {
            return;
        }

        setSelection({
            start: selection.end,
            end: selection.end,
        });
    }, [selection.end, isFocused, selection, wasFocused]);

    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     */
    const updateAmountNumberPad = useCallback(
        (key: string) => {
            if (shouldUpdateSelection && !textInput.current?.isFocused()) {
                textInput.current?.focus();
            }
            // Backspace button is pressed
            if (key === '<' || key === 'Backspace') {
                if (currentAmount.length > 0) {
                    const selectionStart = selection.start === selection.end ? selection.start - 1 : selection.start;
                    const newAmount = `${currentAmount.substring(0, selectionStart)}${currentAmount.substring(selection.end)}`;
                    moneyRequestAmountInput.current?.changeAmount(MoneyRequestUtils.addLeadingZero(newAmount));
                }
                return;
            }
            const newAmount = MoneyRequestUtils.addLeadingZero(`${currentAmount.substring(0, selection.start)}${key}${currentAmount.substring(selection.end)}`);
            moneyRequestAmountInput.current?.changeAmount(newAmount);
        },
        [currentAmount, selection, shouldUpdateSelection],
    );

    /**
     * Update long press value, to remove items pressing on <
     *
     * @param value - Changed text from user input
     */
    const updateLongPressHandlerState = useCallback((value: boolean) => {
        setShouldUpdateSelection(!value);
        if (!value && !textInput.current?.isFocused()) {
            textInput.current?.focus();
        }
    }, []);

    /**
     * Submit amount and navigate to a proper page
     */
    const submitAndNavigateToNextPage = useCallback(() => {
        // Skip the check for tax amount form as 0 is a valid input
        if (!currentAmount.length || (!isTaxAmountForm && isAmountInvalid(currentAmount))) {
            setFormError('iou.error.invalidAmount');
            return;
        }

        if (isTaxAmountInvalid(currentAmount, taxAmount, isTaxAmountForm)) {
            setFormError(['iou.error.invalidTaxAmount', {amount: formattedTaxAmount}]);
            return;
        }

        // Update display amount string post-edit to ensure consistency with backend amount
        // Reference: https://github.com/Expensify/App/issues/30505
        const backendAmount = CurrencyUtils.convertToBackendAmount(Number.parseFloat(currentAmount));
        initializeAmount(backendAmount);

        onSubmitButtonPress({amount: currentAmount, currency});
    }, [currentAmount, taxAmount, isTaxAmountForm, onSubmitButtonPress, currency, formattedTaxAmount, initializeAmount]);

    const buttonText = isEditing ? translate('common.save') : translate('common.next');
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();

    useEffect(() => {
        setFormError('');
    }, [selectedTab]);

    return (
        <ScrollView contentContainerStyle={styles.flexGrow1}>
            <View
                id={AMOUNT_VIEW_ID}
                onMouseDown={(event) => onMouseDown(event, [AMOUNT_VIEW_ID])}
                style={[styles.moneyRequestAmountContainer, styles.flex1, styles.flexRow, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}
            >
                <MoneyRequestAmountInput
                    amount={amount}
                    currency={currency}
                    isCurrencyPressable={isCurrencyPressable}
                    onCurrencyButtonPress={onCurrencyButtonPress}
                    selectedTab={selectedTab}
                    onAmountChange={() => {
                        if (!formError) {
                            return;
                        }
                        setFormError('');
                    }}
                    shouldUpdateSelection={shouldUpdateSelection}
                    ref={(ref) => {
                        if (typeof forwardedRef === 'function') {
                            forwardedRef(ref);
                        } else if (forwardedRef?.current) {
                            // eslint-disable-next-line no-param-reassign
                            forwardedRef.current = ref;
                        }
                        textInput.current = ref;
                    }}
                    moneyRequestAmountInputRef={moneyRequestAmountInput}
                    style={[styles.iouAmountTextInput, styles.p0, styles.noLeftBorderRadius, styles.noRightBorderRadius, styles.timePickerInput]}
                    containerStyle={[styles.borderNone, styles.noLeftBorderRadius, styles.noRightBorderRadius]}
                />
                {!!formError && (
                    <FormHelpMessage
                        style={[styles.pAbsolute, styles.b0, styles.mb0, styles.ph5, styles.w100]}
                        isError
                        message={formError}
                    />
                )}
            </View>
            <View
                onMouseDown={(event) => onMouseDown(event, [NUM_PAD_CONTAINER_VIEW_ID, NUM_PAD_VIEW_ID])}
                style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper, styles.pt0]}
                id={NUM_PAD_CONTAINER_VIEW_ID}
            >
                {canUseTouchScreen ? (
                    <BigNumberPad
                        id={NUM_PAD_VIEW_ID}
                        numberPressed={updateAmountNumberPad}
                        longPressHandlerStateChanged={updateLongPressHandlerState}
                    />
                ) : null}
                <Button
                    success
                    // Prevent bubbling on edit amount Page to prevent double page submission when two CTA are stacked.
                    allowBubble={!isEditing}
                    pressOnEnter
                    medium={isExtraSmallScreenHeight}
                    large={!isExtraSmallScreenHeight}
                    style={[styles.w100, canUseTouchScreen ? styles.mt5 : styles.mt3]}
                    onPress={submitAndNavigateToNextPage}
                    text={buttonText}
                />
            </View>
        </ScrollView>
    );
}

MoneyRequestAmountForm.displayName = 'MoneyRequestAmountForm';

export default React.forwardRef(MoneyRequestAmountForm);
export type {CurrentMoney};
