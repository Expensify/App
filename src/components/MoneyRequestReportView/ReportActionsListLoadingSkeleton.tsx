import React from 'react';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';

type ReportActionsListLoadingSkeletonProps = {
    reasonAttributes?: SkeletonSpanReasonAttributes;
};

function ReportActionsListLoadingSkeleton({reasonAttributes}: ReportActionsListLoadingSkeletonProps = {}) {
    useSkeletonSpan('ReportActionsListLoadingSkeleton', reasonAttributes);

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
