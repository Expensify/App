import BigNumberPad from '@components/BigNumberPad';
import {useNumericInputActions, useNumericInputState} from '@components/NumericInput/context';

import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import {useRef} from 'react';
import {View} from 'react-native';

import type {NumericInputLayoutPartProps} from './types';

const canUseTouchScreen = canUseTouchScreenUtil();

/**
 * The touch number pad, wired to the root's value and selection. The right column in two columns; otherwise it sits at the
 * bottom of the body. Touch screens only, so elsewhere it renders nothing instead of leaving empty padding.
 * In a single column it keeps a small gap above the keys and has no bottom padding: the bottom spacing belongs to the screen
 * edge (the layout's scroll view), so it is the same whether a footer follows the pad or not.
 */
function NumericInputPad({isTwoColumn, testID}: NumericInputLayoutPartProps) {
    const styles = useThemeStyles();
    const {formattedNumber, isNegative, selection} = useNumericInputState();
    const {clearSign, focusInput, setNumber, setShouldUpdateSelection} = useNumericInputActions();
    const isLongPressingRef = useRef(false);

    if (!canUseTouchScreen) {
        return null;
    }

    const handleNumberPressed = (key: string) => {
        if (!isLongPressingRef.current) {
            focusInput();
        }

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
