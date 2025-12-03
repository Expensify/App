import React from 'react';
import type {BlurEvent} from 'react-native';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import type {SplitListItemType} from '@components/SelectionListWithSections/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useThemeStyles from '@hooks/useThemeStyles';
import SplitAmountDisplay from './SplitAmountDisplay';

type SplitAmountInputProps = {
    /**
     * Split list item associated with this row, containing the amount, currency and symbol to display.
     */
    splitItem: SplitListItemType;
    /**
     * Original total amount formatted as a string, used to determine the maximum input length for this split.
     */
    formattedOriginalAmount: string;
    /**
     * Width of the editable amount input content area in pixels.
     */
    contentWidth: number;
    /**
     * Callback invoked when the split amount value changes, receiving the new amount as a string.
     */
    onSplitExpenseValueChange: (value: string) => void;
    /**
     * Callback fired when the amount input gains focus (e.g. to mark the row as active).
     */
    focusHandler: () => void;
    /**
     * Optional callback fired when the amount input loses focus.
     */
    onInputBlur: ((e: BlurEvent) => void) | undefined;
    /**
     * Ref callback used to capture the underlying text input instance for programmatic focus/blur.
     */
    inputCallbackRef: (ref: BaseTextInputRef | null) => void;
};

function SplitAmountInput({splitItem, formattedOriginalAmount, contentWidth, onSplitExpenseValueChange, focusHandler, onInputBlur, inputCallbackRef}: SplitAmountInputProps) {
    const styles = useThemeStyles();

    if (splitItem.isEditable) {
        return (
            <MoneyRequestAmountInput
                ref={inputCallbackRef}
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

SplitAmountInput.displayName = 'SplitAmountInput';

export default SplitAmountInput;
