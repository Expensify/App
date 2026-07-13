import CONST from '@src/CONST';

import React from 'react';

import type {CheckboxProps} from './SelectionButton';

import SelectionButton from './SelectionButton';

/**
 * A square checkbox that supports checked, unchecked, and indeterminate states.
 */
function Checkbox({
    isChecked,
    isIndeterminate,
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
    accessibilityHint,
    shouldStopMouseDownPropagation,
    shouldSelectOnPressEnter,
    wrapperStyle,
    testID,
    ref,
    sentryLabel,
    tabIndex,
    accessible,
}: CheckboxProps) {
    return (
        <SelectionButton
            role={CONST.ROLE.CHECKBOX}
            isChecked={isChecked}
            isIndeterminate={isIndeterminate}
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
            accessibilityHint={accessibilityHint}
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

export default Checkbox;
