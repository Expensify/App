import React from 'react';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';

function ReportActionsListLoadingSkeleton() {
    useSkeletonSpan('ReportActionsListLoadingSkeleton');

    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
        >
            <ReportActionsSkeletonView possibleVisibleContentItems={3} />
        </Animated.View>
    );
}

export default ReportActionsListLoadingSkeleton;
