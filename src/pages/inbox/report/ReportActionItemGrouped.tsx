import useThemeStyles from '@hooks/useThemeStyles';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type ReportActionItemGroupedProps = ChildrenProps & {
    /** Styles for the outermost View */
    wrapperStyle?: StyleProp<ViewStyle>;
};

function ReportActionItemGrouped({wrapperStyle, children}: ReportActionItemGroupedProps) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.chatItem, wrapperStyle]}>
            <View style={styles.chatItemRightGrouped}>{children}</View>
        </View>
    );
}

export default ReportActionItemGrouped;
