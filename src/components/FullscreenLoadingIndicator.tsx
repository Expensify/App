import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
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

    /** Timeout for the activity indicator after which we fire a log about abnormally long loading */
    timeout?: number;

    /** The ID of the test to be used for testing */
    testID?: string;

    /** Extra loading context to be passed to the logAppStateOnLongLoading function */
    extraLoadingContext?: ExtraLoadingContext;
};

function FullScreenLoadingIndicator({
    style,
    iconSize = CONST.ACTIVITY_INDICATOR_SIZE.LARGE,
    timeout = CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT,
    testID = '',
    extraLoadingContext,
}: FullScreenLoadingIndicatorProps) {
    const styles = useThemeStyles();
    const [showGoBackButton, setShowGoBackButton] = useState(false);
    const [translateY, setTranslateY] = useState(0);
    const footerRef = useRef<View>(null);

    const {translate} = useLocalize();

    useLayoutEffect(() => {
        if (!showGoBackButton || !footerRef.current) {
            return;
        }
        footerRef.current.measure((x, y, width, height) => {
            setTranslateY(height / 2);
        });
    }, [showGoBackButton]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setShowGoBackButton(true);
        }, timeout);
        return () => clearTimeout(timeoutId);
    }, [timeout]);

    return (
        <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading, style]}>
            <View style={[{transform: [{translateY}]}]}>
                <ActivityIndicator
                    size={iconSize}
                    testID={testID}
                    extraLoadingContext={extraLoadingContext}
                />
                {showGoBackButton && (
                    <View
                        style={styles.alignItemsCenter}
                        ref={footerRef}
                    >
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
