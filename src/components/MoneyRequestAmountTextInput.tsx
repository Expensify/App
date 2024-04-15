import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import * as Browser from '@libs/Browser';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import getOperatingSystem from '@libs/getOperatingSystem';
import type {MaybePhraseKey} from '@libs/Localize';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import CONST from '@src/CONST';
import type {SelectedTabRequest} from '@src/types/onyx';
import type {BaseTextInputRef} from './TextInput/BaseTextInput/types';
import TextInputWithCurrencySymbol from './TextInputWithCurrencySymbol';

type MoneyRequestAmountFormProps = {
    /** IOU amount saved in Onyx */
    amount?: number;

    /** Currency chosen by user or saved in Onyx */
    currency?: string;

    /** Whether the currency symbol is pressable */
    isCurrencyPressable?: boolean;

    /** Fired when back button pressed, navigates to currency selection page */
    onCurrencyButtonPress?: () => void;

    /** The current tab we have navigated to in the request modal. String that corresponds to the request type. */
    selectedTab?: SelectedTabRequest;
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

function MoneyRequestAmountTextInput(
    {amount = 0, currency = CONST.CURRENCY.USD, isCurrencyPressable = true, onCurrencyButtonPress, selectedTab = CONST.TAB_REQUEST.MANUAL}: MoneyRequestAmountFormProps,
    forwardedRef: ForwardedRef<BaseTextInputRef>,
) {
    const {toLocaleDigit, numberFormat} = useLocalize();
    const textInput = useRef<BaseTextInputRef | null>(null);

    const decimals = CurrencyUtils.getCurrencyDecimals(currency);
    const selectedAmountAsString = amount ? CurrencyUtils.convertToFrontendAmount(amount).toString() : '';

    const [currentAmount, setCurrentAmount] = useState(selectedAmountAsString);
    const [formError, setFormError] = useState<MaybePhraseKey>('');

    const [selection, setSelection] = useState({
        start: selectedAmountAsString.length,
        end: selectedAmountAsString.length,
    });

    const forwardDeletePressedRef = useRef(false);

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
        // we want to re-initialize the state only when the amount changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amount]);

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

    useEffect(() => {});

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

    useEffect(() => {
        setFormError('');
    }, [selectedTab]);

    return (
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
                const maxSelection = formattedAmount.length;
                const start = Math.min(e.nativeEvent.selection.start, maxSelection);
                const end = Math.min(e.nativeEvent.selection.end, maxSelection);
                setSelection({start, end});
            }}
            onKeyPress={textInputKeyPress}
            isCurrencyPressable={isCurrencyPressable}
            hideCurrencySymbol
            style={{width: 50}}
            isFullPageAmount={false}
        />
    );
}

MoneyRequestAmountTextInput.displayName = 'MoneyRequestAmountTextInput';

export default React.forwardRef(MoneyRequestAmountTextInput);
