import useThemeStyles from '@hooks/useThemeStyles';

import type {ExtraLoadingContext} from '@libs/AppState/types';

import CONST from '@src/CONST';

import type {ActivityIndicatorProps as RNActivityIndicatorProps, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import ActivityIndicator from './ActivityIndicator';

type LoadingIndicatorIconSize = RNActivityIndicatorProps['size'];

type LoadingIndicatorProps = {
    style?: StyleProp<ViewStyle>;
    iconSize?: LoadingIndicatorIconSize;

    /** Extra context logged if the spinner is shown for longer than expected */
    extraLoadingContext?: ExtraLoadingContext;
};

function LoadingIndicator({style, iconSize, extraLoadingContext}: LoadingIndicatorProps) {
    const styles = useThemeStyles();

    return (
        <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading, styles.w100, style]}>
            <View style={styles.w100}>
                <ActivityIndicator
                    size={iconSize ?? CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    extraLoadingContext={extraLoadingContext}
                />
            </View>
        </View>
    );
}

LoadingIndicator.displayName = 'LoadingIndicator';

export default LoadingIndicator;
