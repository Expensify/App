import React from 'react';
import {Rect} from 'react-native-svg';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

function TransactionPreviewSkeletonView() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const previewStyle = StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout);
    const {width, height} = {
        width: previewStyle.transactionPreviewStyle.width - styles.p4.padding * 2,
        height: variables.transactionPreviewSkeletonHeight,
    };

    return (
        <SkeletonViewContentLoader
            testID={TransactionPreviewSkeletonView.displayName}
            animate
            width={width}
            height={height}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
            style={[styles.p4, styles.mtn1]}
        >
            <Rect
                x="0"
                y="4"
                width="64"
                height="8"
            />
            <Rect
                x="0"
                y="24"
                width="120"
                height="20"
            />
            <Rect
                x={width - 68}
                y="24"
                width="68"
                height="20"
            />
            <Rect
                x="0"
                y="54.75"
                width="80"
                height="7"
            />
        </SkeletonViewContentLoader>
    );
}

TransactionPreviewSkeletonView.displayName = 'TransactionPreviewSkeletonView';
export default TransactionPreviewSkeletonView;
