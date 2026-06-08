import type {ImageContentFit} from 'expo-image';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {LayoutChangeEvent, FlatList as RNFlatList, ScrollView as RNScrollView, StyleProp, TextStyle, ViewabilityConfig, ViewStyle, ViewToken} from 'react-native';
import type {MergeExclusive} from 'type-fest';
import type ImageSVGProps from '@components/ImageSVG/types';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import Modal from '@components/Modal';
import ScrollView from '@components/ScrollView';
import useKeyboardState from '@hooks/useKeyboardState';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
// Transition tracker is used directly as we defer the opening of the modal until other animations are finished,
// for which there is no higher-level API.
// eslint-disable-next-line no-restricted-imports
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import variables from '@styles/variables';
import {setNameValuePair} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';
import FeatureTrainingModalBody from './FeatureTrainingModalBody';

const MODAL_PADDING = variables.spacing2;

// A page is considered "viewable" — and `currentPage` updates — only once it occupies at least
// 95% of the viewport. The viewability event fires for both user swipes and programmatic
// scrollToIndex once the scroll has practically settled on a new page.
const CAROUSEL_VIEWABILITY_CONFIG: ViewabilityConfig = {itemVisiblePercentThreshold: 95};

type BaseFeatureTrainingModalProps = {
    /** The aspect ratio to preserve for the icon, video or animation */
    illustrationAspectRatio?: number;

    /** Style for the inner container of the animation */
    illustrationInnerContainerStyle?: StyleProp<ViewStyle>;

    /** Style for the outer container of the animation */
    illustrationOuterContainerStyle?: StyleProp<ViewStyle>;

    /** Style for the title */
    titleStyles?: StyleProp<TextStyle>;

    /** Whether to show `Don't show me this again` option */
    shouldShowDismissModalOption?: boolean;

    /** A callback to call when user confirms the tutorial */
    onConfirm?: (willShowAgain: boolean) => void;

    /** A callback to call when modal closes */
    onClose?: () => void;

    /** Text to show on secondary button */
    helpText?: string;

    /** Link to navigate to when user wants to learn more */
    onHelp?: () => void;

    /** Styles for the content container */
    contentInnerContainerStyles?: StyleProp<ViewStyle>;

    /** Styles for the content outer container */
    contentOuterContainerStyles?: StyleProp<ViewStyle>;

    /** Styles for the modal inner container */
    modalInnerContainerStyle?: ViewStyle;

    /** Children to show below title and description and above buttons (single-page mode only) */
    children?: React.ReactNode;

    /** Modal width */
    width?: number;

    /** Whether to disable the modal */
    isModalDisabled?: boolean;

    /** Whether the modal image is a SVG */
    shouldRenderSVG?: boolean;

    /** Whether the modal description is written in HTML */
    shouldRenderHTMLDescription?: boolean;

    /** Whether the modal will be closed on confirm */
    shouldCloseOnConfirm?: boolean;

    /** Whether the modal should avoid the keyboard */
    avoidKeyboard?: boolean;

    /** Whether the modal content is scrollable */
    shouldUseScrollView?: boolean;

    /** Whether the modal is displaying a confirmation loading spinner (useful when fetching data from API during confirmation) */
    shouldShowConfirmationLoader?: boolean;

    /** Whether the user can confirm the tutorial while offline */
    canConfirmWhileOffline?: boolean;

    /** Whether to navigate back when closing the modal */
    shouldGoBack?: boolean;

    /** Whether to call onHelp when modal is hidden completely */
    shouldCallOnHelpWhenModalHidden?: boolean;

    /** Sentry label for the help/skip button */
    helpSentryLabel?: string;

    /** Sentry label for the confirm/submit button */
    confirmSentryLabel?: string;
};

type FeatureTrainingModalContentProps = {
    /** Title for the modal */
    title?: string | React.ReactNode;

    /** Subtitle for the modal */
    subtitle?: string;

    /** Describe what is showing */
    description?: string;

    /** Secondary description rendered with additional space */
    secondaryDescription?: string;

    /** Text to show on primary button */
    confirmText: string;
};

type FeatureTrainingModalVideoProps = {
    /** Animation to show when video is unavailable. Useful when app is offline */
    animation?: DotLottieAnimation;

    /** Additional styles for the animation */
    animationStyle?: StyleProp<ViewStyle>;

    /** URL for the video */
    videoURL?: string;
};

type FeatureTrainingModalSVGProps = {
    /** Expensicon for the page */
    image: IconAsset;

    /** Determines how the image should be resized to fit its container */
    contentFitImage?: ImageContentFit;

    /** The width of the image */
    imageWidth?: ImageSVGProps['width'];

    /** The height of the image */
    imageHeight?: ImageSVGProps['height'];
};

// This page requires either an icon or a video/animation, but not both.
type FeatureTrainingModalIllustrationProps = MergeExclusive<FeatureTrainingModalVideoProps, FeatureTrainingModalSVGProps>;

type FeatureTrainingModalPageProps = FeatureTrainingModalIllustrationProps & FeatureTrainingModalContentProps;

type FeatureTrainingModalCarouselProps = {
    /**
     * When provided (and length > 1), the modal renders a horizontal paging carousel.
     * The primary button advances to the next page until the last page, where it fires `onConfirm`.
     */
    pages?: FeatureTrainingModalPageProps[];

    /** Called when the user swipes to a different page. */
    onPageChange?: (index: number) => void;
};

// Either single-page content fields OR carousel pages, but not both.
type FeatureTrainingModalProps = BaseFeatureTrainingModalProps & MergeExclusive<FeatureTrainingModalPageProps, FeatureTrainingModalCarouselProps>;

function FeatureTrainingModal({
    illustrationInnerContainerStyle,
    illustrationOuterContainerStyle,
    illustrationAspectRatio: illustrationAspectRatioProp,
    width = variables.featureTrainingModalWidth,
    title = '',
    subtitle = '',
    description = '',
    secondaryDescription = '',
    titleStyles,
    shouldShowDismissModalOption = false,
    confirmText = '',
    onConfirm = () => {},
    onClose = () => {},
    helpText = '',
    onHelp = () => {},
    children,
    contentInnerContainerStyles,
    contentOuterContainerStyles,
    modalInnerContainerStyle,
    isModalDisabled = true,
    shouldRenderSVG = true,
    shouldRenderHTMLDescription = false,
    shouldCloseOnConfirm = true,
    avoidKeyboard = false,
    shouldUseScrollView: shouldUseScrollViewProp = false,
    shouldShowConfirmationLoader = false,
    canConfirmWhileOffline = true,
    shouldGoBack = true,
    shouldCallOnHelpWhenModalHidden = false,
    helpSentryLabel,
    confirmSentryLabel,
    pages,
    onPageChange,
    ...props
}: FeatureTrainingModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [willShowAgain, setWillShowAgain] = useState(true);
    const hasHelpButtonBeenPressed = useRef(false);
    const pendingCloseRef = useRef(false);
    const scrollViewRef = useRef<RNScrollView>(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const insets = useSafeAreaInsets();
    const {isKeyboardActive} = useKeyboardState();
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);

    const isCarousel = !!pages && pages.length > 1;
    const [currentPage, setCurrentPage] = useState(0);
    const [carouselViewportWidth, setCarouselViewportWidth] = useState(0);
    const horizontalListRef = useRef<RNFlatList<FeatureTrainingModalPageProps>>(null);
    const lastReportedPage = useRef(0);

    // FlatList's `onViewableItemsChanged` must keep a stable identity (it errors otherwise).
    // The handler reads the latest `onPageChange` via a ref so the callback identity never changes.
    const onPageChangeRef = useRef(onPageChange);
    useEffect(() => {
        onPageChangeRef.current = onPageChange;
    }, [onPageChange]);
    const onViewableItemsChanged = useCallback(({viewableItems}: {viewableItems: ViewToken[]}) => {
        const entry = viewableItems.at(0);
        if (entry?.index == null || entry.index === lastReportedPage.current) {
            return;
        }
        lastReportedPage.current = entry.index;
        setCurrentPage(entry.index);
        onPageChangeRef.current?.(entry.index);
    }, []);

    const shouldUseScrollView = shouldUseScrollViewProp || isInLandscapeMode;

    useEffect(() => {
        // Transition tracker is used directly as we defer the opening of the modal until other animations are finished,
        // for which there is no higher-level API.
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                if (!isModalDisabled) {
                    setIsModalVisible(false);
                    return;
                }
                setIsModalVisible(true);
            },
        });
        return () => handle.cancel();
    }, [isModalDisabled]);

    const toggleWillShowAgain = () => setWillShowAgain((prevWillShowAgain) => !prevWillShowAgain);

    const pendingCloseModalAction = () => {
        Log.hmmm(`[FeatureTrainingModal] Modal hidden - shouldGoBack: ${shouldGoBack}, hasOnClose: ${!!onClose}`);
        if (shouldGoBack) {
            Log.hmmm('[FeatureTrainingModal] Navigating back');
            Navigation.goBack();
        }
        if (onClose) {
            Log.hmmm('[FeatureTrainingModal] Calling onClose callback');
            onClose();
        } else {
            Log.hmmm('[FeatureTrainingModal] No onClose callback provided');
        }
    };

    const closeModal = (didPressHelpButton?: boolean) => {
        if (didPressHelpButton) {
            hasHelpButtonBeenPressed.current = true;
        }
        Log.hmmm(`[FeatureTrainingModal] closeModal called - willShowAgain: ${willShowAgain}, shouldGoBack: ${shouldGoBack}, hasOnClose: ${!!onClose}`);

        if (!willShowAgain) {
            Log.hmmm('[FeatureTrainingModal] Dismissing track training modal');
            setNameValuePair(ONYXKEYS.NVP_HAS_SEEN_TRACK_TRAINING, true, false);
        }

        Log.hmmm('[FeatureTrainingModal] Setting modal invisible');
        pendingCloseRef.current = true;
        setIsModalVisible(false);
    };

    const closeAndConfirmModal = () => {
        Log.hmmm(`[FeatureTrainingModal] Button pressed - shouldCloseOnConfirm: ${shouldCloseOnConfirm}, hasOnConfirm: ${!!onConfirm}, willShowAgain: ${willShowAgain}`);

        if (shouldCloseOnConfirm) {
            Log.hmmm('[FeatureTrainingModal] Calling closeModal');
            closeModal();
        }

        if (onConfirm) {
            Log.hmmm('[FeatureTrainingModal] Calling onConfirm callback');
            onConfirm(willShowAgain);
        } else {
            Log.hmmm('[FeatureTrainingModal] No onConfirm callback provided');
        }
    };

    const advanceCarousel = () => {
        if (!isCarousel) {
            return;
        }
        horizontalListRef.current?.scrollToIndex({index: Math.min(currentPage + 1, pages.length - 1), animated: true});
    };

    const goBack = () => {
        if (!isCarousel || currentPage <= 0) {
            return;
        }
        horizontalListRef.current?.scrollToIndex({index: Math.max(currentPage - 1, 0), animated: true});
    };

    const handleConfirmPress = () => {
        if (isCarousel && currentPage < pages.length - 1) {
            advanceCarousel();
            return;
        }
        closeAndConfirmModal();
    };

    // Scrolls modal to the bottom when keyboard appears so the action buttons are visible.
    useEffect(() => {
        if (contentHeight <= containerHeight || onboardingIsMediumOrLargerScreenWidth || !shouldUseScrollView || isCarousel) {
            return;
        }
        scrollViewRef.current?.scrollToEnd({animated: false});
    }, [contentHeight, containerHeight, onboardingIsMediumOrLargerScreenWidth, shouldUseScrollView]);

    const Wrapper = shouldUseScrollView ? ScrollView : View;

    const wrapperStyles = shouldUseScrollView ? StyleUtils.getScrollableFeatureTrainingModalStyles(insets, isKeyboardActive) : {};

    return (
        <Modal
            avoidKeyboard={avoidKeyboard}
            isVisible={isModalVisible}
            type={onboardingIsMediumOrLargerScreenWidth ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE : CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            onClose={closeModal}
            innerContainerStyle={{
                boxShadow: 'none',
                ...(shouldUseScrollView ? styles.pb0 : styles.pb5),
                paddingTop: onboardingIsMediumOrLargerScreenWidth ? undefined : MODAL_PADDING,
                ...(onboardingIsMediumOrLargerScreenWidth
                    ? // Override styles defined by MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
                      // To make it take as little space as possible.
                      {
                          flex: undefined,
                          width: 'auto',
                      }
                    : {}),
                ...modalInnerContainerStyle,
            }}
            onModalHide={() => {
                if (pendingCloseRef.current) {
                    pendingCloseRef.current = false;
                    pendingCloseModalAction();
                }
                if (!shouldCallOnHelpWhenModalHidden || !hasHelpButtonBeenPressed.current) {
                    return;
                }
                onHelp();
            }}
            shouldDisableBottomSafeAreaPadding={shouldUseScrollView}
            shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={!shouldUseScrollView}
        >
            {isCarousel ? (
                <View
                    style={[
                        onboardingIsMediumOrLargerScreenWidth && StyleUtils.getWidthStyle(width),
                        isInLandscapeMode ? {maxHeight: windowHeight * CONST.MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO_LANDSCAPE_MODE} : styles.mh100,
                    ]}
                    onLayout={(e: LayoutChangeEvent) => {
                        const newWidth = e.nativeEvent.layout.width;
                        if (newWidth === carouselViewportWidth || newWidth <= 0) {
                            return;
                        }
                        setCarouselViewportWidth(newWidth);
                    }}
                >
                    {carouselViewportWidth > 0 && (
                        <FlatList
                            ref={horizontalListRef}
                            data={pages}
                            keyExtractor={(_page, index) => `FeatureTrainingModalBody-${index}`}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            viewabilityConfig={CAROUSEL_VIEWABILITY_CONFIG}
                            onViewableItemsChanged={onViewableItemsChanged}
                            getItemLayout={(_data, index) => ({length: carouselViewportWidth, offset: index * carouselViewportWidth, index})}
                            renderItem={({item: page, index}) => {
                                const body = (
                                    <FeatureTrainingModalBody
                                        animation={page.animation}
                                        animationStyle={page.animationStyle}
                                        illustrationInnerContainerStyle={illustrationInnerContainerStyle}
                                        illustrationOuterContainerStyle={illustrationOuterContainerStyle}
                                        illustrationAspectRatio={illustrationAspectRatioProp}
                                        width={carouselViewportWidth}
                                        title={page.title}
                                        subtitle={page.subtitle}
                                        description={page.description}
                                        secondaryDescription={page.secondaryDescription}
                                        titleStyles={titleStyles}
                                        shouldShowDismissModalOption={shouldShowDismissModalOption}
                                        confirmText={page.confirmText}
                                        helpText={helpText}
                                        onHelp={onHelp}
                                        contentInnerContainerStyles={contentInnerContainerStyles}
                                        contentOuterContainerStyles={contentOuterContainerStyles}
                                        shouldRenderSVG={shouldRenderSVG}
                                        shouldRenderHTMLDescription={shouldRenderHTMLDescription}
                                        shouldShowConfirmationLoader={shouldShowConfirmationLoader}
                                        canConfirmWhileOffline={canConfirmWhileOffline}
                                        shouldCallOnHelpWhenModalHidden={shouldCallOnHelpWhenModalHidden}
                                        helpSentryLabel={helpSentryLabel}
                                        confirmSentryLabel={confirmSentryLabel}
                                        modalPadding={MODAL_PADDING}
                                        willShowAgain={willShowAgain}
                                        toggleWillShowAgain={toggleWillShowAgain}
                                        closeModal={closeModal}
                                        confirmModal={handleConfirmPress}
                                        shouldShowBackButton={index > 0}
                                        onBack={goBack}
                                    />
                                );
                                if (!shouldUseScrollView) {
                                    return body;
                                }
                                return (
                                    <ScrollView
                                        contentContainerStyle={wrapperStyles.containerStyle}
                                        keyboardShouldPersistTaps="handled"
                                        scrollsToTop={false}
                                        style={[styles.flex1, styles.mh100]}
                                    >
                                        {body}
                                    </ScrollView>
                                );
                            }}
                        />
                    )}
                </View>
            ) : (
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
                    // Wrapper is either a View or ScrollView, which is also a View.
                    // eslint-disable-next-line react/forbid-component-props
                    fsClass={CONST.FULLSTORY.CLASS.UNMASK}
                >
                    <FeatureTrainingModalBody
                        illustrationInnerContainerStyle={illustrationInnerContainerStyle}
                        illustrationOuterContainerStyle={illustrationOuterContainerStyle}
                        illustrationAspectRatio={illustrationAspectRatioProp}
                        width={width}
                        title={title}
                        subtitle={subtitle}
                        description={description}
                        secondaryDescription={secondaryDescription}
                        titleStyles={titleStyles}
                        shouldShowDismissModalOption={shouldShowDismissModalOption}
                        confirmText={confirmText}
                        helpText={helpText}
                        onHelp={onHelp}
                        contentInnerContainerStyles={contentInnerContainerStyles}
                        contentOuterContainerStyles={contentOuterContainerStyles}
                        shouldRenderSVG={shouldRenderSVG}
                        shouldRenderHTMLDescription={shouldRenderHTMLDescription}
                        shouldShowConfirmationLoader={shouldShowConfirmationLoader}
                        canConfirmWhileOffline={canConfirmWhileOffline}
                        shouldCallOnHelpWhenModalHidden={shouldCallOnHelpWhenModalHidden}
                        helpSentryLabel={helpSentryLabel}
                        confirmSentryLabel={confirmSentryLabel}
                        modalPadding={MODAL_PADDING}
                        willShowAgain={willShowAgain}
                        toggleWillShowAgain={toggleWillShowAgain}
                        closeModal={closeModal}
                        confirmModal={handleConfirmPress}
                        {...props}
                    >
                        {children}
                    </FeatureTrainingModalBody>
                </Wrapper>
            )}
        </Modal>
    );
}

export default FeatureTrainingModal;

export type {BaseFeatureTrainingModalProps, FeatureTrainingModalProps, FeatureTrainingModalPageProps};
