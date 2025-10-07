import React from 'react';
import type {ActivityIndicatorProps, StyleProp, ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ActivityIndicator from './ActivityIndicator';

type FullScreenLoadingIndicatorIconSize = ActivityIndicatorProps['size'];

type FullScreenLoadingIndicatorProps = {
    /** Styles of the outer view */
    style?: StyleProp<ViewStyle>;

    /** Size of the icon */
    iconSize?: FullScreenLoadingIndicatorIconSize;

    /** The ID of the test to be used for testing */
    testID?: string;
};

function FullScreenLoadingIndicator({style, iconSize = CONST.ACTIVITY_INDICATOR_SIZE.LARGE, testID = ''}: FullScreenLoadingIndicatorProps) {
    const styles = useThemeStyles();
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading, style]}>
            <ActivityIndicator
                size={iconSize}
                testID={testID}
            />
        </View>
    );
}

FullScreenLoadingIndicator.displayName = 'FullScreenLoadingIndicator';

export default FullScreenLoadingIndicator;

export type {FullScreenLoadingIndicatorIconSize};
