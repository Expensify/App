import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ScrollView from '@components/ScrollView';
import Tooltip from '@components/Tooltip';

import useKeyboardState from '@hooks/useKeyboardState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import isInLandscapeModeUtil from '@libs/isInLandscapeMode';

import variables from '@styles/variables';

import CONST from '@src/CONST';

// eslint-disable-next-line no-restricted-imports -- Type import needed for ref typing; no wrapper available
import type {LayoutChangeEvent, FlatList as RNFlatList, ScrollView as RNScrollView, ViewabilityConfig, ViewStyle, ViewToken} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Platform, View} from 'react-native';

import type {FeatureTrainingCarouselProps, FeatureTrainingContentDataProps} from './types';

import FeatureTrainingContentBody from './FeatureTrainingContentBody';
import FeatureTrainingContentBodyText from './FeatureTrainingContentBodyText';
import FeatureTrainingContentIllustration from './FeatureTrainingContentIllustration';

const CONTENT_PADDING = variables.spacing2;

// A page is considered "viewable" — and `currentPage` updates — only once it occupies at least
// 95% of the viewport. The viewability event fires for both user swipes and programmatic
// scrollToIndex once the scroll has practically settled on a new page.
const CAROUSEL_VIEWABILITY_CONFIG: ViewabilityConfig = {itemVisiblePercentThreshold: 95};
const CAROUSEL_DOT_SIZE = 6;
const PAGINATION_DOTS_BOTTOM_OFFSET = 5;

const WEB_CAROUSEL_PAGE_SNAP_STYLE: ViewStyle = Platform.OS === 'web' ? ({scrollSnapAlign: 'start', scrollSnapStop: 'always'} as ViewStyle) : {};

function FeatureTrainingCarousel({
    pages,
    width = variables.featureTrainingModalWidth,
    titleStyles,
    illustrationAspectRatio,
    illustrationInnerContainerStyle,
    illustrationOuterContainerStyle,
    shouldRenderHTMLDescription = false,
    shouldUseScrollView: shouldUseScrollViewProp = false,
    helpText = '',
    onHelp = () => {},
    helpSentryLabel,
    confirmSentryLabel,
    contentInnerContainerStyles,
    contentOuterContainerStyles,
    onConfirm,
    onClose,
    onPageChange,
}: FeatureTrainingCarouselProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close']);
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const {isKeyboardActive} = useKeyboardState();
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);

    const [currentPage, setCurrentPage] = useState(0);
    const [carouselViewportWidth, setCarouselViewportWidth] = useState(0);
    const horizontalListRef = useRef<RNFlatList<FeatureTrainingContentDataProps>>(null);
    const lastReportedPage = useRef(0);

    const scrollViewRef = useRef<RNScrollView>(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [contentMinHeight, setContentMinHeight] = useState<number | undefined>(undefined);
    const measuredHeightsRef = useRef<Record<number, number>>({});
    const handleProbeLayout = (index: number) => (event: LayoutChangeEvent) => {
        const measured = event.nativeEvent.layout.height;
        if (measuredHeightsRef.current[index] === measured) {
            return;
        }
        measuredHeightsRef.current[index] = measured;
        if (Object.keys(measuredHeightsRef.current).length < pages.length) {
            return;
        }
        setContentMinHeight(Math.max(...Object.values(measuredHeightsRef.current)));
    };

    const shouldUseScrollView = shouldUseScrollViewProp || isInLandscapeMode;

    // FlatList's `onViewableItemsChanged` must keep a stable identity (it errors otherwise).
    // The handler reads the latest `onPageChange` via a ref so the callback identity never changes.
    const onPageChangeRef = useRef(onPageChange);
    useEffect(() => {
        onPageChangeRef.current = onPageChange;
    }, [onPageChange]);

    const onViewableItemsChanged = ({viewableItems}: {viewableItems: ViewToken[]}) => {
        const entry = viewableItems.at(0);
        if (entry?.index == null || entry.index === lastReportedPage.current) {
            return;
        }
        lastReportedPage.current = entry.index;
        setCurrentPage(entry.index);
        onPageChangeRef.current?.(entry.index);
    };

    const advanceCarousel = () => {
        horizontalListRef.current?.scrollToIndex({index: Math.min(currentPage + 1, pages.length - 1), animated: true});
    };

    const goBack = () => {
        if (currentPage <= 0) {
            return;
        }
        horizontalListRef.current?.scrollToIndex({index: Math.max(currentPage - 1, 0), animated: true});
    };

    const handleConfirmPress = () => {
        if (currentPage < pages.length - 1) {
            advanceCarousel();
            return;
        }
        onConfirm?.(false);
    };

    useEffect(() => {
        if (contentHeight <= containerHeight || onboardingIsMediumOrLargerScreenWidth || !shouldUseScrollView) {
            return;
        }
        scrollViewRef.current?.scrollToEnd({animated: false});
    }, [contentHeight, containerHeight, onboardingIsMediumOrLargerScreenWidth, shouldUseScrollView]);

    const Wrapper = shouldUseScrollView ? ScrollView : View;

    const wrapperStyles = shouldUseScrollView ? StyleUtils.getScrollableFeatureTrainingModalStyles(insets, isKeyboardActive) : {};

    const carouselPaginationDots = pages.map((_page, index) => (
        <View
            // The array is static for the modal's lifetime, so the index is a stable key.
            // eslint-disable-next-line react/no-array-index-key
            key={`carousel-dot-${index}`}
            style={StyleUtils.getFeatureTrainingCarouselDotStyle(CAROUSEL_DOT_SIZE, theme.buttonSuccessText, index === currentPage)}
        />
    ));

    const currentPageData = pages.at(currentPage);

    return (
        <Wrapper
            scrollsToTop={false}
            style={[
                onboardingIsMediumOrLargerScreenWidth && StyleUtils.getWidthStyle(width),
                wrapperStyles.style,
                isInLandscapeMode ? {maxHeight: windowHeight * CONST.MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO_LANDSCAPE_MODE} : styles.mh100,
            ]}
            contentContainerStyle={isInLandscapeMode ? wrapperStyles.containerStyle : undefined}
            keyboardShouldPersistTaps={shouldUseScrollView ? 'handled' : undefined}
            ref={shouldUseScrollView ? scrollViewRef : undefined}
            onLayout={(e: LayoutChangeEvent) => {
                const newWidth = e.nativeEvent.layout.width;
                if (newWidth === carouselViewportWidth || newWidth <= 0) {
                    return;
                }
                setCarouselViewportWidth(newWidth);
                if (!shouldUseScrollView) {
                    return;
                }
                setContainerHeight(e.nativeEvent.layout.height);
            }}
            onContentSizeChange={shouldUseScrollView ? (_w: number, h: number) => setContentHeight(h) : undefined}
            // eslint-disable-next-line react/forbid-component-props -- fsClass is required for FullStory session masking
            fsClass={CONST.FULLSTORY.CLASS.UNMASK}
        >
            {carouselViewportWidth > 0 &&
                contentMinHeight === undefined && (
                    // Probe layer is used to measure the tallest page to lock the modal height
                    // when moving between pages with different content lengths.
                    <View
                        pointerEvents="none"
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                        style={[styles.pAbsolute, styles.l0, styles.t0, {width: carouselViewportWidth, opacity: 0}]}
                    >
                        {pages.map((page, index) => (
                            <View
                                // The pages array is static for the modal's lifetime, so the index is a stable key.
                                // eslint-disable-next-line react/no-array-index-key
                                key={`FeatureTrainingModalCarousel-probe-${index}`}
                                style={styles.mh5}
                            >
                                <FeatureTrainingContentBodyText
                                    title={page.title}
                                    subtitle={page.subtitle}
                                    description={page.description}
                                    titleStyles={titleStyles}
                                    contentInnerContainerStyles={contentInnerContainerStyles}
                                    shouldRenderHTMLDescription={shouldRenderHTMLDescription}
                                    onLayout={handleProbeLayout(index)}
                                />
                            </View>
                        ))}
                    </View>
                )}
            {carouselViewportWidth > 0 && (
                <>
                    <View>
                        <FlatList
                            ref={horizontalListRef}
                            data={pages}
                            keyExtractor={(_page, index) => `FeatureTrainingContentIllustration-${index}`}
                            horizontal
                            pagingEnabled
                            disableIntervalMomentum
                            snapToInterval={carouselViewportWidth}
                            decelerationRate="fast"
                            bounces={false}
                            showsHorizontalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            viewabilityConfig={CAROUSEL_VIEWABILITY_CONFIG}
                            onViewableItemsChanged={onViewableItemsChanged}
                            getItemLayout={(_data, index) => ({length: carouselViewportWidth, offset: index * carouselViewportWidth, index})}
                            renderItem={({item: page, index}) => (
                                <View style={[{width: carouselViewportWidth}, WEB_CAROUSEL_PAGE_SNAP_STYLE]}>
                                    <FeatureTrainingContentIllustration
                                        illustrationAspectRatio={illustrationAspectRatio}
                                        illustrationInnerContainerStyle={illustrationInnerContainerStyle}
                                        illustrationOuterContainerStyle={illustrationOuterContainerStyle}
                                        isCarousel
                                        isFocused={index === currentPage}
                                        {...page}
                                    />
                                </View>
                            )}
                        />
                        <View
                            pointerEvents="none"
                            style={[
                                styles.pAbsolute,
                                styles.flexRow,
                                styles.justifyContentCenter,
                                styles.w100,
                                styles.l0,
                                styles.r0,
                                StyleUtils.getFeatureTrainingCarouselDotsContainerStyle(PAGINATION_DOTS_BOTTOM_OFFSET + CONTENT_PADDING),
                            ]}
                        >
                            {carouselPaginationDots}
                        </View>
                    </View>
                    <FeatureTrainingContentBody
                        title={currentPageData?.title}
                        subtitle={currentPageData?.subtitle}
                        description={currentPageData?.description}
                        confirmText={currentPageData?.confirmText ?? ''}
                        helpText={helpText}
                        onHelp={onHelp}
                        helpSentryLabel={helpSentryLabel}
                        confirmSentryLabel={confirmSentryLabel}
                        onConfirm={handleConfirmPress}
                        shouldShowBackButton={currentPage > 0}
                        onBack={goBack}
                        titleStyles={titleStyles}
                        contentInnerContainerStyles={[contentInnerContainerStyles, contentMinHeight !== undefined && {minHeight: contentMinHeight}]}
                        contentOuterContainerStyles={contentOuterContainerStyles}
                        shouldRenderHTMLDescription={shouldRenderHTMLDescription}
                    />
                    <View style={StyleUtils.getFeatureTrainingCarouselCloseButtonContainerStyle(CONTENT_PADDING)}>
                        <Tooltip text={translate('common.close')}>
                            <PressableWithFeedback
                                onPress={onClose}
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('common.close')}
                                sentryLabel={CONST.SENTRY_LABEL.FEATURE_TRAINING.CLOSE_BUTTON}
                                style={[styles.p2, styles.opacitySemiTransparent]}
                            >
                                <Icon
                                    src={expensifyIcons.Close}
                                    fill={theme.buttonSuccessText}
                                />
                            </PressableWithFeedback>
                        </Tooltip>
                    </View>
                </>
            )}
        </Wrapper>
    );
}

export default FeatureTrainingCarousel;
