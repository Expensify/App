import type {VideoReadyForDisplayEvent} from 'expo-av';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {LayoutChangeEvent, LayoutRectangle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import Button from './Button';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import Text from './Text';
import VideoPlayer from './VideoPlayer';

// Aspect ratio and height of the video.
// Useful before video loads to reserve space.
const VIDEO_ASPECT_RATIO = 484 / 272.25;
const VIDEO_HEIGHT = 320;

const MODAL_PADDING = variables.spacing2;

type VideoLoadedEventType = {
    srcElement: {
        videoWidth: number;
        videoHeight: number;
    };
};

type VideoPlaybackStatusEventType = {
    isLoaded: boolean;
};

type VideoStatus = 'video' | 'animation';

function OnboardingWelcomeVideo() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const containerDimensions = useRef<LayoutRectangle>({width: 0, height: 0, x: 0, y: 0});
    const {isSmallScreenWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useOnboardingLayout();
    const [welcomeVideoStatus, setWelcomeVideoStatus] = useState<VideoStatus>('video');
    const [isWelcomeVideoStatusLocked, setIsWelcomeVideoStatusLocked] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [videoAspectRatio, setVideoAspectRatio] = useState(VIDEO_ASPECT_RATIO);
    const {isOffline} = useNetwork();

    useEffect(() => {
        if (isWelcomeVideoStatusLocked) {
            return;
        }

        if (isOffline) {
            setWelcomeVideoStatus('animation');
            setIsWelcomeVideoStatusLocked(true);
        } else if (!isOffline && isVideoLoaded) {
            setWelcomeVideoStatus('video');
            setIsWelcomeVideoStatusLocked(true);
        }
    }, [isOffline, isVideoLoaded, isWelcomeVideoStatusLocked]);

    const storeContainerDimensions = (event: LayoutChangeEvent) => {
        containerDimensions.current = event.nativeEvent.layout;
    };

    const closeModal = useCallback(() => {
        Navigation.goBack();
    }, []);

    const setAspectRatio = (e: VideoReadyForDisplayEvent | VideoLoadedEventType | undefined) => {
        if (!e) {
            return;
        }

        // TODO: Figure out why on mobile there's e.naturalSize and on web it's e.srcElement
        if ('naturalSize' in e) {
            setVideoAspectRatio(e.naturalSize.width / e.naturalSize.height);
        } else {
            setVideoAspectRatio(e.srcElement.videoWidth / e.srcElement.videoHeight);
        }
    };

    const setVideoStatus = (e: VideoPlaybackStatusEventType) => {
        setIsVideoLoaded(e.isLoaded);
    };

    const getWelcomeVideo = () => {
        if (welcomeVideoStatus === 'video') {
            const videoWidth = containerDimensions.current.width - 2 * MODAL_PADDING;

            return (
                <View
                    style={[
                        styles.w100,
                        // Prevent layout jumps by reserving height for the video
                        {height: VIDEO_HEIGHT - 2 * MODAL_PADDING},
                    ]}
                >
                    <VideoPlayer
                        // Temporary file supplied for testing purposes, to
                        // be changed when correct one gets uploaded on backend
                        url="https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4"
                        videoPlayerStyle={[styles.onboardingVideoPlayer, {width: videoWidth, height: videoWidth / videoAspectRatio}]}
                        onVideoLoaded={setAspectRatio}
                        onPlaybackStatusUpdate={setVideoStatus}
                        shouldShowProgressVolumeOnly
                        shouldPlay
                        isLooping
                    />
                </View>
            );
        }

        return (
            <Lottie
                source={LottieAnimations.Hands}
                style={styles.w100}
                webStyle={isSmallScreenWidth ? styles.h100 : styles.w100}
                autoPlay
                loop
            />
        );
    };

    return (
        <View
            style={styles.defaultModalContainer}
            onLayout={storeContainerDimensions}
        >
            <View style={{padding: MODAL_PADDING}}>{getWelcomeVideo()}</View>
            <View style={[shouldUseNarrowLayout ? [styles.mt5, styles.mh8] : [styles.mt3, styles.mh5]]}>
                <View style={[shouldUseNarrowLayout ? [styles.gap1, styles.mb8] : [styles.gap2, styles.mb10]]}>
                    <Text style={styles.textHeroSmall}>{translate('onboarding.welcomeVideo.title')}</Text>
                    <Text style={styles.textSupporting}>{translate('onboarding.welcomeVideo.description')}</Text>
                </View>
                <Button
                    success
                    pressOnEnter
                    onPress={closeModal}
                    text={translate('onboarding.welcomeVideo.button')}
                />
            </View>
        </View>
    );
}

OnboardingWelcomeVideo.displayName = 'OnboardingWelcomeVideo';

export default OnboardingWelcomeVideo;
