import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import ReportActionsSkeletonView from './ReportActionsSkeletonView';

type ReportActionsSkeletonCoverProps = {
    /** Additional styles for the cover */
    style?: StyleProp<ViewStyle>;
};

type ReportActionsSkeletonContainerProps = ReportActionsSkeletonCoverProps & {
    /** The skeleton content to place at the bottom of the report viewport */
    children: ReactNode;
};

/** Fills the report-actions viewport with a consistently positioned static loading skeleton. */
function ReportActionsSkeletonCover({style}: ReportActionsSkeletonCoverProps) {
    return (
        <ReportActionsSkeletonContainer style={style}>
            <ReportActionsSkeletonView shouldAnimate={false} />
        </ReportActionsSkeletonContainer>
    );
}

/** Fills the report-actions viewport with a consistently positioned animated loading skeleton. */
function ReportActionsAnimatedSkeletonCover({style}: ReportActionsSkeletonCoverProps) {
    return (
        <ReportActionsSkeletonContainer style={style}>
            <ReportActionsSkeletonView shouldAnimate />
        </ReportActionsSkeletonContainer>
    );
}

function ReportActionsSkeletonContainer({children, style}: ReportActionsSkeletonContainerProps) {
    const styles = useThemeStyles();

    return (
        <View
            pointerEvents="none"
            testID="ReportActionsSkeletonCover"
            style={[styles.flex1, styles.appBG, styles.overflowHidden, styles.justifyContentEnd, styles.pb4, style]}
        >
            {children}
        </View>
    );
}

export {ReportActionsAnimatedSkeletonCover};
export default ReportActionsSkeletonCover;
