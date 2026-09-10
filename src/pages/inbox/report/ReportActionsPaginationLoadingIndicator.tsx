import ActivityIndicator from '@components/ActivityIndicator';

import CONST from '@src/CONST';

import React from 'react';
import {StyleSheet, View} from 'react-native';

type PaginationDirection = 'older' | 'newer';

type ReportActionsPaginationLoadingIndicatorProps = {
    direction: PaginationDirection;
};

const PAGINATION_LOADING_INDICATOR_HEIGHT = 72;
const PAGINATION_LOADING_INDICATOR_TOP_PADDING = 24;
const PAGINATION_LOADING_INDICATOR_BOTTOM_PADDING = 24;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        height: PAGINATION_LOADING_INDICATOR_HEIGHT,
        justifyContent: 'center',
        paddingBottom: PAGINATION_LOADING_INDICATOR_BOTTOM_PADDING,
        paddingTop: PAGINATION_LOADING_INDICATOR_TOP_PADDING,
    },
});

function ReportActionsPaginationLoadingIndicator({direction}: ReportActionsPaginationLoadingIndicatorProps) {
    const testID = `report-actions-pagination-${direction}`;

    return (
        <View
            testID={testID}
            style={styles.container}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
        >
            <ActivityIndicator
                testID={`${testID}-spinner`}
                size={CONST.ACTIVITY_INDICATOR_SIZE.SMALL}
            />
        </View>
    );
}

export default ReportActionsPaginationLoadingIndicator;
export {PAGINATION_LOADING_INDICATOR_BOTTOM_PADDING, PAGINATION_LOADING_INDICATOR_HEIGHT, PAGINATION_LOADING_INDICATOR_TOP_PADDING};
