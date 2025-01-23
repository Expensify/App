import React from 'react';
import {Dimensions, Text, View} from 'react-native';
import CONST from '@src/CONST';
import SkeletonViewLines from './SkeletonViewLines';

type ReportActionsSkeletonViewProps = {
    /** Whether to animate the skeleton view */
    shouldAnimate?: boolean;

    /** Number of possible visible content items */
    possibleVisibleContentItems?: number;
};

function ReportActionsSkeletonView({shouldAnimate = true, possibleVisibleContentItems = 0}: ReportActionsSkeletonViewProps) {
    const contentItems = possibleVisibleContentItems || Math.ceil(Dimensions.get('window').height / CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT);
    const skeletonViewLines = Array.from({length: contentItems}, (_, index) => {
        const iconIndex = (index + 1) % 4;
        const numberOfRows = iconIndex === 2 ? 2 : iconIndex === 0 ? 3 : 1;

        return (
            <SkeletonViewLines
                shouldAnimate={shouldAnimate}
                numberOfRows={numberOfRows}
                key={`skeletonViewLines${index}`}
            />

            // When we replace SkeletonViewLines with other componets e.g. Text it works fine.
            // It might be something with the height of SkeletonViewLine component

            // <Text>TestTestLoading</Text>
        );
    });

    return <View>{skeletonViewLines}</View>;
}

ReportActionsSkeletonView.displayName = 'ReportActionsSkeletonView';
export default ReportActionsSkeletonView;
