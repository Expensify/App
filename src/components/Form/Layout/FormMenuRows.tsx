import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type FormMenuRowsProps = {
    children: ReactNode;

    /** The group opens with a label instead of a row, so only its last row is pulled into the gap below */
    hasLabelAbove?: boolean;

    /** Horizontal styles, such as `styles.mhn5` to let the rows bleed to the edges of a padded form */
    style?: StyleProp<ViewStyle>;
};

/**
 * Push rows and other menu rows of a form, stacked like a menu. A row pads its text vertically, so the group pulls itself
 * into the surrounding gap by as much, and the gap to the next field is measured to the row's text.
 */
function FormMenuRows({children, hasLabelAbove = false, style}: FormMenuRowsProps) {
    const styles = useThemeStyles();
    return <View style={[hasLabelAbove ? styles.formMenuRowsBelowLabel : styles.formMenuRows, style]}>{children}</View>;
}

export default FormMenuRows;
