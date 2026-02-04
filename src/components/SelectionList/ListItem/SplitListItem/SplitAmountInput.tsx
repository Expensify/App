import React from 'react';
import type {BlurEvent} from 'react-native';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import type {SplitListItemType} from '@components/SelectionList/ListItem/types';
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
    const styles = useThemeStyles();

    if (splitItem.isEditable) {
        return (
            <MoneyRequestAmountInput
                ref={inputCallbackRef}
                disabled={!splitItem.isEditable}
                autoGrow={false}
                amount={splitItem.amount}
                currency={splitItem.currency}
                prefixCharacter={splitItem.currencySymbol}
                disableKeyboard={false}
                isCurrencyPressable={false}
                hideFocusedState={false}
                hideCurrencySymbol
                submitBehavior="blurAndSubmit"
                formatAmountOnBlur
                onAmountChange={onSplitExpenseValueChange}
                prefixContainerStyle={[styles.pv0, styles.h100]}
                prefixStyle={styles.lineHeightUndefined}
                inputStyle={[styles.lineHeightUndefined]}
                containerStyle={[styles.textInputContainer, styles.pl2, styles.pr1]}
                touchableInputWrapperStyle={[styles.ml3]}
                maxLength={formattedOriginalAmount.length + 1}
                contentWidth={contentWidth}
                shouldApplyPaddingToContainer
                shouldUseDefaultLineHeightForPrefix={false}
                shouldWrapInputInContainer={false}
                onFocus={focusHandler}
                onBlur={onInputBlur}
            />
        );
    }
    return (
        <SplitAmountDisplay
            splitItem={splitItem}
            contentWidth={contentWidth}
        />
    );
}

export default SplitAmountInput;
