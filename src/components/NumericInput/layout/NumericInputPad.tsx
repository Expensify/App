import BigNumberPad from '@components/BigNumberPad';
import {useNumericInputActions} from '@components/NumericInput/context';

import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import {useEffect, useRef} from 'react';
import {View} from 'react-native';

import type {NumericInputLayoutPartProps} from './types';

const canUseTouchScreen = canUseTouchScreenUtil();

/** Number pad rendered on touch screens, connected to the root value and selection. */
function NumericInputPad({isTwoColumn, testID}: NumericInputLayoutPartProps) {
    const styles = useThemeStyles();
    const {deleteBackward, focusInput, insertAtSelection, setShouldUpdateSelection} = useNumericInputActions();
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

        if (key === '<') {
            deleteBackward();
            return;
        }

        insertAtSelection(key);
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
