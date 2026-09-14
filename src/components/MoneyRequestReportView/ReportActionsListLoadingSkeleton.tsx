import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import React from 'react';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

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

export default ReportActionsListLoadingSkeleton;
