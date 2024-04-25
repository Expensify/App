import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import FeatureTrainingModal from './FeatureTrainingModal';

function OnboardingWelcomeVideo() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isModalVisible, setIsModalVisible] = useState(true);
    const {shouldUseNarrowLayout} = useOnboardingLayout();
    const [welcomeVideoStatus, setWelcomeVideoStatus] = useState<VideoStatus>('video');
    const [isWelcomeVideoStatusLocked, setIsWelcomeVideoStatusLocked] = useState(false);
    const [videoAspectRatio, setVideoAspectRatio] = useState(VIDEO_ASPECT_RATIO);
    const {isSmallScreenWidth} = useResponsiveLayout();
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

    const closeModal = useCallback(() => {
        setIsModalVisible(false);
        Navigation.goBack();
    }, []);

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

    const getWelcomeVideo = () => {
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
    };

    return (
        <FeatureTrainingModal
            title={translate('onboarding.welcomeVideo.title')}
            description={translate('onboarding.welcomeVideo.description')}
            confirmText={translate('footer.getStarted')}
            videoURL={CONST.WELCOME_VIDEO_URL}
        />
    );
}

OnboardingWelcomeVideo.displayName = 'OnboardingWelcomeVideo';

export default OnboardingWelcomeVideo;
