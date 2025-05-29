import React from 'react';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

function ReportActionsListLoadingSkeleton() {
    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
        >
            <ReportActionsSkeletonView possibleVisibleContentItems={3} />
        </Animated.View>
    );
}

ReportActionsListLoadingSkeleton.displayName = 'ReportActionsListLoadingSkeleton';

export default ReportActionsListLoadingSkeleton;
