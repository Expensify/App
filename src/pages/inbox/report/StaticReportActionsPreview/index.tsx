import React from 'react';
import ScrollView from '@components/ScrollView';
import useThemeStyles from '@hooks/useThemeStyles';
import type StaticReportActionsPreviewProps from './types';

function StaticReportActionsPreview({children}: StaticReportActionsPreviewProps) {
    const styles = useThemeStyles();

    return <ScrollView style={[styles.pt4, styles.maxHeight100Percentage, styles.overscrollBehaviorNone]}>{children}</ScrollView>;
}

export default StaticReportActionsPreview;
