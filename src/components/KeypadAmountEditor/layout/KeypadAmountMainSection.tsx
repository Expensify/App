import {KeypadAmountFontSizeProvider} from '@components/KeypadAmountEditor/context';

import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import type {ReactNode} from 'react';

import {View} from 'react-native';

import type KeypadAmountLayoutPartProps from './types';

import KeypadAmountError from './KeypadAmountError';
import KeypadAmountMinusSign from './KeypadAmountMinusSign';

const canUseTouchScreen = canUseTouchScreenUtil();

type KeypadAmountMainSectionProps = KeypadAmountLayoutPartProps & {
    /** Actions placed under the amount. */
    actions?: ReactNode;

    /** Test identifier of the amount area inside the column. */
    amountTestID?: string;

    children: ReactNode;
};

/** Column holding the amount row, actions, and the error. */
function KeypadAmountMainSection({actions, amountTestID, children, isTwoColumn, testID}: KeypadAmountMainSectionProps) {
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
                    <KeypadAmountFontSizeProvider>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, !isTwoColumn && styles.moneyRequestAmountContainer]}>
                            <KeypadAmountMinusSign />
                            {children}
                        </View>
                    </KeypadAmountFontSizeProvider>
                    {!canUseTouchScreen && actions}
                    {!isTwoColumn && <KeypadAmountError style={[styles.pAbsolute, styles.b0, canUseTouchScreen ? styles.mb5 : styles.mb3]} />}
                </View>
            </View>

            {canUseTouchScreen && !!actions && <View style={[styles.flexRow, styles.justifyContentCenter, styles.gap2]}>{actions}</View>}
            {isTwoColumn && <KeypadAmountError />}
        </View>
    );
}

export default KeypadAmountMainSection;
