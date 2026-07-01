import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports -- type-only import from react-native
import type {LayoutChangeEvent, ScrollView as RNScrollView} from 'react-native';
import ScrollView from '@components/ScrollView';
import useKeyboardState from '@hooks/useKeyboardState';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import FeatureTrainingContentBody from './FeatureTrainingContentBody';
import FeatureTrainingContentIllustration from './FeatureTrainingContentIllustration';
import type {FeatureTrainingContentProps} from './types';

function FeatureTrainingContent({
    illustrationInnerContainerStyle,
    illustrationOuterContainerStyle,
    illustrationAspectRatio: illustrationAspectRatioProp,
    width = variables.featureTrainingModalWidth,
    title = '',
    subtitle = '',
    description = '',
    titleStyles,
    shouldShowDismissModalOption = false,
    confirmText = '',
    onConfirm,
    onClose,
    onWillShowAgainChange,
    helpText = '',
    onHelp,
    children,
    contentInnerContainerStyles,
    contentOuterContainerStyles,
    shouldRenderHTMLDescription = false,
    shouldCloseOnConfirm = true,
    shouldUseScrollView: shouldUseScrollViewProp = false,
    helpSentryLabel,
    confirmSentryLabel,
    ...props
}: FeatureTrainingContentProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const [willShowAgain, setWillShowAgain] = useState(true);
    const scrollViewRef = useRef<RNScrollView>(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const insets = useSafeAreaInsets();
    const {isKeyboardActive} = useKeyboardState();
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);

    const shouldUseScrollView = shouldUseScrollViewProp || isInLandscapeMode;

    const toggleWillShowAgain = () => {
        onWillShowAgainChange?.(!willShowAgain);
        setWillShowAgain((prev) => !prev);
    };

    const handleConfirm = () => {
        onConfirm?.(willShowAgain);
        if (shouldCloseOnConfirm) {
            onClose?.();
        }
    };

    useEffect(() => {
        if (contentHeight <= containerHeight || onboardingIsMediumOrLargerScreenWidth || !shouldUseScrollView) {
            return;
        }
        scrollViewRef.current?.scrollToEnd({animated: false});
    }, [contentHeight, containerHeight, onboardingIsMediumOrLargerScreenWidth, shouldUseScrollView]);

    const Wrapper = shouldUseScrollView ? ScrollView : View;

    const wrapperStyles = shouldUseScrollView ? StyleUtils.getScrollableFeatureTrainingModalStyles(insets, isKeyboardActive) : {};

    return (
        <Wrapper
            scrollsToTop={false}
            style={[
                onboardingIsMediumOrLargerScreenWidth && StyleUtils.getWidthStyle(width),
                wrapperStyles.style,
                isInLandscapeMode ? {maxHeight: windowHeight * CONST.MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO_LANDSCAPE_MODE} : styles.mh100,
            ]}
            contentContainerStyle={wrapperStyles.containerStyle}
            keyboardShouldPersistTaps={shouldUseScrollView ? 'handled' : undefined}
            ref={shouldUseScrollView ? scrollViewRef : undefined}
            onLayout={shouldUseScrollView ? (e: LayoutChangeEvent) => setContainerHeight(e.nativeEvent.layout.height) : undefined}
            onContentSizeChange={shouldUseScrollView ? (_w: number, h: number) => setContentHeight(h) : undefined}
            // eslint-disable-next-line react/forbid-component-props -- fsClass is required for FullStory session masking
            fsClass={CONST.FULLSTORY.CLASS.UNMASK}
        >
            <FeatureTrainingContentIllustration
                illustrationAspectRatio={illustrationAspectRatioProp}
                illustrationInnerContainerStyle={illustrationInnerContainerStyle}
                illustrationOuterContainerStyle={illustrationOuterContainerStyle}
                {...props}
            />
            <FeatureTrainingContentBody
                title={title}
                subtitle={subtitle}
                description={description}
                confirmText={confirmText}
                helpText={helpText}
                onHelp={onHelp}
                helpSentryLabel={helpSentryLabel}
                confirmSentryLabel={confirmSentryLabel}
                shouldShowDismissModalOption={shouldShowDismissModalOption}
                willShowAgain={willShowAgain}
                toggleWillShowAgain={toggleWillShowAgain}
                onConfirm={handleConfirm}
                titleStyles={titleStyles}
                contentInnerContainerStyles={contentInnerContainerStyles}
                contentOuterContainerStyles={contentOuterContainerStyles}
                shouldRenderHTMLDescription={shouldRenderHTMLDescription}
            >
                {children}
            </FeatureTrainingContentBody>
        </Wrapper>
    );
}

export default FeatureTrainingContent;
