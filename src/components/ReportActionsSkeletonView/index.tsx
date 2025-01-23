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
        let numberOfRows = 1;
        if (iconIndex === 2) {
            numberOfRows = 2;
        } else if (iconIndex === 0) {
            numberOfRows = 3;
        }

        return (
            <SkeletonViewLines
                shouldAnimate={shouldAnimate}
                numberOfRows={numberOfRows}
                key={`skeletonViewLines${index}`}
            />
        );
    });

    return <View>{skeletonViewLines}</View>;
}

ReportActionsSkeletonView.displayName = 'ReportActionsSkeletonView';
export default ReportActionsSkeletonView;
