import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, BackHandler} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import HelpContent from './HelpContent';
import type HelpProps from './types';

function Help({sidePaneTranslateX, closeSidePane}: HelpProps) {
    const styles = useThemeStyles();
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {paddingTop, paddingBottom} = useSafeAreaPaddings();

    // SidePane isn't a native screen, this handles the back button press on Android
    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                closeSidePane();
                // Return true to indicate that the back button press is handled here
                return true;
            });

            return () => backHandler.remove();
        }, [closeSidePane]),
    );

    return (
        <Animated.View style={[styles.sidePaneContainer(shouldUseNarrowLayout, isExtraLargeScreenWidth), {transform: [{translateX: sidePaneTranslateX.current}], paddingTop, paddingBottom}]}>
            <HelpContent />
        </Animated.View>
    );
}

Help.displayName = 'Help';

export default Help;
