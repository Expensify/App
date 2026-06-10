import type {SourceLoadEventPayload} from 'expo-video';
import type LottieView from 'lottie-react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Image, View} from 'react-native';
import type {ImageResizeMode, ImageSourcePropType} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import ImageSVG from '@components/ImageSVG';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import VideoPlayer from '@components/VideoPlayer';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Accessibility from '@libs/Accessibility';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import CONST from '@src/CONST';
import type {FeatureTrainingModalIllustrationProps as BaseFeatureTrainingModalIllustrationProps, BaseFeatureTrainingModalProps} from './index';

// Aspect ratio and height of the video.
// Useful before video loads to reserve space.
const VIDEO_ASPECT_RATIO = 1280 / 960;

const LANDSCAPE_ILLUSTRATION_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO = 0.7;

type VideoStatus = 'video' | 'animation';

type FeatureTrainingModalIllustrationProps = Pick<
    BaseFeatureTrainingModalProps,
    'shouldRenderSVG' | 'illustrationAspectRatio' | 'illustrationInnerContainerStyle' | 'illustrationOuterContainerStyle'
> &
    BaseFeatureTrainingModalIllustrationProps & {
        /** Padding for the modal */
        modalPadding: number;

        /** Whether this illustration belongs to the currently-visible carousel page */
        isFocused?: boolean;

        /** Whether this illustration is part of a carousel */
        isCarousel?: boolean;
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
    isFocused = true,
    isCarousel = false,
}: FeatureTrainingModalIllustrationProps) {
    const styles = useThemeStyles();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['Hands']);
    const {onboardingIsMediumOrLargerScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const [illustrationAspectRatio, setIllustrationAspectRatio] = useState(illustrationAspectRatioProp ?? VIDEO_ASPECT_RATIO);
    const {isOffline} = useNetwork();
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);

    const animationRef = useRef<LottieView | null>(null);
    useEffect(() => {
        if (!isCarousel || !animationRef.current || isReduceMotionEnabled) {
            return;
        }
        if (isFocused) {
            animationRef.current.play(0);
        } else {
            animationRef.current.reset();
        }
    }, [isFocused, isCarousel, isReduceMotionEnabled]);

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
                    (!!videoURL || !!image || !!animation) && {aspectRatio},
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
                            source={image as unknown as ImageSourcePropType}
                            resizeMode={contentFitImage as unknown as ImageResizeMode}
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
                                ref={animationRef}
                                source={animation ?? LottieAnimations.Hands}
                                style={styles.h100}
                                webStyle={shouldUseNarrowLayout ? styles.h100 : undefined}
                                autoPlay={isFocused}
                                loop
                            />
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

export default FeatureTrainingModalIllustration;
