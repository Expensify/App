import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import ReportActionsSkeletonView from './ReportActionsSkeletonView';

type ReportActionsSkeletonCoverProps = {
    /** Whether the skeleton rows animate */
    shouldAnimate?: boolean;

    /** Whether the cover should be positioned over already-mounted content */
    shouldOverlay?: boolean;
};

/** Fills the report-actions viewport with a consistently positioned loading skeleton. */
function ReportActionsSkeletonCover({shouldAnimate = true, shouldOverlay = false}: ReportActionsSkeletonCoverProps) {
    const styles = useThemeStyles();

    return (
        <View
            pointerEvents="none"
            testID="ReportActionsSkeletonCover"
            style={[
                styles.flex1,
                styles.appBG,
                styles.overflowHidden,
                styles.justifyContentEnd,
                styles.pb4,
                shouldOverlay && [styles.pAbsolute, styles.t0, styles.r0, styles.b0, styles.l0, styles.zIndex10],
            ]}
        >
            <ReportActionsSkeletonView shouldAnimate={shouldAnimate} />
        </View>
    );
}

export default ReportActionsSkeletonCover;
