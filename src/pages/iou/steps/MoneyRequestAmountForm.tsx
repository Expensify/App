import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
import type {ValueOf} from 'type-fest';
import BigNumberPad from '@components/BigNumberPad';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import ScrollView from '@components/ScrollView';
import TextInputWithCurrencySymbol from '@components/TextInputWithCurrencySymbol';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import getOperatingSystem from '@libs/getOperatingSystem';
import type {MaybePhraseKey} from '@libs/Localize';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {BaseTextInputRef} from '@src/components/TextInput/BaseTextInput/types';
import CONST from '@src/CONST';

type MoneyRequestAmountFormProps = {
    /** IOU amount saved in Onyx */
    amount?: number;

    /** Calculated tax amount based on selected tax rate */
    taxAmount?: number;

    /** Currency chosen by user or saved in Onyx */
    currency?: string;

    /** Whether the amount is being edited or not */
    isEditing?: boolean;

    /** Fired when back button pressed, navigates to currency selection page */
    onCurrencyButtonPress: () => void;

    /** Fired when submit button pressed, saves the given amount and navigates to the next page */
    onSubmitButtonPress: ({amount, currency}: {amount: string; currency: string}) => void;

    /** The current tab we have navigated to in the request modal. String that corresponds to the request type. */
    selectedTab?: ValueOf<typeof CONST.TAB_REQUEST>;
};

type Selection = {
    start: number;
    end: number;
};

/**
 * Returns the new selection object based on the updated amount's length
 */
const getNewSelection = (oldSelection: Selection, prevLength: number, newLength: number): Selection => {
    const cursorPosition = oldSelection.end + (newLength - prevLength);
    return {start: cursorPosition, end: cursorPosition};
};

const isAmountInvalid = (amount: string) => !amount.length || parseFloat(amount) < 0.01;
const isTaxAmountInvalid = (currentAmount: string, taxAmount: number, isTaxAmountForm: boolean) =>
    isTaxAmountForm && Number.parseFloat(currentAmount) > CurrencyUtils.convertToFrontendAmount(taxAmount);

const AMOUNT_VIEW_ID = 'amountView';
const NUM_PAD_CONTAINER_VIEW_ID = 'numPadContainerView';
const NUM_PAD_VIEW_ID = 'numPadView';

function MoneyRequestAmountForm(
    {
        amount = 0,
        taxAmount = 0,
        currency = CONST.CURRENCY.USD,
        isEditing = false,
        onCurrencyButtonPress,
        onSubmitButtonPress,
        selectedTab = CONST.TAB_REQUEST.MANUAL,
    }: MoneyRequestAmountFormProps,
    forwardedRef: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    const {isExtraSmallScreenHeight} = useWindowDimensions();
    const {translate, toLocaleDigit, numberFormat} = useLocalize();

    const textInput = useRef<BaseTextInputRef | null>(null);
    const isTaxAmountForm = Navigation.getActiveRoute().includes('taxAmount');

    const decimals = CurrencyUtils.getCurrencyDecimals(currency);
    const selectedAmountAsString = amount ? CurrencyUtils.convertToFrontendAmount(amount).toString() : '';

    const [currentAmount, setCurrentAmount] = useState(selectedAmountAsString);
    const [formError, setFormError] = useState<MaybePhraseKey>('');
    const [shouldUpdateSelection, setShouldUpdateSelection] = useState(true);

    const [selection, setSelection] = useState({
        start: selectedAmountAsString.length,
        end: selectedAmountAsString.length,
    });

    const forwardDeletePressedRef = useRef(false);

    const formattedTaxAmount = CurrencyUtils.convertToDisplayString(taxAmount, currency);

    /**
     * Event occurs when a user presses a mouse button over an DOM element.
     */
    const onMouseDown = (event: React.MouseEvent<Element, MouseEvent>, ids: string[]) => {
        const relatedTargetId = (event.nativeEvent?.target as HTMLElement)?.id;
        if (!ids.includes(relatedTargetId)) {
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

    /**
     * Sets the selection and the amount accordingly to the value passed to the input
     * @param {String} newAmount - Changed amount from user input
     */
    const setNewAmount = useCallback(
        (newAmount: string) => {
            // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
            // More info: https://github.com/Expensify/App/issues/16974
            const newAmountWithoutSpaces = MoneyRequestUtils.stripSpacesFromAmount(newAmount);
            // Use a shallow copy of selection to trigger setSelection
            // More info: https://github.com/Expensify/App/issues/16385
            if (!MoneyRequestUtils.validateAmount(newAmountWithoutSpaces, decimals)) {
                setSelection((prevSelection) => ({...prevSelection}));
                return;
            }
            if (formError) {
                setFormError('');
            }

            // setCurrentAmount contains another setState(setSelection) making it error-prone since it is leading to setSelection being called twice for a single setCurrentAmount call. This solution introducing the hasSelectionBeenSet flag was chosen for its simplicity and lower risk of future errors https://github.com/Expensify/App/issues/23300#issuecomment-1766314724.

            let hasSelectionBeenSet = false;
            setCurrentAmount((prevAmount) => {
                const strippedAmount = MoneyRequestUtils.stripCommaFromAmount(newAmountWithoutSpaces);
                const isForwardDelete = prevAmount.length > strippedAmount.length && forwardDeletePressedRef.current;
                if (!hasSelectionBeenSet) {
                    hasSelectionBeenSet = true;
                    setSelection((prevSelection) => getNewSelection(prevSelection, isForwardDelete ? strippedAmount.length : prevAmount.length, strippedAmount.length));
                }
                return strippedAmount;
            });
        },
        [decimals, formError],
    );

    // Modifies the amount to match the decimals for changed currency.
    useEffect(() => {
        // If the changed currency supports decimals, we can return
        if (MoneyRequestUtils.validateAmount(currentAmount, decimals)) {
            return;
        }

        // If the changed currency doesn't support decimals, we can strip the decimals
        setNewAmount(MoneyRequestUtils.stripDecimalsFromAmount(currentAmount));

        // we want to update only when decimals change (setNewAmount also changes when decimals change).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setNewAmount]);

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
                    setNewAmount(MoneyRequestUtils.addLeadingZero(newAmount));
                }
                return;
            }
            const newAmount = MoneyRequestUtils.addLeadingZero(`${currentAmount.substring(0, selection.start)}${key}${currentAmount.substring(selection.end)}`);
            setNewAmount(newAmount);
        },
        [currentAmount, selection, shouldUpdateSelection, setNewAmount],
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
        if (isAmountInvalid(currentAmount)) {
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
    }, [onSubmitButtonPress, currentAmount, taxAmount, currency, isTaxAmountForm, formattedTaxAmount, initializeAmount]);

    /**
     * Input handler to check for a forward-delete key (or keyboard shortcut) press.
     */
    const textInputKeyPress = ({nativeEvent}: NativeSyntheticEvent<KeyboardEvent>) => {
        const key = nativeEvent?.key.toLowerCase();
        if (Browser.isMobileSafari() && key === CONST.PLATFORM_SPECIFIC_KEYS.CTRL.DEFAULT) {
            // Optimistically anticipate forward-delete on iOS Safari (in cases where the Mac Accessiblity keyboard is being
            // used for input). If the Control-D shortcut doesn't get sent, the ref will still be reset on the next key press.
            forwardDeletePressedRef.current = true;
            return;
        }
        // Control-D on Mac is a keyboard shortcut for forward-delete. See https://support.apple.com/en-us/HT201236 for Mac keyboard shortcuts.
        // Also check for the keyboard shortcut on iOS in cases where a hardware keyboard may be connected to the device.
        const operatingSystem = getOperatingSystem();
        forwardDeletePressedRef.current = key === 'delete' || ((operatingSystem === CONST.OS.MAC_OS || operatingSystem === CONST.OS.IOS) && nativeEvent?.ctrlKey && key === 'd');
    };

    const formattedAmount = MoneyRequestUtils.replaceAllDigits(currentAmount, toLocaleDigit);
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
                <TextInputWithCurrencySymbol
                    formattedAmount={formattedAmount}
                    onChangeAmount={setNewAmount}
                    onCurrencyButtonPress={onCurrencyButtonPress}
                    placeholder={numberFormat(0)}
                    ref={(ref) => {
                        if (typeof forwardedRef === 'function') {
                            forwardedRef(ref);
                        } else if (forwardedRef?.current) {
                            // eslint-disable-next-line no-param-reassign
                            forwardedRef.current = ref;
                        }
                        textInput.current = ref;
                    }}
                    selectedCurrencyCode={currency}
                    selection={selection}
                    onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
                        if (!shouldUpdateSelection) {
                            return;
                        }
                        const maxSelection = formattedAmount.length;
                        const start = Math.min(e.nativeEvent.selection.start, maxSelection);
                        const end = Math.min(e.nativeEvent.selection.end, maxSelection);
                        setSelection({start, end});
                    }}
                    onKeyPress={textInputKeyPress}
                    isCurrencyPressable
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
