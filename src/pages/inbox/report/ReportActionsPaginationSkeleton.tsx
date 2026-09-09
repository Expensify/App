import ActivityIndicator from '@components/ActivityIndicator';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import CONST from '@src/CONST';

import React from 'react';
import {StyleSheet, View} from 'react-native';

type PaginationDirection = 'older' | 'newer';

type ReportActionsPaginationSkeletonProps = {
    direction: PaginationDirection;
    viewportHeight: number;
    isLoading: boolean;
    hasError: boolean;
};

const PAGINATION_SKELETON_ROW_HEIGHT = CONST.CHAT_SKELETON_VIEW.HEIGHT_FOR_ROW_COUNT[1];
const PAGINATION_SPINNER_HEIGHT = 48;
const PAGINATION_TOP_OVERLAY_CLEARANCE = CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET;

const styles = StyleSheet.create({
    page: {
        overflow: 'hidden',
    },
    spinnerSlot: {
        alignItems: 'center',
        height: PAGINATION_SPINNER_HEIGHT,
        justifyContent: 'center',
    },
});

function ReportActionsPaginationSkeleton({direction, viewportHeight, isLoading, hasError}: ReportActionsPaginationSkeletonProps) {
    const testID = `report-actions-pagination-${direction}`;
    const page = (
        <View
            testID={`${testID}-skeleton`}
            style={[styles.page, {height: viewportHeight}]}
        >
            <ReportActionsSkeletonView
                shouldAnimate={false}
                possibleVisibleContentItems={Math.ceil(viewportHeight / PAGINATION_SKELETON_ROW_HEIGHT)}
            />
        </View>
    );
    const spinner = (
        <View
            testID={`${testID}-spinner-slot`}
            style={styles.spinnerSlot}
        >
            {isLoading && !hasError && (
                <ActivityIndicator
                    testID={`${testID}-spinner`}
                    size={CONST.ACTIVITY_INDICATOR_SIZE.SMALL}
                />
            )}
        </View>
    );

    return (
        <View
            testID={testID}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
        >
            {direction === 'older' && <View style={{height: PAGINATION_TOP_OVERLAY_CLEARANCE}} />}
            {direction === 'older' && spinner}
            {page}
            {direction === 'newer' && spinner}
        </View>
    );
}

export default ReportActionsPaginationSkeleton;
export {PAGINATION_SKELETON_ROW_HEIGHT, PAGINATION_SPINNER_HEIGHT, PAGINATION_TOP_OVERLAY_CLEARANCE};
export type {PaginationDirection, ReportActionsPaginationSkeletonProps};
