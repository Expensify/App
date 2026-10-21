import {NumericAmountProvider} from '@components/NumericInput/context';

import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import type {ReactNode} from 'react';

import {View} from 'react-native';

import type NumericInputLayoutPartProps from './types';

import NumericInputError from './NumericInputError';
import NumericInputMinusSign from './NumericInputMinusSign';

const canUseTouchScreen = canUseTouchScreenUtil();

type NumericInputMainProps = NumericInputLayoutPartProps & {
    /** Actions placed under the amount. */
    actions?: ReactNode;

    /** Test identifier of the amount area inside the column. */
    amountTestID?: string;

    children: ReactNode;
};

/** Column holding the amount row, actions, and the error. */
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
                    <NumericAmountProvider>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, !isTwoColumn && styles.moneyRequestAmountContainer]}>
                            <NumericInputMinusSign />
                            {children}
                        </View>
                    </NumericAmountProvider>
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
