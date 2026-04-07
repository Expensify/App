import React from 'react';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Checkbox from './Checkbox';

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
    return (
        <Checkbox
            isChecked={isChecked}
            onPress={onPress}
            accessibilityLabel={accessibilityLabel}
            hasError={hasError}
            disabled={disabled}
            containerBorderRadius={variables.componentBorderRadiusCircle}
            role={CONST.ROLE.RADIO}
            sentryLabel={CONST.SENTRY_LABEL.RADIO_BUTTON.BUTTON}
            shouldSelectOnPressEnter
        />
    );
}

export default RadioButton;
