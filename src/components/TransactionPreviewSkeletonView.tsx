import React from 'react';
import {Rect} from 'react-native-svg';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

type TransactionPreviewSkeletonViewProps = {
    transactionPreviewWidth: number;
};

function TransactionPreviewSkeletonView({transactionPreviewWidth}: TransactionPreviewSkeletonViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {width, height} = {
        width: transactionPreviewWidth - styles.p4.padding * 2,
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
