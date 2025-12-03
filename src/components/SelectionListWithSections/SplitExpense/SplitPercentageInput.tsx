import React from 'react';
import type {BlurEvent} from 'react-native';
import PercentageForm from '@components/PercentageForm';
import type {SplitListItemType} from '@components/SelectionListWithSections/types';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import SplitPercentageDisplay from './SplitPercentageDisplay';

type SplitAmountInputProps = {
    /**
     * Split list item associated with this row, containing the amount, currency and symbol to display.
     */
    splitItem: SplitListItemType;
    /**
     * Width of the editable amount input content area in pixels.
     */
    contentWidth: number;
    /**
     * In-progress percentage value while the user is editing, or undefined to fall back to the persisted percentage.
     */
    percentageDraft: string | undefined;
    /**
     * Callback invoked when the percentage value changes, receiving the new percentage string.
     */
    onSplitExpenseValueChange: (value: string) => void;
    /**
     * State setter for the draft percentage value used to control the input while editing.
     */
    setPercentageDraft: React.Dispatch<React.SetStateAction<string | undefined>>;
    /**
     * Callback fired when the amount input gains focus (e.g. to mark the row as active).
     */
    focusHandler: () => void;
    /**
     * Optional callback fired when the amount input loses focus.
     */
    onInputBlur: ((e: BlurEvent) => void) | undefined;
};

function SplitPercentageInput({splitItem, contentWidth, percentageDraft, onSplitExpenseValueChange, setPercentageDraft, focusHandler, onInputBlur}: SplitAmountInputProps) {
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
                containerStyles={styles.optionRowPercentInputContainer}
                inputStyle={[styles.optionRowPercentInput, styles.lineHeightUndefined]}
                onFocus={focusHandler}
                onBlur={(event) => {
                    setPercentageDraft(undefined);
                    if (onInputBlur) {
                        onInputBlur(event);
                    }
                }}
                allowExceedingHundred
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

SplitPercentageInput.displayName = 'SplitPercentageInput';

export default SplitPercentageInput;
