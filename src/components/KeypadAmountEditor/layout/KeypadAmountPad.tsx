import BigNumberPad from '@components/BigNumberPad';
import {useKeypadAmountEditorActions, useKeypadAmountEditorState} from '@components/KeypadAmountEditor/context';

import useThemeStyles from '@hooks/useThemeStyles';

import {useEffect, useRef} from 'react';
import {View} from 'react-native';

import type KeypadAmountLayoutPartProps from './types';

/** Number pad connected to the root value and selection. The layout renders it only on touch screens. */
function KeypadAmountPad({isTwoColumn, testID}: KeypadAmountLayoutPartProps) {
    const styles = useThemeStyles();
    const {isDisabled} = useKeypadAmountEditorState();
    const {deleteBackward, focusInput, insertAtSelection, setShouldUpdateSelection} = useKeypadAmountEditorActions();
    const isLongPressingRef = useRef(false);

    useEffect(() => {
        return () => {
            if (!isLongPressingRef.current) {
                return;
            }
            setShouldUpdateSelection(true);
        };
    }, [setShouldUpdateSelection]);

    const handleNumberPressed = (key: string) => {
        if (isDisabled) {
            return;
        }

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
        if (isDisabled) {
            return;
        }

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

export default KeypadAmountPad;
