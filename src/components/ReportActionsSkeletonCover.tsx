import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import ReportActionsSkeletonView from './ReportActionsSkeletonView';

type ReportActionsSkeletonContainerProps = {
    /** The skeleton content to place at the bottom of the report viewport */
    children: ReactNode;
};

/** Fills the report-actions viewport with a consistently positioned static loading skeleton. */
function ReportActionsSkeletonCover() {
    return (
        <ReportActionsSkeletonContainer>
            <ReportActionsSkeletonView shouldAnimate={false} />
        </ReportActionsSkeletonContainer>
    );
}

/** Fills the report-actions viewport with a consistently positioned animated loading skeleton. */
function ReportActionsAnimatedSkeletonCover() {
    return (
        <ReportActionsSkeletonContainer>
            <ReportActionsSkeletonView shouldAnimate />
        </ReportActionsSkeletonContainer>
    );
}

function ReportActionsSkeletonContainer({children}: ReportActionsSkeletonContainerProps) {
    const styles = useThemeStyles();

    return (
        <View
            pointerEvents="none"
            testID="ReportActionsSkeletonCover"
            style={[styles.flex1, styles.appBG, styles.overflowHidden, styles.justifyContentEnd, styles.pb4]}
        >
            {children}
        </View>
    );
}

export {ReportActionsAnimatedSkeletonCover};
export default ReportActionsSkeletonCover;
