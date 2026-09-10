import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import ReportActionsSkeletonView from './ReportActionsSkeletonView';

type ReportActionsSkeletonCoverProps = {
    /** The skeleton content to place at the bottom of the report viewport */
    children?: ReactNode;
};

/** Fills the report-actions viewport with a consistently positioned loading skeleton. */
function ReportActionsSkeletonCover({children}: ReportActionsSkeletonCoverProps) {
    const styles = useThemeStyles();

    return (
        <View
            pointerEvents="none"
            testID="ReportActionsSkeletonCover"
            style={[styles.flex1, styles.appBG, styles.overflowHidden, styles.justifyContentEnd, styles.pb4]}
        >
            {children ?? <ReportActionsSkeletonView />}
        </View>
    );
}

export default ReportActionsSkeletonCover;
