import React from 'react';
import {View} from 'react-native';
import ScrollView from '@components/ScrollView';
import useThemeStyles from '@hooks/useThemeStyles';
import type StaticReportActionsPreviewProps from './types';

function StaticReportActionsPreview({children, showSpacer}: StaticReportActionsPreviewProps) {
    const styles = useThemeStyles();

    return (
        <>
            {showSpacer && <View style={[styles.stickToBottom, styles.appBG, styles.zIndex10, styles.height4]} />}
            <View style={[styles.pt4]}>
                <ScrollView>{children}</ScrollView>
            </View>
        </>
    );
}

StaticReportActionsPreview.displayName = 'StaticReportActionsPreview';

export default StaticReportActionsPreview;
