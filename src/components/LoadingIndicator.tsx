import React from 'react';
import type {ActivityIndicatorProps as RNActivityIndicatorProps, StyleProp, ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import ActivityIndicator from './ActivityIndicator';

type LoadingIndicatorIconSize = RNActivityIndicatorProps['size'];

type LoadingIndicatorProps = {
    /** Styles of the outer view */
    style?: StyleProp<ViewStyle>;

    /** Size of the icon */
    iconSize?: LoadingIndicatorIconSize;

    /** Reason attributes for skeleton span telemetry */
    reasonAttributes?: SkeletonSpanReasonAttributes;
};

function LoadingIndicator({style, iconSize, reasonAttributes}: LoadingIndicatorProps) {
    const styles = useThemeStyles();

    return (
        <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading, styles.w100, style]}>
            <View style={styles.w100}>
                <ActivityIndicator
                    size={iconSize ?? CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    reasonAttributes={reasonAttributes}
                />
            </View>
        </View>
    );
}

LoadingIndicator.displayName = 'LoadingIndicator';

export default LoadingIndicator;

export type {LoadingIndicatorIconSize};
