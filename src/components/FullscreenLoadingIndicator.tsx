import React from 'react';
import type {ActivityIndicatorProps, StyleProp, ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ExtraLoadingContext} from '@libs/AppState';
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

    /** Extra loading context to be passed to the logAppStateOnLongLoading function */
    extraLoadingContext?: ExtraLoadingContext;
};

function FullScreenLoadingIndicator({style, iconSize = CONST.ACTIVITY_INDICATOR_SIZE.LARGE, testID = '', extraLoadingContext}: FullScreenLoadingIndicatorProps) {
    const styles = useThemeStyles();
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading, style]}>
            <ActivityIndicator
                size={iconSize}
                testID={testID}
                extraLoadingContext={extraLoadingContext}
            />
        </View>
    );
}

FullScreenLoadingIndicator.displayName = 'FullScreenLoadingIndicator';

export default FullScreenLoadingIndicator;

export type {FullScreenLoadingIndicatorIconSize};
