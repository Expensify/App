import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

function ReportActionItemDraft({children}: ChildrenProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.chatItemDraft}>
            <View style={styles.flex1}>{children}</View>
        </View>
    );
}

export default ReportActionItemDraft;
