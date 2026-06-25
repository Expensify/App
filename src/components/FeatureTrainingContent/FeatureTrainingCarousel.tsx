import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Platform, View} from 'react-native';
import type {LayoutChangeEvent, FlatList as RNFlatList, ViewabilityConfig, ViewStyle, ViewToken} from 'react-native';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import FeatureTrainingContentBody from './FeatureTrainingContentBody';
import FeatureTrainingContentBodyText from './FeatureTrainingContentBodyText';
import FeatureTrainingContentIllustration from './FeatureTrainingContentIllustration';
import type {FeatureTrainingCarouselProps, FeatureTrainingContentDataProps} from './types';

const CONTENT_PADDING = variables.spacing2;

// A page is considered "viewable" — and `currentPage` updates — only once it occupies at least
// 95% of the viewport. The viewability event fires for both user swipes and programmatic
// scrollToIndex once the scroll has practically settled on a new page.
const CAROUSEL_VIEWABILITY_CONFIG: ViewabilityConfig = {itemVisiblePercentThreshold: 95};
const CAROUSEL_DOT_SIZE = 6;
const PAGINATION_DOTS_BOTTOM_OFFSET = 5;

// react-native-web translates `pagingEnabled` to CSS scroll-snap, but `scroll-snap-align` only
// lands on the ScrollView's direct children — our per-page View (inside `renderItem`) isn't a
// direct child, so the FlatList ends up with a single snap point and fast flings skip pages.
// Applying `scrollSnapAlign: 'start'` on each page wrapper turns every page into a snap point.
// Native ignores this CSS-only key, so we still gate it on Platform.OS === 'web' for clarity.
const WEB_CAROUSEL_PAGE_SNAP_STYLE: ViewStyle = Platform.OS === 'web' ? ({scrollSnapAlign: 'start'} as ViewStyle) : {};

function FeatureTrainingCarousel({
    pages,
    width = variables.featureTrainingModalWidth,
    titleStyles,
    illustrationAspectRatio,
    illustrationInnerContainerStyle,
    illustrationOuterContainerStyle,
    shouldRenderSVG = true,
    shouldRenderHTMLDescription = false,
    helpText = '',
    onHelp = () => {},
    helpSentryLabel,
    confirmSentryLabel,
    shouldShowConfirmationLoader = false,
    canConfirmWhileOffline = true,
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

    const [currentPage, setCurrentPage] = useState(0);
    const [carouselViewportWidth, setCarouselViewportWidth] = useState(0);
    const horizontalListRef = useRef<RNFlatList<FeatureTrainingContentDataProps>>(null);
    const lastReportedPage = useRef(0);

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
        <View
            // On narrow viewports (mWeb BOTTOM_DOCKED) the outer View has no intrinsic content
            // (everything below is gated by `carouselViewportWidth > 0`), so without `w100` it
            // collapses to 0×0 inside the `fit-content` modal sheet — `onLayout` then never
            // fires with a positive width and the carousel never renders, leaving the modal
            // backdrop visible with no content. `w100` makes the View stretch to the sheet's
            // known full width and lets `onLayout` resolve immediately. On medium+ screens the
            // explicit `getWidthStyle(width)` continues to apply.
            style={[onboardingIsMediumOrLargerScreenWidth ? StyleUtils.getWidthStyle(width) : styles.w100]}
            onLayout={(e: LayoutChangeEvent) => {
                const newWidth = e.nativeEvent.layout.width;
                if (newWidth === carouselViewportWidth || newWidth <= 0) {
                    return;
                }
                setCarouselViewportWidth(newWidth);
            }}
        >
            {carouselViewportWidth > 0 && contentMinHeight === undefined && (
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
                                secondaryDescription={page.secondaryDescription}
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
                            // Defense-in-depth on native: `pagingEnabled` is honored by the
                            // platform, but these props arrest momentum precisely at each page
                            // so fast flings never coast over a middle page. On web they're
                            // no-ops; `WEB_CAROUSEL_PAGE_SNAP_STYLE` below does the equivalent
                            // work via CSS scroll-snap.
                            disableIntervalMomentum
                            snapToInterval={carouselViewportWidth}
                            decelerationRate="fast"
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
                                        shouldRenderSVG={shouldRenderSVG}
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
                                {bottom: PAGINATION_DOTS_BOTTOM_OFFSET + CONTENT_PADDING},
                            ]}
                        >
                            {carouselPaginationDots}
                        </View>
                    </View>
                    <FeatureTrainingContentBody
                        title={currentPageData?.title}
                        subtitle={currentPageData?.subtitle}
                        description={currentPageData?.description}
                        secondaryDescription={currentPageData?.secondaryDescription}
                        confirmText={currentPageData?.confirmText ?? ''}
                        helpText={helpText}
                        onHelp={onHelp}
                        helpSentryLabel={helpSentryLabel}
                        confirmSentryLabel={confirmSentryLabel}
                        onConfirm={handleConfirmPress}
                        shouldShowBackButton={currentPage > 0}
                        onBack={goBack}
                        shouldShowConfirmationLoader={shouldShowConfirmationLoader}
                        canConfirmWhileOffline={canConfirmWhileOffline}
                        titleStyles={titleStyles}
                        contentInnerContainerStyles={[contentInnerContainerStyles, contentMinHeight !== undefined && {minHeight: contentMinHeight}]}
                        contentOuterContainerStyles={contentOuterContainerStyles}
                        shouldRenderHTMLDescription={shouldRenderHTMLDescription}
                    />
                    <View style={[styles.pAbsolute, {top: CONTENT_PADDING, right: CONTENT_PADDING, zIndex: 1}]}>
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
        </View>
    );
}

export default FeatureTrainingCarousel;
