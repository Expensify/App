import type {ImageContentFit} from 'expo-image';
import type {SourceLoadEventPayload} from 'expo-video';
import React, {useState} from 'react';
import {Image, View} from 'react-native';
import type {ImageResizeMode, ImageSourcePropType, StyleProp, ViewStyle} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import ImageSVG from '@components/ImageSVG';
import type ImageSVGProps from '@components/ImageSVG/types';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import VideoPlayer from '@components/VideoPlayer';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Accessibility from '@libs/Accessibility';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

// Aspect ratio and height of the video.
// Useful before video loads to reserve space.
const VIDEO_ASPECT_RATIO = 1280 / 960;

const LANDSCAPE_ILLUSTRATION_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO = 0.7;

// Vertical gap between the pagination dots and the bottom edge of the illustration container.
const PAGINATION_DOTS_BOTTOM_OFFSET = 12;

type VideoStatus = 'video' | 'animation';

type FeatureTrainingModalIllustrationProps = {
    /** Animation to show when video is unavailable. Useful when app is offline */
    animation?: DotLottieAnimation;

    /** Additional styles for the animation */
    animationStyle?: StyleProp<ViewStyle>;

    /** URL for the video */
    videoURL?: string;

    /** Expensicon for the page */
    image?: IconAsset;

    /** Determines how the image should be resized to fit its container */
    contentFitImage?: ImageContentFit;

    /** The width of the image */
    imageWidth?: ImageSVGProps['width'];

    /** The height of the image */
    imageHeight?: ImageSVGProps['height'];

    /** The aspect ratio to preserve for the icon, video or animation */
    illustrationAspectRatio?: number;

    /** Style for the inner container of the animation */
    illustrationInnerContainerStyle?: StyleProp<ViewStyle>;

    /** Style for the outer container of the animation */
    illustrationOuterContainerStyle?: StyleProp<ViewStyle>;

    /** Whether the modal image is a SVG */
    shouldRenderSVG?: boolean;

    /** Padding for the modal */
    modalPadding: number;

    /** Pagination dot nodes overlaid on the bottom of the illustration in carousel mode */
    paginationDots?: React.ReactNode;
};

function FeatureTrainingModalIllustration({
    animation,
    animationStyle,
    videoURL,
    image,
    contentFitImage,
    imageWidth,
    imageHeight,
    illustrationAspectRatio: illustrationAspectRatioProp,
    illustrationInnerContainerStyle,
    illustrationOuterContainerStyle,
    shouldRenderSVG = true,
    modalPadding,
    paginationDots,
}: FeatureTrainingModalIllustrationProps) {
    const styles = useThemeStyles();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['Hands']);
    const {onboardingIsMediumOrLargerScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const [illustrationAspectRatio, setIllustrationAspectRatio] = useState(illustrationAspectRatioProp ?? VIDEO_ASPECT_RATIO);
    const {isOffline} = useNetwork();
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);

    // Once we've been online at any point in this mount we keep showing the video, even if the
    // network drops later. The first online tick promotes us out of the offline fallback for good.
    const [hasBeenOnline, setHasBeenOnline] = useState(!isOffline);
    if (!isOffline && !hasBeenOnline) {
        setHasBeenOnline(true);
    }
    const videoStatus: VideoStatus = hasBeenOnline ? 'video' : 'animation';

    const setAspectRatio = (event: SourceLoadEventPayload) => {
        const track = event.availableVideoTracks.at(0);
        if (!track) {
            return;
        }
        setIllustrationAspectRatio(track.size.width / track.size.height);
    };

    const aspectRatio = illustrationAspectRatio || VIDEO_ASPECT_RATIO;

    return (
        <View
            style={[
                onboardingIsMediumOrLargerScreenWidth ? {padding: modalPadding} : {paddingHorizontal: modalPadding},
                illustrationOuterContainerStyle,
                isInLandscapeMode ? [{maxHeight: windowHeight * LANDSCAPE_ILLUSTRATION_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO}, styles.alignSelfCenter] : undefined,
            ]}
        >
            <View
                style={[
                    isInLandscapeMode ? styles.h100 : styles.w100,
                    // Prevent layout jumps by reserving height for the video until it loads.
                    // When videoStatus === 'animation' it preserves the same aspect ratio.
                    illustrationInnerContainerStyle,
                    (!!videoURL || !!image) && {aspectRatio},
                ]}
            >
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
                            source={image as ImageSourcePropType}
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
                {!!paginationDots && (
                    <View
                        pointerEvents="none"
                        style={[styles.pAbsolute, styles.flexRow, styles.justifyContentCenter, styles.w100, styles.l0, styles.r0, {bottom: PAGINATION_DOTS_BOTTOM_OFFSET}]}
                    >
                        {paginationDots}
                    </View>
                )}
            </View>
        </View>
    );
}

export default FeatureTrainingModalIllustration;
