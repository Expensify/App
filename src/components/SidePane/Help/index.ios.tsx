import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, Dimensions} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import HelpContent from './HelpContent';
import type HelpProps from './types';

const SCREEN_WIDTH = Dimensions.get('window').width;

function Help({sidePaneTranslateX, closeSidePane}: HelpProps) {
    const styles = useThemeStyles();
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {paddingTop, paddingBottom} = useSafeAreaPaddings();

    // SidePane isn't a native screen, this simulates the 'close swipe gesture' on iOS
    const panGesture = Gesture.Pan()
        .runOnJS(true)
        .hitSlop({left: 0, width: 20})
        .onUpdate((event) => {
            if (event.translationX <= 0) {
                return;
            }
            sidePaneTranslateX.current.setValue(event.translationX);
        })
        .onEnd((event) => {
            if (event.translationX > 100) {
                // If swiped far enough, animate out and close
                Animated.timing(sidePaneTranslateX.current, {
                    toValue: SCREEN_WIDTH,
                    duration: CONST.ANIMATED_TRANSITION,
                    useNativeDriver: false,
                }).start(() => closeSidePane());
            } else {
                // Otherwise, animate back to original position
                Animated.spring(sidePaneTranslateX.current, {
                    toValue: 0,
                    useNativeDriver: false,
                }).start();
            }
        });

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View
                style={[styles.sidePaneContainer(shouldUseNarrowLayout, isExtraLargeScreenWidth), {transform: [{translateX: sidePaneTranslateX.current}], paddingTop, paddingBottom}]}
            >
                <HelpContent />
            </Animated.View>
        </GestureDetector>
    );
}

Help.displayName = 'Help';
export default Help;
