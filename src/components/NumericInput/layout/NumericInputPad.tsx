import BigNumberPad from '@components/BigNumberPad';
import {useNumericInputActions, useNumericInputState} from '@components/NumericInput/context';

import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import {useEffect, useRef} from 'react';
import {View} from 'react-native';

import type {NumericInputLayoutPartProps} from './types';

const canUseTouchScreen = canUseTouchScreenUtil();

/** Number pad rendered on touch screens, connected to the root value and selection. */
function NumericInputPad({isTwoColumn, testID}: NumericInputLayoutPartProps) {
    const styles = useThemeStyles();
    const {formattedNumber, selection} = useNumericInputState();
    const {deleteSignBeforeCaret, focusInput, setNumber, setShouldUpdateSelection} = useNumericInputActions();
    const isLongPressingRef = useRef(false);

    useEffect(() => {
        return () => {
            if (!isLongPressingRef.current) {
                return;
            }
            setShouldUpdateSelection(true);
        };
    }, [setShouldUpdateSelection]);

    if (!canUseTouchScreen) {
        return null;
    }

    const handleNumberPressed = (key: string) => {
        if (!isLongPressingRef.current) {
            focusInput();
        }

        const isCollapsed = selection.start === selection.end;

        if (key === '<') {
            if (deleteSignBeforeCaret() || (isCollapsed && selection.start === 0)) {
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
        isLongPressingRef.current = isUserLongPressingBackspace;
        setShouldUpdateSelection(!isUserLongPressingBackspace);
        if (!isUserLongPressingBackspace) {
            focusInput();
        }
    };

    return (
        <View
            testID={testID}
            style={isTwoColumn ? [styles.flex1, styles.justifyContentCenter] : [styles.w100, styles.alignItemsCenter, styles.justifyContentEnd, styles.ph5, styles.mt2]}
        >
            {/* The pad fills the column, because the centering parent would otherwise shrink it and collapse the key columns */}
            <View style={styles.w100}>
                <BigNumberPad
                    numberPressed={handleNumberPressed}
                    longPressHandlerStateChanged={handleLongPressHandlerStateChanged}
                />
            </View>
        </View>
    );
}

export default NumericInputPad;
