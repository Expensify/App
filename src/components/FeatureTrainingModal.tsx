import type {VideoReadyForDisplayEvent} from 'expo-av';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import Button from './Button';
import CheckboxWithLabel from './CheckboxWithLabel';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import type DotLottieAnimation from './LottieAnimations/types';
import Modal from './Modal';
import SafeAreaConsumer from './SafeAreaConsumer';
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

type VideoStatus = 'video' | 'animation';

type FeatureTrainingModalProps = {
    /** Animation to show when video is unavailable. Useful when app is offline */
    animation?: DotLottieAnimation;

    /** URL for the video */
    videoURL: string;

    videoAspectRatio?: number;

    /** Title for the modal */
    title?: string;

    /** Describe what is showing */
    description?: string;

    /** Secondary description rendered with additional space */
    secondaryDescription?: string;

    /** Whether to show `Don't show me this again` option */
    shouldShowDismissModalOption?: boolean;

    /** Text to show on primary button */
    confirmText: string;

    /** A callback to call when user confirms the tutorial */
    onConfirm?: () => void;

    /** Text to show on secondary button */
    helpText?: string;

    /** Link to navigate to when user wants to learn more */
    onHelp?: () => void;
};

function FeatureTrainingModal({
    animation,
    videoURL,
    videoAspectRatio: videoAspectRatioProp,
    title = '',
    description = '',
    secondaryDescription = '',
    shouldShowDismissModalOption = false,
    confirmText = '',
    onConfirm = () => {},
    helpText = '',
    onHelp = () => {},
}: FeatureTrainingModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useOnboardingLayout();
    const [isModalVisible, setIsModalVisible] = useState(true);
    const [willShowAgain, setWillShowAgain] = useState(true);
    const [videoStatus, setVideoStatus] = useState<VideoStatus>('video');
    const [isVideoStatusLocked, setIsVideoStatusLocked] = useState(false);
    const [videoAspectRatio, setVideoAspectRatio] = useState(videoAspectRatioProp ?? VIDEO_ASPECT_RATIO);
    const {isSmallScreenWidth} = useWindowDimensions();
    const {isOffline} = useNetwork();

    useEffect(() => {
        if (isVideoStatusLocked) {
            return;
        }

        if (isOffline) {
            setVideoStatus('animation');
        } else if (!isOffline) {
            setVideoStatus('video');
            setIsVideoStatusLocked(true);
        }
    }, [isOffline, isVideoStatusLocked]);

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

    const renderIllustration = useCallback(() => {
        const aspectRatio = videoAspectRatio || VIDEO_ASPECT_RATIO;

        return (
            <View
                style={[
                    styles.w100,
                    // Prevent layout jumps by reserving height
                    // for the video until it loads. Also, when
                    // videoStatus === 'animation' it will
                    // set the same aspect ratio as the video would.
                    {aspectRatio},
                ]}
            >
                {videoStatus === 'video' ? (
                    <VideoPlayer
                        url={videoURL}
                        videoPlayerStyle={[styles.onboardingVideoPlayer, {aspectRatio}]}
                        onVideoLoaded={setAspectRatio}
                        controlsStatus={CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW}
                        shouldUseControlsBottomMargin={false}
                        shouldPlay
                        isLooping
                    />
                ) : (
                    <View style={[styles.flex1, styles.alignItemsCenter, {aspectRatio}]}>
                        <Lottie
                            source={animation ?? LottieAnimations.Hands}
                            style={styles.h100}
                            webStyle={isSmallScreenWidth ? styles.h100 : undefined}
                            autoPlay
                            loop
                        />
                    </View>
                )}
            </View>
        );
    }, [animation, videoURL, videoAspectRatio, videoStatus, isSmallScreenWidth, styles]);

    const toggleWillShowAgain = useCallback(() => setWillShowAgain((prevWillShowAgain) => !prevWillShowAgain), []);

    const closeModal = useCallback(() => {
        if (!willShowAgain) {
            User.dismissTrackTrainingModal();
        }
        setIsModalVisible(false);
        Navigation.goBack();
    }, [willShowAgain]);

    const closeAndConfirmModal = useCallback(() => {
        closeModal();
        onConfirm?.();
    }, [onConfirm, closeModal]);

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <Modal
                    isVisible={isModalVisible}
                    type={shouldUseNarrowLayout ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE : CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                    onClose={closeModal}
                    innerContainerStyle={{
                        boxShadow: 'none',
                        borderRadius: 16,
                        paddingBottom: 20,
                        paddingTop: shouldUseNarrowLayout ? undefined : MODAL_PADDING,
                        ...(shouldUseNarrowLayout
                            ? // Override styles defined by MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
                              // To make it take as little space as possible.
                              {
                                  flex: undefined,
                                  width: 'auto',
                              }
                            : {}),
                    }}
                >
                    <GestureHandlerRootView>
                        <View style={[styles.mh100, shouldUseNarrowLayout && styles.welcomeVideoNarrowLayout, safeAreaPaddingBottomStyle]}>
                            <View style={shouldUseNarrowLayout ? {padding: MODAL_PADDING} : {paddingHorizontal: MODAL_PADDING}}>{renderIllustration()}</View>
                            <View style={[styles.mt5, styles.mh5]}>
                                {title && description && (
                                    <View style={[shouldUseNarrowLayout ? [styles.gap1, styles.mb8] : [styles.mb10]]}>
                                        <Text style={[styles.textHeadlineH1]}>{title}</Text>
                                        <Text style={styles.textSupporting}>{description}</Text>
                                        {secondaryDescription.length > 0 && <Text style={[styles.textSupporting, styles.mt4]}>{secondaryDescription}</Text>}
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
                                {helpText && (
                                    <Button
                                        large
                                        style={[styles.mb3]}
                                        onPress={onHelp}
                                        text={helpText}
                                    />
                                )}
                                <Button
                                    large
                                    success
                                    pressOnEnter
                                    onPress={closeAndConfirmModal}
                                    text={confirmText}
                                />
                            </View>
                        </View>
                    </GestureHandlerRootView>
                </Modal>
            )}
        </SafeAreaConsumer>
    );
}

export default FeatureTrainingModal;
