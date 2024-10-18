import React from 'react';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

type RadioButtonProps = {
    /** Whether radioButton is checked */
    isChecked: boolean;

    /** A function that is called when the box/label is pressed */
    onPress: () => void;

    /** Specifies the accessibility label for the radio button */
    accessibilityLabel: string;

    /** Should the input be styled for errors  */
    hasError?: boolean;

    /** Should the input be disabled  */
    disabled?: boolean;
};

function RadioButton({isChecked, onPress, accessibilityLabel, hasError = false, disabled = false}: RadioButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <PressableWithFeedback
            disabled={disabled}
            onPress={onPress}
            hoverDimmingValue={1}
            pressDimmingValue={1}
            accessibilityLabel={accessibilityLabel}
            role={CONST.ROLE.RADIO}
            style={[styles.radioButtonContainer, hasError && styles.borderColorDanger, disabled && styles.cursorDisabled]}
        >
            {isChecked && (
                <Icon
                    src={Expensicons.Checkmark}
                    fill={theme.checkBox}
                    height={14}
                    width={14}
                />
            )}
        </PressableWithFeedback>
    );
}

RadioButton.displayName = 'RadioButton';

export default RadioButton;
