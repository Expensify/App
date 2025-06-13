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

    const isWidthANumber = typeof transactionPreviewWidth === 'number';
    const width = isWidthANumber ? transactionPreviewWidth - styles.p4.padding * 2 : transactionPreviewWidth;
    const height = variables.transactionPreviewSkeletonHeight;

    return (
        <View style={[styles.p4, styles.mtn1]}>
            <SkeletonViewContentLoader
                testID={TransactionPreviewSkeletonView.displayName}
                animate
                width={width}
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
                    width="120"
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
            <View style={[styles.r0, styles.b0, styles.p4, styles.mtn1, styles.pAbsolute, styles.mirror]}>
                <SkeletonViewContentLoader
                    width={width}
                    height={height}
                    foregroundColor={theme.skeletonLHNOut}
                    backgroundColor={theme.skeletonLHNIn}
                >
                    <Rect
                        x="0"
                        y="24"
                        width="68"
                        height="20"
                    />
                </SkeletonViewContentLoader>
            </View>
        </View>
    );
}

TransactionPreviewSkeletonView.displayName = 'TransactionPreviewSkeletonView';
export default TransactionPreviewSkeletonView;
