import React from 'react';
import {Dimensions, View} from 'react-native';
import CONST from '@src/CONST';
import SkeletonViewLines from './SkeletonViewLines';

type ReportActionsSkeletonViewProps = {
    /** Whether to animate the skeleton view */
    shouldAnimate?: boolean;

    /** Number of possible visible content items */
    possibleVisibleContentItems?: number;
};

function ReportActionsSkeletonView({shouldAnimate = true, possibleVisibleContentItems = 0}: ReportActionsSkeletonViewProps) {
    const contentItems = possibleVisibleContentItems || Math.ceil(Dimensions.get('screen').height / CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT);
    const skeletonViewLines: React.ReactNode[] = [];
    for (let index = 0; index < contentItems; index++) {
        const iconIndex = (index + 1) % 4;
        switch (iconIndex) {
            case 2:
                skeletonViewLines.push(
                    <SkeletonViewLines
                        shouldAnimate={shouldAnimate}
                        numberOfRows={2}
                        key={`skeletonViewLines${index}`}
                    />,
                );
                break;
            case 0:
                skeletonViewLines.push(
                    <SkeletonViewLines
                        shouldAnimate={shouldAnimate}
                        numberOfRows={3}
                        key={`skeletonViewLines${index}`}
                    />,
                );
                break;
            default:
                skeletonViewLines.push(
                    <SkeletonViewLines
                        shouldAnimate={shouldAnimate}
                        numberOfRows={1}
                        key={`skeletonViewLines${index}`}
                    />,
                );
        }
    }
    return <View testID="ReportActionsSkeletonView">{skeletonViewLines}</View>;
}

export default ReportActionsSkeletonView;
