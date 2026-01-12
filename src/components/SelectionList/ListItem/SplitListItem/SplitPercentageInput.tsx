import React from 'react';
import type {BlurEvent} from 'react-native';
import PercentageForm from '@components/PercentageForm';
import type {SplitListItemType} from '@components/SelectionList/ListItem/types';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import SplitPercentageDisplay from './SplitPercentageDisplay';

type SplitPercentageInputProps = {
    /** The split item data containing amount, currency, and editable state. */
    splitItem: SplitListItemType;
    /** The width of the input content area. */
    contentWidth: number;
    /** The draft percentage value while the user is editing. */
    percentageDraft: string | undefined;
    /** Callback invoked when the split expense value changes. */
    onSplitExpenseValueChange: (value: string) => void;
    /** State setter for the percentage draft value. */
    setPercentageDraft: React.Dispatch<React.SetStateAction<string | undefined>>;
    /** Callback invoked when the input receives focus. */
    focusHandler: () => void;
    /** Callback invoked when the input loses focus. */
    onInputBlur: ((e: BlurEvent) => void) | undefined;
};

function SplitPercentageInput({splitItem, contentWidth, percentageDraft, onSplitExpenseValueChange, setPercentageDraft, focusHandler, onInputBlur}: SplitPercentageInputProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const inputValue = percentageDraft ?? String(splitItem.percentage ?? 0);

    if (splitItem.isEditable) {
        return (
            <PercentageForm
                onInputChange={(value) => {
                    setPercentageDraft(value);
                    onSplitExpenseValueChange(value);
                }}
                value={inputValue}
                textInputContainerStyles={StyleUtils.splitPercentageInputStyles(styles)}
                containerStyles={[styles.optionRowPercentInputContainer, styles.ml3]}
                inputStyle={[styles.optionRowPercentInput, styles.lineHeightUndefined]}
                onFocus={focusHandler}
                onBlur={(event) => {
                    setPercentageDraft(undefined);
                    if (onInputBlur) {
                        onInputBlur(event);
                    }
                }}
                allowExceedingHundred
                allowDecimal
            />
        );
    }
    return (
        <SplitPercentageDisplay
            splitItem={splitItem}
            contentWidth={contentWidth}
        />
    );
}

export default SplitPercentageInput;
