import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

type TransactionPreviewSkeletonViewProps = {
    transactionPreviewWidth: number | string;
};

function TransactionPreviewSkeletonView({transactionPreviewWidth}: TransactionPreviewSkeletonViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    useSkeletonSpan('TransactionPreviewSkeletonView');

    const height = variables.transactionPreviewSkeletonHeight;
    const widthOfTheLeftSkeleton = 120;
    const widthOfTheRightSkeleton = 68;

    return (
        <View style={[styles.p4, styles.mtn1, styles.justifyContentBetween, {width: transactionPreviewWidth}]}>
            <SkeletonViewContentLoader
                testID="TransactionPreviewSkeletonView"
                animate
                width={widthOfTheLeftSkeleton}
                height={height}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                <Rect
                    transform={[{translateY: 4}]}
                    width="64"
                    height="8"
                />
                <Rect
                    transform={[{translateY: 24}]}
                    width={widthOfTheLeftSkeleton}
                    height="20"
                />
                <Rect
                    transform={[{translateY: 54.75}]}
                    width="80"
                    height="7"
                />
            </SkeletonViewContentLoader>
            <View style={[styles.r0, styles.b0, styles.p4, styles.mtn1, styles.pAbsolute]}>
                <SkeletonViewContentLoader
                    width={widthOfTheRightSkeleton}
                    height={height}
                    foregroundColor={theme.skeletonLHNOut}
                    backgroundColor={theme.skeletonLHNIn}
                >
                    <Rect
                        transform={[{translateY: 24}]}
                        width={widthOfTheRightSkeleton}
                        height="20"
                    />
                </SkeletonViewContentLoader>
            </View>
        </View>
    );
}

export default TransactionPreviewSkeletonView;
