import React from 'react';
import type {BlurEvent} from 'react-native';
import PercentageForm from '@components/PercentageForm';
import type {SplitListItemType} from '@components/SelectionListWithSections/types';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import SplitPercentageDisplay from './SplitPercentageDisplay';

type SplitAmountInputProps = {
    splitItem: SplitListItemType;
    contentWidth: number;
    percentageDraft: string | undefined;
    onSplitExpenseValueChange: (value: string) => void;
    setPercentageDraft: React.Dispatch<React.SetStateAction<string | undefined>>;
    focusHandler: () => void;
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

SplitPercentageInput.displayName = 'SplitPercentageInput';

export default SplitPercentageInput;
