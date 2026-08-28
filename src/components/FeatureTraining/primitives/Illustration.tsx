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
import {isMobile} from '@libs/Browser';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import {getIsOffline} from '@libs/NetworkState';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ImageContentFit} from 'expo-image';
import type {SourceLoadEventPayload} from 'expo-video';
import type LottieView from 'lottie-react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import type {MergeExclusive} from 'type-fest';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const VIDEO_ASPECT_RATIO = 1280 / 960;
const CONTENT_PADDING = variables.spacing2;
const LANDSCAPE_ILLUSTRATION_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO = 0.7;

type VideoStatus = 'video' | 'animation';

type VideoOrAnimationProps = {
    animation?: DotLottieAnimation;
    animationStyle?: StyleProp<ViewStyle>;
    videoURL?: string;
};

type ImageProps = {
    image: IconAsset;
    contentFitImage?: ImageContentFit;
    imageWidth?: ImageSVGProps['width'];
    imageHeight?: ImageSVGProps['height'];
};

type IllustrationMediaProps = MergeExclusive<VideoOrAnimationProps, ImageProps>;

type IllustrationProps = IllustrationMediaProps & {
    aspectRatio?: number;
    innerContainerStyle?: StyleProp<ViewStyle>;
    outerContainerStyle?: StyleProp<ViewStyle>;

    /**
     * Whether this illustration is the currently-focused page in a carousel. Injected by FeatureTraining.Carousel
     * via cloneElement — consumers should not set this directly. Defaults to true (always play) for single-page use.
     */
    isFocused?: boolean;
};

function useVideoStatus(): VideoStatus {
    const [isLockedToVideo, setIsLockedToVideo] = useState(() => !getIsOffline());
    const {isOffline} = useNetwork({
        onReconnect: () => setIsLockedToVideo(true),
    });
    return isLockedToVideo || !isOffline ? 'video' : 'animation';
}

function Illustration({
    animation,
    animationStyle,
    videoURL,
    image,
    contentFitImage,
    imageWidth,
    imageHeight,
    aspectRatio: aspectRatioProp,
    innerContainerStyle,
    outerContainerStyle,
    isFocused = true,
}: IllustrationProps) {
    const styles = useThemeStyles();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['Hands']);
    const {onboardingIsMediumOrLargerScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const videoStatus = useVideoStatus();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const [measuredAspectRatio, setMeasuredAspectRatio] = useState(aspectRatioProp ?? VIDEO_ASPECT_RATIO);
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);

    const animationRef = useRef<LottieView | null>(null);
    useEffect(() => {
        if (isMobile() || !animationRef.current || isReduceMotionEnabled) {
            return;
        }
        if (isFocused) {
            animationRef.current.play();
        } else {
            animationRef.current.pause();
        }
    }, [isFocused, isReduceMotionEnabled]);

    const setAspectRatio = (event: SourceLoadEventPayload) => {
        const track = event.availableVideoTracks.at(0);
        if (!track) {
            return;
        }
        setMeasuredAspectRatio(track.size.width / track.size.height);
    };

    const aspectRatio = measuredAspectRatio || VIDEO_ASPECT_RATIO;

    return (
        <View
            style={[
                onboardingIsMediumOrLargerScreenWidth ? {padding: CONTENT_PADDING} : {paddingHorizontal: CONTENT_PADDING},
                outerContainerStyle,
                isInLandscapeMode ? [{maxHeight: windowHeight * LANDSCAPE_ILLUSTRATION_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO}, styles.alignSelfCenter] : undefined,
            ]}
        >
            <View style={[isInLandscapeMode ? styles.h100 : styles.w100, innerContainerStyle, (!!videoURL || !!image || (!!animation && !!aspectRatioProp)) && {aspectRatio}]}>
                {!!image && (
                    <ImageSVG
                        src={image}
                        contentFit={contentFitImage}
                        width={imageWidth}
                        height={imageHeight}
                        testID={CONST.IMAGE_SVG_TEST_ID}
                    />
                )}
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
                                autoPlay={isMobile() || isFocused}
                                loop
                            />
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

Illustration.displayName = 'FeatureTraining.Illustration';

export default Illustration;
export type {IllustrationProps};
