import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type ExpenseFieldContainerProps = {
    /** The field, together with any error or hint it renders under itself */
    children: ReactNode;
};

/**
 * Spaces a bordered field on the expense form. `DropdownFieldRow` takes no margin of its own because every form
 * that renders it lays out its fields differently, so the expense form puts its gutter and gap around each row here.
 */
function ExpenseFieldContainer({children}: ExpenseFieldContainerProps) {
    const styles = useThemeStyles();
    return <View style={[styles.mh4, styles.mv2]}>{children}</View>;
}

export default ExpenseFieldContainer;
