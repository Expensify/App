import ScrollView from '@components/ScrollView';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useKeyboardState from '@hooks/useKeyboardState';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import CONST from '@src/CONST';

// eslint-disable-next-line no-restricted-imports -- type-only import from react-native
import type {LayoutChangeEvent, ScrollView as RNScrollView, StyleProp, ViewStyle} from 'react-native';

import {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type UseScrollableWrapperOptions = {
    shouldUseScrollView?: boolean;
    width?: number;
};

function useScrollableWrapper({shouldUseScrollView: shouldUseScrollViewProp = false, width}: UseScrollableWrapperOptions) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {onboardingIsMediumOrLargerScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const {isKeyboardActive} = useKeyboardState();

    const shouldUseScrollView = shouldUseScrollViewProp || isInLandscapeMode;

    // The modal runs in edge-to-edge mode, so the bottom inset belongs on the content. It is only needed while the modal is
    // bottom-docked — which is exactly when `onboardingIsMediumOrLargerScreenWidth` is false — and must be dropped while the
    // keyboard is up, otherwise a gap appears above it.
    const shouldAddBottomSafeAreaPadding = !onboardingIsMediumOrLargerScreenWidth && !isKeyboardActive;
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: !shouldUseScrollView && shouldAddBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding: false,
    });

    const scrollViewRef = useRef<RNScrollView>(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        if (contentHeight <= containerHeight || onboardingIsMediumOrLargerScreenWidth || !shouldUseScrollView) {
            return;
        }
        scrollViewRef.current?.scrollToEnd({animated: false});
    }, [contentHeight, containerHeight, onboardingIsMediumOrLargerScreenWidth, shouldUseScrollView]);

    const Wrapper = shouldUseScrollView ? ScrollView : View;
    const wrapperStyles = shouldUseScrollView ? StyleUtils.getScrollableFeatureTrainingModalStyles() : ({} as {style?: StyleProp<ViewStyle>; containerStyle?: StyleProp<ViewStyle>});

    const style: StyleProp<ViewStyle> = [
        onboardingIsMediumOrLargerScreenWidth && width !== undefined && StyleUtils.getWidthStyle(width),
        wrapperStyles.style,
        isInLandscapeMode ? {maxHeight: windowHeight * CONST.MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO_LANDSCAPE_MODE} : styles.mh100,
        bottomSafeAreaPaddingStyle,
    ];

    const onLayout = shouldUseScrollView ? (e: LayoutChangeEvent) => setContainerHeight(e.nativeEvent.layout.height) : undefined;
    const onContentSizeChange = shouldUseScrollView ? (_w: number, h: number) => setContentHeight(h) : undefined;

    return {
        Wrapper,
        wrapperProps: {
            scrollsToTop: false,
            style,
            contentContainerStyle: wrapperStyles.containerStyle,
            keyboardShouldPersistTaps: shouldUseScrollView ? ('handled' as const) : undefined,
            addBottomSafeAreaPadding: shouldUseScrollView ? shouldAddBottomSafeAreaPadding : undefined,
            ref: shouldUseScrollView ? scrollViewRef : undefined,
            onLayout,
            onContentSizeChange,
            fsClass: CONST.FULLSTORY.CLASS.UNMASK,
        },
        setContainerHeight,
        setContentHeight,
        shouldUseScrollView,
        isInLandscapeMode,
    };
}

export default useScrollableWrapper;
