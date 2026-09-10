import ActivityIndicator from '@components/ActivityIndicator';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type PaginationDirection = 'older' | 'newer';

type ReportActionsPaginationLoadingIndicatorProps = {
    direction: PaginationDirection;
};

const PAGINATION_LOADING_INDICATOR_HEIGHT = 72;

function ReportActionsPaginationLoadingIndicator({direction}: ReportActionsPaginationLoadingIndicatorProps) {
    const styles = useThemeStyles();
    const testID = `report-actions-pagination-${direction}`;

    return (
        <View
            testID={testID}
            style={[{height: PAGINATION_LOADING_INDICATOR_HEIGHT}, styles.alignItemsCenter, styles.justifyContentCenter, styles.pt16, styles.pb6]}
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
export {PAGINATION_LOADING_INDICATOR_HEIGHT};
export type {PaginationDirection, ReportActionsPaginationLoadingIndicatorProps};
