import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type ListItemRowProps = PropsWithChildren<{
    /** Additional styles merged onto the row view */
    style?: StyleProp<ViewStyle>;

    /** Test ID of the row view */
    testID?: string;
}>;

/** The row container that lays out avatar, text column, indicators, and selection button side by side. */
function ListItemRow({children, style, testID}: ListItemRowProps) {
    const styles = useThemeStyles();

    return (
        <View
            testID={testID}
            style={[styles.listItemRow, style]}
        >
            {children}
        </View>
    );
}

export default ListItemRow;
