import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

function ReportActionsListLoadingSkeleton({style}: {style?: StyleProp<ViewStyle>}) {
    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={style}
        >
            <ReportActionsSkeletonView possibleVisibleContentItems={3} />
        </Animated.View>
    );
}

export default ReportActionsListLoadingSkeleton;
