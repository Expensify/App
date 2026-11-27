import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type TransactionItemRowNarrowSubtitleProps = {
    /** The line's content, spread to both ends */
    children: ReactNode;
};

/** Subtitle line of an expense beneath its title on the narrow layout. */
function TransactionItemRowNarrowSubtitle({children}: TransactionItemRowNarrowSubtitleProps) {
    const styles = useThemeStyles();
    return <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>{children}</View>;
}

export default TransactionItemRowNarrowSubtitle;
