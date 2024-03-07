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
import CONST from '@src/CONST';
import Button from './Button';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import Modal from './Modal';
import Text from './Text';
import VideoPlayer from './VideoPlayer';

// Aspect ratio and height of the video.
// Useful before video loads to reserve space.
const VIDEO_ASPECT_RATIO = 1280 / 960;

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
    const [isModalVisible, setIsModalVisible] = useState(true);
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
        } else if (!isOffline && isVideoLoaded) {
            setWelcomeVideoStatus('video');
            setIsWelcomeVideoStatusLocked(true);
        }
    }, [isOffline, isVideoLoaded, isWelcomeVideoStatusLocked]);

    const storeContainerDimensions = (event: LayoutChangeEvent) => {
        containerDimensions.current = event.nativeEvent.layout;
    };

    const closeModal = useCallback(() => {
        setIsModalVisible(false);
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
        // When container didn't even mount and set it's dimensions,
        // don't bother rendering the video player.
        if (!containerDimensions.current) {
            return;
        }

        const videoWidth = containerDimensions.current.width - 2 * MODAL_PADDING;

        return (
            <View
                style={[
                    // Prevent layout jumps by reserving height
                    // for the video until it loads. Also, when
                    // welcomeVideoStatus === 'animation' it will
                    // set as much height as the video would.
                    {height: videoWidth / videoAspectRatio},
                ]}
            >
                {welcomeVideoStatus === 'video' ? (
                    <VideoPlayer
                        url={CONST.WELCOME_VIDEO_URL}
                        videoPlayerStyle={[styles.onboardingVideoPlayer, {width: videoWidth, height: videoWidth / videoAspectRatio}]}
                        onVideoLoaded={setAspectRatio}
                        onPlaybackStatusUpdate={setVideoStatus}
                        shouldShowProgressVolumeOnly
                        shouldPlay
                        isLooping
                    />
                ) : (
                    <Lottie
                        source={LottieAnimations.Hands}
                        style={styles.w100}
                        webStyle={isSmallScreenWidth ? styles.h100 : styles.w100}
                        autoPlay
                        loop
                    />
                )}
            </View>
        );
    };

    return (
        <Modal
            isVisible={isModalVisible}
            type={shouldUseNarrowLayout ? CONST.MODAL.MODAL_TYPE.CENTERED_SMALL : CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            onClose={closeModal}
            innerContainerStyle={shouldUseNarrowLayout ? undefined : {paddingTop: MODAL_PADDING, paddingBottom: MODAL_PADDING}}
        >
            <View
                style={[styles.mh100, shouldUseNarrowLayout && styles.welcomeVideoNarrowLayout]}
                onLayout={storeContainerDimensions}
            >
                <View style={shouldUseNarrowLayout ? {padding: MODAL_PADDING} : {paddingHorizontal: MODAL_PADDING}}>{getWelcomeVideo()}</View>
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
        </Modal>
    );
}

OnboardingWelcomeVideo.displayName = 'OnboardingWelcomeVideo';

export default OnboardingWelcomeVideo;
