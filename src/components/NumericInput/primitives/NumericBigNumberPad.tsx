import BigNumberPad from '@components/BigNumberPad';
import {useNumericInputActions, useNumericInputState} from '@components/NumericInput/context';
import type {NumericBigNumberPadProps} from '@components/NumericInput/types';

import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import isHTMLElement from '@libs/isHTMLElement';

import type {MouseEvent} from 'react';

import {useId} from 'react';
import {View} from 'react-native';

const canUseTouchScreen = canUseTouchScreenUtil();

/**
 * Renders the touch number pad wired to NumericInput actions, state, and selection.
 */
function NumericBigNumberPad({longPressHandlerStateChanged, numberPressed, style, testID}: NumericBigNumberPadProps) {
    const styles = useThemeStyles();
    const {formattedNumber, isNegative, selection} = useNumericInputState();
    const {clearSelection, clearSign, focusInput, setNumber} = useNumericInputActions();
    const containerViewId = useId();
    const numPadViewId = useId();

    if (!canUseTouchScreen) {
        return null;
    }

    const handleNumberPressed = (key: string) => {
        focusInput();
        numberPressed?.(key);

        const isCollapsed = selection.start === selection.end;

        if (key === '<') {
            if (isCollapsed && selection.start === 0) {
                if (isNegative) {
                    clearSign();
                }
                return;
            }

            const deleteStart = isCollapsed ? selection.start - 1 : selection.start;
            const newMagnitude = `${formattedNumber.slice(0, deleteStart)}${formattedNumber.slice(selection.end)}`;
            setNumber(newMagnitude);
            return;
        }

        const newMagnitude = `${formattedNumber.slice(0, selection.start)}${key}${formattedNumber.slice(selection.end)}`;
        setNumber(newMagnitude);
    };

    const handleLongPressHandlerStateChanged = (isUserLongPressingBackspace: boolean) => {
        if (!isUserLongPressingBackspace) {
            focusInput();
        }
        longPressHandlerStateChanged?.(isUserLongPressingBackspace);
    };

    const handleMouseDown = (event: MouseEvent<Element>) => {
        // Only the container's and keypad's own empty areas refocus the input. Presses bubbling up from children keep their selection.
        const targetId = isHTMLElement(event.nativeEvent?.target) ? event.nativeEvent.target.id : undefined;
        if (targetId !== containerViewId && targetId !== numPadViewId) {
            return;
        }

        event.preventDefault();
        clearSelection();
        focusInput();
    };

    return (
        <View
            id={containerViewId}
            onMouseDown={handleMouseDown}
            style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper, styles.pt0, style]}
            testID={testID}
        >
            <BigNumberPad
                id={numPadViewId}
                numberPressed={handleNumberPressed}
                longPressHandlerStateChanged={handleLongPressHandlerStateChanged}
            />
        </View>
    );
}

export default NumericBigNumberPad;
