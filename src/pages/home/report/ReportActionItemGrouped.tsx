import React, {ReactNode} from 'react';
import {View, ViewStyle} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';

type ReportActionItemGroupedProps = {
    /** Children view component for this action item */
    children: ReactNode;

    /** Styles for the outermost View */
    wrapperStyle?: ViewStyle;
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
