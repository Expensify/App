import BigNumberPad from '@components/BigNumberPad';
import {useNumericInputActions, useNumericInputState} from '@components/NumericInput/context';
import type {NumericBigNumberPadProps} from '@components/NumericInput/types';

import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import isHTMLElement from '@libs/isHTMLElement';

import type {MouseEvent} from 'react';

import {useId, useLayoutEffect, useRef} from 'react';
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

    const currentNumberRef = useRef(formattedNumber);
    const currentSelectionRef = useRef(selection);
    const isLongPressingRef = useRef(false);

    useLayoutEffect(() => {
        currentNumberRef.current = formattedNumber;
    }, [formattedNumber]);

    useLayoutEffect(() => {
        currentSelectionRef.current = selection;
    }, [selection]);

    if (!canUseTouchScreen) {
        return null;
    }

    const handleNumberPressed = (key: string) => {
        if (!isLongPressingRef.current) {
            focusInput();
        }
        numberPressed?.(key);

        const currentSelection = currentSelectionRef.current;
        const currentFormattedNumber = currentNumberRef.current;
        const isCollapsed = currentSelection.start === currentSelection.end;

        if (key === '<') {
            if (isCollapsed && currentSelection.start === 0) {
                if (isNegative) {
                    clearSign();
                }
                return;
            }

            const deleteStart = isCollapsed ? currentSelection.start - 1 : currentSelection.start;
            const newMagnitude = `${currentFormattedNumber.slice(0, deleteStart)}${currentFormattedNumber.slice(currentSelection.end)}`;
            if (!setNumber(newMagnitude)) {
                return;
            }
            currentNumberRef.current = newMagnitude;
            currentSelectionRef.current = {start: deleteStart, end: deleteStart};
            return;
        }

        const newMagnitude = `${currentFormattedNumber.slice(0, currentSelection.start)}${key}${currentFormattedNumber.slice(currentSelection.end)}`;
        const nextOffset = currentSelection.start + key.length;
        if (!setNumber(newMagnitude)) {
            return;
        }
        currentNumberRef.current = newMagnitude;
        currentSelectionRef.current = {start: nextOffset, end: nextOffset};
    };

    const handleLongPressHandlerStateChanged = (isUserLongPressingBackspace: boolean) => {
        isLongPressingRef.current = isUserLongPressingBackspace;
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
