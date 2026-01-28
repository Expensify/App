import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import Button from './Button';

type BigNumberPadProps = {
    /** Callback to inform parent modal with key pressed */
    numberPressed: (key: string) => void;

    /** Callback to inform parent modal whether user is long pressing the "<" (backspace) button */
    longPressHandlerStateChanged?: (isUserLongPressingBackspace: boolean) => void;

    /** Used to locate this view from native classes. */
    id?: string;

    /** Whether long press is disabled */
    isLongPressDisabled?: boolean;
};

const padNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '<'],
] as const;

function BigNumberPad({numberPressed, longPressHandlerStateChanged = () => {}, id = 'numPadView', isLongPressDisabled = false}: BigNumberPadProps) {
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const {toLocaleDigit} = useLocalize();

    const styles = useThemeStyles();
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const numberPressedRef = useRef(numberPressed);

    useEffect(() => {
        numberPressedRef.current = numberPressed;
    }, [numberPressed]);

    /**
     * Handle long press key on number pad.
     * Only handles the '<' key and starts the continuous input timer.
     */
    const handleLongPress = (key: string) => {
        if (key !== '<') {
            return;
        }

        longPressHandlerStateChanged(true);

        const newTimer = setInterval(() => {
            numberPressedRef.current?.(key);
        }, 100);

        setTimer(newTimer);
    };

    return (
        <View
            style={[styles.flexColumn, styles.w100]}
            id={id}
        >
            {padNumbers.map((row) => (
                <View
                    key={`NumberPadRow-${row[0]}`}
                    style={[styles.flexRow, styles.mt3]}
                >
                    {row.map((column, columnIndex) => {
                        // Adding margin between buttons except first column to
                        // avoid unnecessary space before the first column.
                        const marginLeft = columnIndex > 0 ? styles.ml3 : {};

                        return (
                            <Button
                                key={column}
                                medium={isExtraSmallScreenHeight}
                                large={!isExtraSmallScreenHeight}
                                shouldEnableHapticFeedback
                                style={[styles.flex1, marginLeft]}
                                text={column === '<' ? undefined : toLocaleDigit(column)}
                                icon={column === '<' ? icons.BackArrow : undefined}
                                onLongPress={() => handleLongPress(column)}
                                onPress={() => numberPressed(column)}
                                onPressIn={ControlSelection.block}
                                onPressOut={() => {
                                    if (timer) {
                                        clearInterval(timer);
                                    }

                                    ControlSelection.unblock();
                                    longPressHandlerStateChanged(false);
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                }}
                                isLongPressDisabled={isLongPressDisabled}
                                testID={`button_${column}`}
                            />
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

export default BigNumberPad;
