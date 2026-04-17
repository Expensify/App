import React, {useEffect, useState} from 'react';
import {Dimensions, View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import CONST from '@src/CONST';
import SkeletonViewLines from './SkeletonViewLines';

const SKELETON_VISIBLE_DELAY_MS = 300;

type ReportActionsSkeletonViewProps = {
    /** Whether to animate the skeleton view */
    shouldAnimate?: boolean;

    /** Number of possible visible content items */
    possibleVisibleContentItems?: number;

    /** Callback executed on layout */
    onLayout?: (event: LayoutChangeEvent) => void;

    /** When true, the skeleton stays hidden for SKELETON_VISIBLE_DELAY_MS before appearing */
    shouldDelay?: boolean;
};

function ReportActionsSkeletonView({shouldAnimate = true, possibleVisibleContentItems = 0, onLayout, shouldDelay = false}: ReportActionsSkeletonViewProps) {
    const [isVisible, setIsVisible] = useState(!shouldDelay);
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), SKELETON_VISIBLE_DELAY_MS);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) {
        return null;
    }

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
    return (
        <View
            onLayout={onLayout}
            testID="ReportActionsSkeletonView"
        >
            {skeletonViewLines}
        </View>
    );
}

export default ReportActionsSkeletonView;
