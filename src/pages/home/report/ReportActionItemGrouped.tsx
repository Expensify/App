import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import ChildrenProps from '@src/types/utils/ChildrenProps';

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

ReportActionItemGrouped.displayName = 'ReportActionItemGrouped';

export default ReportActionItemGrouped;
