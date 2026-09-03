import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type ListItemTextColumnProps = PropsWithChildren<{
    /** Additional styles merged onto the column view */
    style?: StyleProp<ViewStyle>;
}>;

/**
 * The flexible middle column of a row that stacks the title above the subtitle
 * and absorbs the remaining horizontal space.
 */
function ListItemTextColumn({children, style}: ListItemTextColumnProps) {
    const styles = useThemeStyles();

    return <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, style]}>{children}</View>;
}

export default ListItemTextColumn;
