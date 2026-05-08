import React from 'react';
import {View} from 'react-native';
import ScrollView from '@components/ScrollView';
import useThemeStyles from '@hooks/useThemeStyles';
import type StaticReportActionsPreviewProps from './types';

function StaticReportActionsPreview({children}: StaticReportActionsPreviewProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.pt4]}>
            <ScrollView>{children}</ScrollView>
        </View>
    );
}

export default StaticReportActionsPreview;
