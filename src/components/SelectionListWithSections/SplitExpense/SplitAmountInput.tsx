import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {BlurEvent} from 'react-native';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import type {SplitListItemType} from '@components/SelectionListWithSections/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useThemeStyles from '@hooks/useThemeStyles';
import SplitAmountDisplay from './SplitAmountDisplay';

type SplitAmountInputProps = {
    /** The split item data containing amount, currency, and editable state. */
    splitItem: SplitListItemType;
    /** The formatted original amount string used to calculate max input length. */
    formattedOriginalAmount: string;
    /** The width of the input content area. */
    contentWidth: number;
    /** Callback invoked when the split expense value changes. */
    onSplitExpenseValueChange: (value: string) => void;
    /** Callback invoked when the input receives focus. */
    focusHandler: () => void;
    /** Callback invoked when the input loses focus. */
    onInputBlur: ((e: BlurEvent) => void) | undefined;
    /** Callback ref for accessing the underlying text input. */
    inputCallbackRef: (ref: BaseTextInputRef | null) => void;
};

function SplitAmountInput({splitItem, formattedOriginalAmount, contentWidth, onSplitExpenseValueChange, focusHandler, onInputBlur, inputCallbackRef}: SplitAmountInputProps) {
    if (!splitItem.isEditable) {
        return (
            <SplitAmountDisplay
                splitItem={splitItem}
                contentWidth={contentWidth}
            />
        );
    }

    const styles = useThemeStyles();

    const [isNegativeAmount, setIsNegativeAmount] = useState(splitItem.amount < 0);

    const onSplitExpenseAmountChange = useCallback(
        (amount: string) => {
            const realAmount = isNegativeAmount ? -1 * Number(amount) : Number(amount);

            // Skip handling amount changes to prevent a race condition when the user toggles the negative sign,
            // which could cause an incorrect amount update.
            if (convertToBackendAmount(realAmount) === splitItem.amount) {
                return;
            }
            onSplitExpenseValueChange(String(realAmount));
        },
        [splitItem.onSplitExpenseAmountChange, isNegativeAmount, splitItem.amount, splitItem.transactionID],
    );

    const canUseTouchScreen = useMemo(() => canUseTouchScreenUtil(), []);
    const displayedAmount = useMemo(() => Math.abs(splitItem.amount), [splitItem.amount]);

    useEffect(() => {
        if (splitItem.amount === 0) {
            return;
        }
        setIsNegativeAmount(splitItem.amount < 0);
    }, [splitItem.amount]);

    const handleToggleNegative = useCallback(() => {
        const isCurrentlyNegative = !isNegativeAmount;
        const currentAbsAmount = Math.abs(convertToFrontendAmountAsInteger(splitItem.amount, splitItem.currency));
        if (currentAbsAmount === 0) {
            setIsNegativeAmount(isCurrentlyNegative);
            return;
        }

        const realAmount = isCurrentlyNegative ? -1 * currentAbsAmount : currentAbsAmount;
        onSplitExpenseValueChange(String(realAmount));
    }, [splitItem.amount, splitItem.currency, splitItem.onSplitExpenseAmountChange, splitItem.transactionID, isNegativeAmount]);

    const handleClearNegative = useCallback(() => {
        if (canUseTouchScreen) {
            return;
        }

        setIsNegativeAmount(false);
    }, [canUseTouchScreen]);

    return (
        <MoneyRequestAmountInput
            ref={inputCallbackRef}
            disabled={!splitItem.isEditable}
            autoGrow={false}
            amount={displayedAmount}
            currency={splitItem.currency}
            prefixCharacter={splitItem.currencySymbol}
            disableKeyboard={false}
            isCurrencyPressable={false}
            hideFocusedState={false}
            hideCurrencySymbol
            submitBehavior="blurAndSubmit"
            formatAmountOnBlur
            onAmountChange={onSplitExpenseAmountChange}
            prefixContainerStyle={[styles.pv0, styles.h100]}
            prefixStyle={styles.lineHeightUndefined}
            inputStyle={[styles.optionRowAmountInput, styles.lineHeightUndefined]}
            containerStyle={[styles.textInputContainer, styles.pl2, styles.pr1]}
            touchableInputWrapperStyle={[styles.ml3]}
            maxLength={formattedOriginalAmount.length + 1}
            contentWidth={contentWidth}
            shouldApplyPaddingToContainer
            shouldUseDefaultLineHeightForPrefix={false}
            shouldWrapInputInContainer={false}
            onFocus={focusHandler}
            onBlur={onInputBlur}
            toggleNegative={handleToggleNegative}
            clearNegative={handleClearNegative}
            isNegative={isNegativeAmount}
            allowFlippingAmount
            isSplitItemInput
        />
    );
}

SplitAmountInput.displayName = 'SplitAmountInput';

export default SplitAmountInput;
