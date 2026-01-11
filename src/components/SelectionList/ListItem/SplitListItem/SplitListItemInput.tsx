import React from 'react';
import type {BlurEvent} from 'react-native';
import type {SplitListItemType} from '@components/SelectionList/ListItem/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import SplitAmountInput from './SplitAmountInput';
import SplitPercentageInput from './SplitPercentageInput';

type SplitListItemInputProps = {
    /** Whether the list is percentage mode (for scroll offset calculation) */
    isPercentageMode: boolean;
    /** The split item data containing amount, currency, and editable state. */
    splitItem: SplitListItemType;
    /** The width of the input content area. */
    contentWidth: number;
    /** The formatted original amount string used to calculate max input length. */
    formattedOriginalAmount: string;
    /** The draft percentage value while the user is editing. */
    percentageDraft?: string;
    /** Callback invoked when the split expense value changes. */
    onSplitExpenseValueChange: (value: string) => void;
    /** State setter for the percentage draft value. */
    setPercentageDraft: React.Dispatch<React.SetStateAction<string | undefined>>;
    /** Callback invoked when the input receives focus. */
    focusHandler: () => void;
    /** Callback invoked when the input loses focus. */
    onInputBlur: ((e: BlurEvent) => void) | undefined;
    /** Callback ref for accessing the underlying text input. */
    inputCallbackRef: (ref: BaseTextInputRef | null) => void;
};

function SplitListItemInput({
    isPercentageMode,
    splitItem,
    contentWidth,
    formattedOriginalAmount,
    percentageDraft,
    onSplitExpenseValueChange,
    setPercentageDraft,
    focusHandler,
    onInputBlur,
    inputCallbackRef,
}: SplitListItemInputProps) {
    if (isPercentageMode) {
        return (
            <SplitPercentageInput
                splitItem={splitItem}
                contentWidth={contentWidth}
                percentageDraft={percentageDraft}
                onSplitExpenseValueChange={onSplitExpenseValueChange}
                setPercentageDraft={setPercentageDraft}
                focusHandler={focusHandler}
                onInputBlur={onInputBlur}
            />
        );
    }
    return (
        <SplitAmountInput
            splitItem={splitItem}
            contentWidth={contentWidth}
            formattedOriginalAmount={formattedOriginalAmount}
            onSplitExpenseValueChange={onSplitExpenseValueChange}
            focusHandler={focusHandler}
            onInputBlur={onInputBlur}
            inputCallbackRef={inputCallbackRef}
        />
    );
}

export default SplitListItemInput;
