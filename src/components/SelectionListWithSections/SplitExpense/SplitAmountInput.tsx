import React from 'react';
import type {BlurEvent} from 'react-native';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import type {SplitListItemType} from '@components/SelectionListWithSections/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useThemeStyles from '@hooks/useThemeStyles';
import SplitAmountDisplay from './SplitAmountDisplay';

type SplitAmountInputProps = {
    splitItem: SplitListItemType;
    formattedOriginalAmount: string;
    contentWidth: number;
    onSplitExpenseValueChange: (value: string) => void;
    focusHandler: () => void;
    onInputBlur: ((e: BlurEvent) => void) | undefined;
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
