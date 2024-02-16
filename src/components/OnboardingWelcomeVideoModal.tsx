import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import Button from './Button';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import Modal from './Modal';
import Text from './Text';
import VideoPlayer from './VideoPlayer';

const BASE_VIDEO_WIDTH = 640;
const BASE_VIDEO_ASPECT_RATIO = 2;

const MODAL_PADDING = 16;

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

function OnboardingWelcomeVideoModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth, windowHeight, windowWidth} = useWindowDimensions();
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [welcomeVideoStatus, setWelcomeVideoStatus] = useState<VideoStatus>('video');
    const [isWelcomeVideoStatusLocked, setIsWelcomeVideoStatusLocked] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [videoAspectRatio, setVideoAspectRatio] = useState(BASE_VIDEO_ASPECT_RATIO);
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

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const onVideoLoaded = (e: VideoLoadedEventType) => {
        setVideoAspectRatio(e.srcElement.videoWidth / e.srcElement.videoHeight);
    };

    const onPlaybackStatusUpdate = (e: VideoPlaybackStatusEventType) => {
        if (e.isLoaded === isVideoLoaded) {
            return;
        }
        setIsVideoLoaded(e.isLoaded);
    };

    const getWelcomeVideo = () => {
        if (welcomeVideoStatus === 'video') {
            let videoWidth = isSmallScreenWidth ? windowWidth - MODAL_PADDING : BASE_VIDEO_WIDTH;

            if (!videoWidth) {
                videoWidth = BASE_VIDEO_WIDTH;
            }

            // Temporary file supplied for testing purposes, to be changed when correct one gets uploaded on backend
            return (
                <View style={[styles.pRelative, styles.onboardingVideoContainer]}>
                    <VideoPlayer
                        url="https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4"
                        videoPlayerStyle={[styles.onboardingVideoPlayer, {width: videoWidth, height: videoWidth / videoAspectRatio}]}
                        onVideoLoaded={onVideoLoaded}
                        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                        shouldShowProgressVolumeOnly
                        shouldPlay
                        isLooping
                    />
                </View>
            );
        }
        return (
            <View style={[styles.onboardingVideoContainer]}>
                <Lottie
                    source={LottieAnimations.Hands}
                    style={styles.w100}
                    webStyle={isSmallScreenWidth ? styles.h100 : styles.w100}
                    autoPlay
                    loop
                />
            </View>
        );
    };

    return (
        <Modal
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CENTERED_SMALL}
            isVisible={isModalOpen}
            onClose={closeModal}
            innerContainerStyle={styles.pt0}
            fullscreen
        >
            <View style={{maxHeight: windowHeight}}>
                <View style={[styles.w100, styles.p2, styles.pb5]}>
                    {getWelcomeVideo()}
                    <View style={[styles.pt5, isSmallScreenWidth ? styles.ph3 : styles.ph6]}>
                        <Text style={[styles.textHeadline]}>{translate('onboarding.welcomeVideo.title')}</Text>
                        <Text style={[styles.textSupporting, styles.pb8]}>{translate('onboarding.welcomeVideo.description')}</Text>
                        <Button
                            success
                            pressOnEnter
                            onPress={closeModal}
                            text={translate('onboarding.welcomeVideo.button')}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

OnboardingWelcomeVideoModal.displayName = 'OnboardingWelcomeVideoModal';

export default OnboardingWelcomeVideoModal;
