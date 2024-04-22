import type {VideoReadyForDisplayEvent} from 'expo-av';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import FeatureTrainingModal from './FeatureTrainingModal';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import VideoPlayer from './VideoPlayer';

// Aspect ratio and height of the video.
// Useful before video loads to reserve space.
const VIDEO_ASPECT_RATIO = 1280 / 960;

type VideoLoadedEventType = {
    srcElement: {
        videoWidth: number;
        videoHeight: number;
    };
};

type VideoStatus = 'video' | 'animation';

function OnboardingWelcomeVideo() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [welcomeVideoStatus, setWelcomeVideoStatus] = useState<VideoStatus>('video');
    const [isWelcomeVideoStatusLocked, setIsWelcomeVideoStatusLocked] = useState(false);
    const [videoAspectRatio, setVideoAspectRatio] = useState(VIDEO_ASPECT_RATIO);
    const {isSmallScreenWidth} = useWindowDimensions();
    const {isOffline} = useNetwork();

    useEffect(() => {
        if (isWelcomeVideoStatusLocked) {
            return;
        }

        if (isOffline) {
            setWelcomeVideoStatus('animation');
        } else if (!isOffline) {
            setWelcomeVideoStatus('video');
            setIsWelcomeVideoStatusLocked(true);
        }
    }, [isOffline, isWelcomeVideoStatusLocked]);

    const setAspectRatio = (event: VideoReadyForDisplayEvent | VideoLoadedEventType | undefined) => {
        if (!event) {
            return;
        }

        if ('naturalSize' in event) {
            setVideoAspectRatio(event.naturalSize.width / event.naturalSize.height);
        } else {
            setVideoAspectRatio(event.srcElement.videoWidth / event.srcElement.videoHeight);
        }
    };

    const getWelcomeVideo = useCallback(() => {
        const aspectRatio = videoAspectRatio || VIDEO_ASPECT_RATIO;

        return (
            <View
                style={[
                    styles.w100,
                    // Prevent layout jumps by reserving height
                    // for the video until it loads. Also, when
                    // welcomeVideoStatus === 'animation' it will
                    // set the same aspect ratio as the video would.
                    {aspectRatio},
                ]}
            >
                {welcomeVideoStatus === 'video' ? (
                    <VideoPlayer
                        url={CONST.WELCOME_VIDEO_URL}
                        videoPlayerStyle={[styles.onboardingVideoPlayer, {aspectRatio}]}
                        onVideoLoaded={setAspectRatio}
                        controlsStatus={CONST.VIDEO_PLAYER.CONTROLS_STATUS.VOLUME_ONLY}
                        shouldUseControlsBottomMargin={false}
                        shouldPlay
                        isLooping
                    />
                ) : (
                    <View style={[styles.flex1, styles.alignItemsCenter, {aspectRatio}]}>
                        <Lottie
                            source={LottieAnimations.Hands}
                            style={styles.h100}
                            webStyle={isSmallScreenWidth ? styles.h100 : undefined}
                            autoPlay
                            loop
                        />
                    </View>
                )}
            </View>
        );
    }, [videoAspectRatio, welcomeVideoStatus, isSmallScreenWidth, styles]);

    return (
        <FeatureTrainingModal
            title={translate('onboarding.welcomeVideo.title')}
            description={translate('onboarding.welcomeVideo.description')}
            renderIllustration={getWelcomeVideo}
            confirmText={translate('onboarding.welcomeVideo.button')}
        />
    );
}

OnboardingWelcomeVideo.displayName = 'OnboardingWelcomeVideo';

export default OnboardingWelcomeVideo;
