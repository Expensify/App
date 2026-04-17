import React from 'react';
import CONST from '@src/CONST';
import SelectionButton from './SelectionButton';

type RadioButtonProps = {
    /** Whether radioButton is checked */
    isChecked: boolean;

    /** A function that is called when the box/label is pressed */
    onPress: () => void;

    /** Whether the radio button is accessible to screen readers */
    accessible?: boolean;

    /** Specifies the accessibility label for the radio button */
    accessibilityLabel: string;

    /** Should the input be styled for errors  */
    hasError?: boolean;

    /** Should the input be disabled  */
    disabled?: boolean;
};

function RadioButton({isChecked, onPress, accessibilityLabel, hasError = false, disabled = false, accessible}: RadioButtonProps) {
    return (
        <SelectionButton
            isChecked={isChecked}
            onPress={onPress}
            accessibilityLabel={accessibilityLabel}
            hasError={hasError}
            disabled={disabled}
            accessible={accessible}
            role={CONST.ROLE.RADIO}
            sentryLabel={CONST.SENTRY_LABEL.RADIO_BUTTON.BUTTON}
            shouldSelectOnPressEnter
        />
    );
}

export default RadioButton;
