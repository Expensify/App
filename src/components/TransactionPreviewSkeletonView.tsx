import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

type TransactionPreviewSkeletonViewProps = {
    transactionPreviewWidth: number | string;
};

function TransactionPreviewSkeletonView({transactionPreviewWidth}: TransactionPreviewSkeletonViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const height = variables.transactionPreviewSkeletonHeight;
    const widthOfTheLeftSkeleton = 120;
    const widthOfTheRightSkeleton = 68;

    return (
        <View style={[styles.p4, styles.mtn1, styles.justifyContentBetween, {width: transactionPreviewWidth}]}>
            <SkeletonViewContentLoader
                testID={TransactionPreviewSkeletonView.displayName}
                animate
                width={widthOfTheLeftSkeleton}
                height={height}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
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
                    width={widthOfTheLeftSkeleton}
                    height="20"
                />
                <Rect
                    x="0"
                    y="54.75"
                    width="80"
                    height="7"
                />
            </SkeletonViewContentLoader>
            {/* This skeleton inverts the progress bar, which should be on the right,
            so we don't need to know the width of the component to calculate it - works with percentages.
           */}
            <View style={[styles.r0, styles.b0, styles.p4, styles.mtn1, styles.pAbsolute]}>
                <SkeletonViewContentLoader
                    width={widthOfTheRightSkeleton}
                    height={height}
                    foregroundColor={theme.skeletonLHNOut}
                    backgroundColor={theme.skeletonLHNIn}
                >
                    <Rect
                        x="0"
                        y="24"
                        width={widthOfTheRightSkeleton}
                        height="20"
                    />
                </SkeletonViewContentLoader>
            </View>
        </View>
    );
}

TransactionPreviewSkeletonView.displayName = 'TransactionPreviewSkeletonView';
export default TransactionPreviewSkeletonView;
