import React, {useEffect, useState} from 'react';
import type {ActivityIndicatorProps, StyleProp, ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ExtraLoadingContext} from '@libs/AppState';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ActivityIndicator from './ActivityIndicator';
import Button from './Button';
import Text from './Text';

type FullScreenLoadingIndicatorIconSize = ActivityIndicatorProps['size'];

type FullScreenLoadingIndicatorProps = {
    /** Styles of the outer view */
    style?: StyleProp<ViewStyle>;

    /** Size of the icon */
    iconSize?: FullScreenLoadingIndicatorIconSize;

    /** Whether the "Go Back" button appears after a timeout. */
    shouldUseGoBackButton?: boolean;

    /** The ID of the test to be used for testing */
    testID?: string;

    /** Extra loading context to be passed to the logAppStateOnLongLoading function */
    extraLoadingContext?: ExtraLoadingContext;
};

function FullScreenLoadingIndicator({
    style,
    iconSize = CONST.ACTIVITY_INDICATOR_SIZE.LARGE,
    shouldUseGoBackButton = false,
    testID = '',
    extraLoadingContext,
}: FullScreenLoadingIndicatorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [showGoBackButton, setShowGoBackButton] = useState(false);

    useEffect(() => {
        if (!shouldUseGoBackButton) {
            return;
        }

        const timeoutId = setTimeout(() => {
            setShowGoBackButton(true);
        }, CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT);
        return () => clearTimeout(timeoutId);
    }, [shouldUseGoBackButton]);

    return (
        <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading, styles.w100, style]}>
            <View style={styles.w100}>
                <ActivityIndicator
                    size={iconSize}
                    testID={testID}
                    extraLoadingContext={extraLoadingContext}
                />
                {showGoBackButton && (
                    <View style={styles.loadingMessage}>
                        <View style={styles.pv4}>
                            <Text>{translate('common.thisIsTakingLongerThanExpected')}</Text>
                        </View>
                        <Button
                            text={translate('common.goBack')}
                            onPress={() => Navigation.goBack()}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}

FullScreenLoadingIndicator.displayName = 'FullScreenLoadingIndicator';

export default FullScreenLoadingIndicator;

export type {FullScreenLoadingIndicatorIconSize};
