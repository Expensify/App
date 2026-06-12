import React from 'react';
import CONST from '@src/CONST';
import SelectionButton from './SelectionButton';
import type {RadioButtonProps} from './SelectionButton';

/**
 * A circular radio button for single-selection contexts.
 */
function RadioButton({
    isChecked,
    onPress,
    hasError,
    disabled,
    style,
    containerStyle,
    children,
    onMouseDown,
    containerSize,
    containerBorderRadius,
    caretSize,
    accessibilityLabel,
    shouldStopMouseDownPropagation,
    shouldSelectOnPressEnter = true,
    wrapperStyle,
    testID,
    ref,
    sentryLabel = CONST.SENTRY_LABEL.RADIO_BUTTON.BUTTON,
    tabIndex,
    accessible,
}: RadioButtonProps) {
    return (
        <SelectionButton
            role={CONST.ROLE.RADIO}
            isChecked={isChecked}
            onPress={onPress}
            hasError={hasError}
            disabled={disabled}
            style={style}
            containerStyle={containerStyle}
            onMouseDown={onMouseDown}
            containerSize={containerSize}
            containerBorderRadius={containerBorderRadius}
            caretSize={caretSize}
            accessibilityLabel={accessibilityLabel}
            shouldStopMouseDownPropagation={shouldStopMouseDownPropagation}
            shouldSelectOnPressEnter={shouldSelectOnPressEnter}
            wrapperStyle={wrapperStyle}
            testID={testID}
            ref={ref}
            sentryLabel={sentryLabel}
            tabIndex={tabIndex}
            accessible={accessible}
        >
            {children}
        </SelectionButton>
    );
}

export default RadioButton;
