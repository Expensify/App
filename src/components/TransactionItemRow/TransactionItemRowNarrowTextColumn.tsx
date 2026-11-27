import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type TransactionItemRowNarrowTextColumnProps = {
    /** The title, then the subtitle */
    children: ReactNode;
};

/** Column stacking an expense's title above its subtitle, beside its receipt on the narrow layout. */
function TransactionItemRowNarrowTextColumn({children}: TransactionItemRowNarrowTextColumnProps) {
    const styles = useThemeStyles();
    return <View style={[styles.flex2, styles.flexColumn, styles.gap1]}>{children}</View>;
}

export default TransactionItemRowNarrowTextColumn;
