import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import type {NumericInputLayoutSlotProps} from './types';

import NumericInputError from './NumericInputError';
import NumericInputMinusSign from './NumericInputMinusSign';

const canUseTouchScreen = canUseTouchScreenUtil();

type NumericInputMainProps = NumericInputLayoutSlotProps & {
    /** Actions placed under the amount. */
    actions?: ReactNode;

    /** Test identifier of the amount area inside the column. */
    amountTestID?: string;
};

/**
 * Column holding the amount, its actions and the error.
 *
 * - In two columns it is a fixed-width left column, centred in the row at its content height (`alignSelfCenter`) instead of
 *   being stretched to the row's height, so the amount, its actions and the error stay together; the error is in flow.
 * - In a single column it only grows (`flexGrow1`, not `flex1`), so it never shrinks below the amount's height when the pad
 *   takes most of a short screen: the body then overflows and the layout's scroll view scrolls. The error floats over the
 *   bottom of the amount area, and the amount row always reserves its room, so showing it never moves the amount or the pad.
 *
 * The amount area grows into the column the same way and centres the amount row. On touch screens the actions form a row
 * below it; elsewhere they sit inside it, right under the amount.
 */
function NumericInputMain({actions, amountTestID, children, isTwoColumn, testID}: NumericInputMainProps) {
    const styles = useThemeStyles();

    return (
        <View
            testID={testID}
            style={isTwoColumn ? [styles.alignSelfCenter, styles.justifyContentCenter, styles.alignItemsCenter, styles.numberWithSymbolFormInputContainerLandscape] : styles.flexGrow1}
        >
            <View style={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <View
                    style={[styles.flexGrow1, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}
                    testID={amountTestID}
                >
                    {/* In a single column the amount row always reserves the room of the floating error, so showing the error after a
                        submit never moves the amount or the pad, and an action under the amount sits below that room */}
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, !isTwoColumn && styles.moneyRequestAmountContainer]}>
                        <NumericInputMinusSign />
                        {children}
                    </View>
                    {!canUseTouchScreen && actions}
                    {!isTwoColumn && <NumericInputError style={[styles.pAbsolute, styles.b0, canUseTouchScreen ? styles.mb5 : styles.mb3]} />}
                </View>
            </View>
            {canUseTouchScreen && !!actions && <View style={[styles.flexRow, styles.justifyContentCenter, styles.gap2]}>{actions}</View>}
            {isTwoColumn && <NumericInputError />}
        </View>
    );
}

export default NumericInputMain;
