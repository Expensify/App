import type {ImageContentFit} from 'expo-image';
import type {SourceLoadEventPayload} from 'expo-video';
import React, {useEffect, useRef, useState} from 'react';
import {Image, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ImageResizeMode, ImageSourcePropType, LayoutChangeEvent, ScrollView as RNScrollView, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import type {MergeExclusive} from 'type-fest';
import useKeyboardState from '@hooks/useKeyboardState';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Accessibility from '@libs/Accessibility';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import {getIsOffline} from '@libs/NetworkState';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import Button from './Button';
import CheckboxWithLabel from './CheckboxWithLabel';
import FormAlertWithSubmitButton from './FormAlertWithSubmitButton';
import ImageSVG from './ImageSVG';
import type ImageSVGProps from './ImageSVG/types';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import type DotLottieAnimation from './LottieAnimations/types';
import OfflineIndicator from './OfflineIndicator';
import RenderHTML from './RenderHTML';
import ScrollView from './ScrollView';
import Text from './Text';
import VideoPlayer from './VideoPlayer';

const VIDEO_ASPECT_RATIO = 1280 / 960;

const CONTENT_PADDING = variables.spacing2;

type VideoStatus = 'video' | 'animation';

type BaseFeatureTrainingContentProps = {
    /** The aspect ratio to preserve for the icon, video or animation */
    illustrationAspectRatio?: number;

    /** Style for the inner container of the animation */
    illustrationInnerContainerStyle?: StyleProp<ViewStyle>;

    /** Style for the outer container of the animation */
    illustrationOuterContainerStyle?: StyleProp<ViewStyle>;

    /** Title for the modal */
    title?: string | React.ReactNode;

    /** Describe what is showing */
    description?: string;

    /** Secondary description rendered with additional space */
    secondaryDescription?: string;

    /** Style for the title */
    titleStyles?: StyleProp<TextStyle>;

    /** Whether to show `Don't show me this again` option */
    shouldShowDismissModalOption?: boolean;

    /** Text to show on primary button */
    confirmText: string;

    /** A callback to call when user confirms */
    onConfirm?: (willShowAgain: boolean) => void;

    /** A callback to call when content wants to close */
    onClose?: () => void;

    /** Called whenever the "don't show again" checkbox value changes */
    onWillShowAgainChange?: (willShowAgain: boolean) => void;

    /** Text to show on secondary button */
    helpText?: string;

    /** Link to navigate to when user wants to learn more */
    onHelp?: () => void;

    /** Styles for the content container */
    contentInnerContainerStyles?: StyleProp<ViewStyle>;

    /** Styles for the content outer container */
    contentOuterContainerStyles?: StyleProp<ViewStyle>;

    /** Children to show below title and description and above buttons */
    children?: React.ReactNode;

    /** Content width for wide layouts */
    width?: number;

    /** Whether the image is a SVG */
    shouldRenderSVG?: boolean;

    /** Whether the description is written in HTML */
    shouldRenderHTMLDescription?: boolean;

    /** Whether closing should happen on confirm */
    shouldCloseOnConfirm?: boolean;

    /** Whether the content is scrollable */
    shouldUseScrollView?: boolean;

    /** Whether to show a confirmation loading spinner */
    shouldShowConfirmationLoader?: boolean;

    /** Whether the user can confirm while offline */
    canConfirmWhileOffline?: boolean;

    /** Sentry label for the help/skip button */
    helpSentryLabel?: string;

    /** Sentry label for the confirm/submit button */
    confirmSentryLabel?: string;
};

type FeatureTrainingContentVideoProps = {
    /** Animation to show when video is unavailable */
    animation?: DotLottieAnimation;

    /** Additional styles for the animation */
    animationStyle?: StyleProp<ViewStyle>;

    /** URL for the video */
    videoURL?: string;
};

type FeatureTrainingContentSVGProps = {
    /** Expensicon for the page */
    image: IconAsset;

    /** Determines how the image should be resized to fit its container */
    contentFitImage?: ImageContentFit;

    /** The width of the image */
    imageWidth?: ImageSVGProps['width'];

    /** The height of the image */
    imageHeight?: ImageSVGProps['height'];
};

type FeatureTrainingContentProps = BaseFeatureTrainingContentProps & MergeExclusive<FeatureTrainingContentVideoProps, FeatureTrainingContentSVGProps>;

const LANDSCAPE_ILLUSTRATION_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO = 0.7;

/**
 * Once the device has been online, lock to 'video' permanently.
 * While it has never been online, show 'animation' as a fallback.
 */
function useVideoStatus(): VideoStatus {
    const [isLockedToVideo, setIsLockedToVideo] = useState(() => !getIsOffline());
    const {isOffline} = useNetwork({
        onReconnect: () => setIsLockedToVideo(true),
    });

    return isLockedToVideo || !isOffline ? 'video' : 'animation';
}

function FeatureTrainingContent({
    animation,
    animationStyle,
    illustrationInnerContainerStyle,
    illustrationOuterContainerStyle,
    videoURL,
    illustrationAspectRatio: illustrationAspectRatioProp,
    image,
    contentFitImage,
    width = variables.featureTrainingModalWidth,
    title = '',
    description = '',
    secondaryDescription = '',
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
    imageWidth,
    imageHeight,
    shouldRenderSVG = true,
    shouldRenderHTMLDescription = false,
    shouldCloseOnConfirm = true,
    shouldUseScrollView: shouldUseScrollViewProp = false,
    shouldShowConfirmationLoader = false,
    canConfirmWhileOffline = true,
    helpSentryLabel,
    confirmSentryLabel,
}: FeatureTrainingContentProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['Hands']);
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const [willShowAgain, setWillShowAgain] = useState(true);
    const [illustrationAspectRatio, setIllustrationAspectRatio] = useState(illustrationAspectRatioProp ?? VIDEO_ASPECT_RATIO);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const videoStatus = useVideoStatus();
    const scrollViewRef = useRef<RNScrollView>(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const insets = useSafeAreaInsets();
    const {isKeyboardActive} = useKeyboardState();
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);

    const shouldUseScrollView = shouldUseScrollViewProp || isInLandscapeMode;

    const setAspectRatio = (event: SourceLoadEventPayload) => {
        const track = event.availableVideoTracks.at(0);

        if (!track) {
            return;
        }

        setIllustrationAspectRatio(track.size.width / track.size.height);
    };

    const renderIllustration = () => {
        const aspectRatio = illustrationAspectRatio || VIDEO_ASPECT_RATIO;

        return (
            <View style={[isInLandscapeMode ? styles.h100 : styles.w100, illustrationInnerContainerStyle, (!!videoURL || !!image) && {aspectRatio}]}>
                {!!image &&
                    (shouldRenderSVG ? (
                        <ImageSVG
                            src={image}
                            contentFit={contentFitImage}
                            width={imageWidth}
                            height={imageHeight}
                            testID={CONST.IMAGE_SVG_TEST_ID}
                        />
                    ) : (
                        <Image
                            accessibilityIgnoresInvertColors
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- IconAsset union narrowed by !shouldRenderSVG branch
                            source={image as ImageSourcePropType}
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- ImageContentFit and ImageResizeMode are compatible
                            resizeMode={contentFitImage as ImageResizeMode}
                            style={styles.featureTrainingModalImage}
                            testID={CONST.IMAGE_TEST_ID}
                        />
                    ))}
                {!!videoURL && videoStatus === 'video' && (
                    <GestureHandlerRootView>
                        <VideoPlayer
                            url={videoURL}
                            videoPlayerStyle={[styles.onboardingVideoPlayer, {aspectRatio}]}
                            onSourceLoaded={setAspectRatio}
                            controlsStatus={CONST.VIDEO_PLAYER.CONTROLS_STATUS.HIDE}
                            shouldUseControlsBottomMargin={false}
                            shouldPlay
                            isLooping
                        />
                    </GestureHandlerRootView>
                )}
                {((!videoURL && !image) || (!!videoURL && videoStatus === 'animation')) && (
                    <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, !!videoURL && {aspectRatio}, animationStyle]}>
                        {isReduceMotionEnabled && (animation ?? LottieAnimations.Hands) === LottieAnimations.Hands ? (
                            <ImageSVG
                                src={illustrations.Hands}
                                style={styles.h100}
                            />
                        ) : (
                            <Lottie
                                source={animation ?? LottieAnimations.Hands}
                                style={styles.h100}
                                webStyle={shouldUseNarrowLayout ? styles.h100 : undefined}
                                autoPlay
                                loop
                            />
                        )}
                    </View>
                )}
            </View>
        );
    };

    const toggleWillShowAgain = () => {
        onWillShowAgainChange?.(!willShowAgain);
        setWillShowAgain((prev) => {
            const next = !prev;
            return next;
        });
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
            // eslint-disable-next-line react/forbid-component-props
            fsClass={CONST.FULLSTORY.CLASS.UNMASK}
        >
            <View
                style={[
                    onboardingIsMediumOrLargerScreenWidth ? {padding: CONTENT_PADDING} : {paddingHorizontal: CONTENT_PADDING},
                    illustrationOuterContainerStyle,
                    isInLandscapeMode ? [{maxHeight: windowHeight * LANDSCAPE_ILLUSTRATION_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO}, styles.alignSelfCenter] : undefined,
                ]}
            >
                {renderIllustration()}
            </View>
            <View style={[styles.mt5, styles.mh5, contentOuterContainerStyles]}>
                {!!title && !!description && (
                    <View style={[onboardingIsMediumOrLargerScreenWidth ? [styles.gap1, styles.mb8] : [shouldRenderHTMLDescription ? styles.mb5 : styles.mb10], contentInnerContainerStyles]}>
                        {typeof title === 'string' ? <Text style={[styles.textHeadlineH1, titleStyles]}>{title}</Text> : title}
                        {shouldRenderHTMLDescription ? (
                            <View style={styles.mb2}>
                                <RenderHTML html={description} />
                            </View>
                        ) : (
                            <Text style={styles.textSupporting}>{description}</Text>
                        )}
                        {secondaryDescription.length > 0 && <Text style={[styles.textSupporting, styles.mt4]}>{secondaryDescription}</Text>}
                        {children}
                    </View>
                )}
                {shouldShowDismissModalOption && (
                    <CheckboxWithLabel
                        label={translate('featureTraining.doNotShowAgain')}
                        accessibilityLabel={translate('featureTraining.doNotShowAgain')}
                        style={[styles.mb5]}
                        isChecked={!willShowAgain}
                        onInputChange={toggleWillShowAgain}
                    />
                )}
                {!!helpText && (
                    <Button
                        large
                        style={[styles.mb3]}
                        onPress={() => onHelp?.()}
                        text={helpText}
                        sentryLabel={helpSentryLabel}
                    />
                )}
                <FormAlertWithSubmitButton
                    onSubmit={handleConfirm}
                    isLoading={shouldShowConfirmationLoader}
                    buttonText={confirmText}
                    enabledWhenOffline={canConfirmWhileOffline}
                    sentryLabel={confirmSentryLabel}
                />
                {!canConfirmWhileOffline && <OfflineIndicator />}
            </View>
        </Wrapper>
    );
}

export default FeatureTrainingContent;

export type {FeatureTrainingContentProps};
