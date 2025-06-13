import type {VideoReadyForDisplayEvent} from 'expo-av';
import type {ImageContentFit} from 'expo-image';
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {Image, InteractionManager, View} from 'react-native';
import type {ImageResizeMode, ImageSourcePropType, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import type {MergeExclusive} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {parseFSAttributes} from '@libs/Fullstory';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import {dismissTrackTrainingModal} from '@userActions/User';
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
import Modal from './Modal';
import OfflineIndicator from './OfflineIndicator';
import RenderHTML from './RenderHTML';
import ScrollView from './ScrollView';
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

type BaseFeatureTrainingModalProps = {
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

    /** A callback to call when user confirms the tutorial */
    onConfirm?: (willShowAgain: boolean) => void;

    /** A callback to call when modal closes */
    onClose?: () => void;

    /** Text to show on secondary button */
    helpText?: string;

    /** Link to navigate to when user wants to learn more */
    onHelp?: () => void;

    /** Styles for the content container */
    contentInnerContainerStyles?: StyleProp<ViewStyle>;

    /** Styles for the content outer container */
    contentOuterContainerStyles?: StyleProp<ViewStyle>;

    /** Styles for the modal inner container */
    modalInnerContainerStyle?: ViewStyle;

    /** Children to show below title and description and above buttons */
    children?: React.ReactNode;

    /** Modal width */
    width?: number;

    /** Whether to disable the modal */
    isModalDisabled?: boolean;

    /** Whether the modal image is a SVG */
    shouldRenderSVG?: boolean;

    /** Whether the modal description is written in HTML */
    shouldRenderHTMLDescription?: boolean;

    /** Whether the modal will be closed on confirm */
    shouldCloseOnConfirm?: boolean;

    /** Whether the modal should avoid the keyboard */
    avoidKeyboard?: boolean;

    /** Whether the modal content is scrollable */
    shouldUseScrollView?: boolean;

    /** Whether the modal is displaying a confirmation loading spinner (useful when fetching data from API during confirmation) */
    shouldShowConfirmationLoader?: boolean;

    /** Whether the user can confirm the tutorial while offline */
    canConfirmWhileOffline?: boolean;

    /** Whether to navigate back when closing the modal */
    shouldGoBack?: boolean;
};

type FeatureTrainingModalVideoProps = {
    /** Animation to show when video is unavailable. Useful when app is offline */
    animation?: DotLottieAnimation;

    /** Additional styles for the animation */
    animationStyle?: StyleProp<ViewStyle>;

    /** URL for the video */
    videoURL?: string;
};

type FeatureTrainingModalSVGProps = {
    /** Expensicon for the page */
    image: IconAsset;

    /** Determines how the image should be resized to fit its container */
    contentFitImage?: ImageContentFit;

    /** The width of the image */
    imageWidth?: ImageSVGProps['width'];

    /** The height of the image */
    imageHeight?: ImageSVGProps['height'];
};

// This page requires either an icon or a video/animation, but not both
type FeatureTrainingModalProps = BaseFeatureTrainingModalProps & MergeExclusive<FeatureTrainingModalVideoProps, FeatureTrainingModalSVGProps>;

function FeatureTrainingModal({
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
    onConfirm = () => {},
    onClose = () => {},
    helpText = '',
    onHelp = () => {},
    children,
    contentInnerContainerStyles,
    contentOuterContainerStyles,
    modalInnerContainerStyle,
    imageWidth,
    imageHeight,
    isModalDisabled = true,
    shouldRenderSVG = true,
    shouldRenderHTMLDescription = false,
    shouldCloseOnConfirm = true,
    avoidKeyboard = false,
    shouldUseScrollView = false,
    shouldShowConfirmationLoader = false,
    canConfirmWhileOffline = true,
    shouldGoBack = true,
}: FeatureTrainingModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [willShowAgain, setWillShowAgain] = useState(true);
    const [videoStatus, setVideoStatus] = useState<VideoStatus>('video');
    const [isVideoStatusLocked, setIsVideoStatusLocked] = useState(false);
    const [illustrationAspectRatio, setIllustrationAspectRatio] = useState(illustrationAspectRatioProp ?? VIDEO_ASPECT_RATIO);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            if (!isModalDisabled) {
                setIsModalVisible(false);
                return;
            }
            setIsModalVisible(true);
        });
    }, [isModalDisabled]);

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
            setIllustrationAspectRatio(event.naturalSize.width / event.naturalSize.height);
        } else {
            setIllustrationAspectRatio(event.srcElement.videoWidth / event.srcElement.videoHeight);
        }
    };

    const renderIllustration = useCallback(() => {
        const aspectRatio = illustrationAspectRatio || VIDEO_ASPECT_RATIO;

        return (
            <View
                style={[
                    styles.w100,
                    // Prevent layout jumps by reserving height
                    // for the video until it loads. Also, when
                    // videoStatus === 'animation' it will
                    // set the same aspect ratio as the video would.
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
                            onVideoLoaded={setAspectRatio}
                            controlsStatus={CONST.VIDEO_PLAYER.CONTROLS_STATUS.HIDE}
                            shouldUseControlsBottomMargin={false}
                            shouldPlay
                            isLooping
                        />
                    </GestureHandlerRootView>
                )}
                {((!videoURL && !image) || (!!videoURL && videoStatus === 'animation')) && (
                    <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, !!videoURL && {aspectRatio}, animationStyle]}>
                        <Lottie
                            source={animation ?? LottieAnimations.Hands}
                            style={styles.h100}
                            webStyle={shouldUseNarrowLayout ? styles.h100 : undefined}
                            autoPlay
                            loop
                        />
                    </View>
                )}
            </View>
        );
    }, [
        illustrationAspectRatio,
        styles.w100,
        styles.featureTrainingModalImage,
        styles.onboardingVideoPlayer,
        styles.flex1,
        styles.alignItemsCenter,
        styles.justifyContentCenter,
        styles.h100,
        illustrationInnerContainerStyle,
        videoURL,
        image,
        shouldRenderSVG,
        contentFitImage,
        imageWidth,
        imageHeight,
        videoStatus,
        animationStyle,
        animation,
        shouldUseNarrowLayout,
    ]);

    const toggleWillShowAgain = useCallback(() => setWillShowAgain((prevWillShowAgain) => !prevWillShowAgain), []);

    const closeModal = useCallback(() => {
        if (!willShowAgain) {
            dismissTrackTrainingModal();
        }
        setIsModalVisible(false);
        InteractionManager.runAfterInteractions(() => {
            if (shouldGoBack) {
                Navigation.goBack();
            }
            onClose?.();
        });
    }, [onClose, shouldGoBack, willShowAgain]);

    const closeAndConfirmModal = useCallback(() => {
        if (shouldCloseOnConfirm) {
            closeModal();
        }
        onConfirm?.(willShowAgain);
    }, [shouldCloseOnConfirm, onConfirm, closeModal, willShowAgain]);

    /**
     * Extracts values from the non-scraped attribute WEB_PROP_ATTR at build time
     * to ensure necessary properties are available for further processing.
     * Reevaluates "fs-class" to dynamically apply styles or behavior based on
     * updated attribute values.
     */
    useLayoutEffect(parseFSAttributes, []);

    const Wrapper = shouldUseScrollView ? ScrollView : View;

    return (
        <Modal
            avoidKeyboard={avoidKeyboard}
            isVisible={isModalVisible}
            type={onboardingIsMediumOrLargerScreenWidth ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE : CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            onClose={closeModal}
            innerContainerStyle={{
                boxShadow: 'none',
                ...(shouldUseScrollView ? styles.pb0 : styles.pb5),
                paddingTop: onboardingIsMediumOrLargerScreenWidth ? undefined : MODAL_PADDING,
                ...(onboardingIsMediumOrLargerScreenWidth
                    ? // Override styles defined by MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
                      // To make it take as little space as possible.
                      {
                          flex: undefined,
                          width: 'auto',
                      }
                    : {}),
                ...modalInnerContainerStyle,
            }}
        >
            <Wrapper
                style={[styles.mh100, onboardingIsMediumOrLargerScreenWidth && StyleUtils.getWidthStyle(width)]}
                contentContainerStyle={shouldUseScrollView ? styles.pb5 : undefined}
                keyboardShouldPersistTaps={shouldUseScrollView ? 'handled' : undefined}
                fsClass={CONST.FULL_STORY.UNMASK}
                testID={CONST.FULL_STORY.UNMASK}
            >
                <View style={[onboardingIsMediumOrLargerScreenWidth ? {padding: MODAL_PADDING} : {paddingHorizontal: MODAL_PADDING}, illustrationOuterContainerStyle]}>
                    {renderIllustration()}
                </View>
                <View style={[styles.mt5, styles.mh5, contentOuterContainerStyles]}>
                    {!!title && !!description && (
                        <View style={[onboardingIsMediumOrLargerScreenWidth ? [styles.gap1, styles.mb8] : [styles.mb10], contentInnerContainerStyles]}>
                            {typeof title === 'string' ? <Text style={[styles.textHeadlineH1, titleStyles]}>{title}</Text> : title}
                            {shouldRenderHTMLDescription ? <RenderHTML html={description} /> : <Text style={styles.textSupporting}>{description}</Text>}
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
                            onPress={onHelp}
                            text={helpText}
                        />
                    )}
                    <FormAlertWithSubmitButton
                        onSubmit={closeAndConfirmModal}
                        isLoading={shouldShowConfirmationLoader}
                        buttonText={confirmText}
                        enabledWhenOffline={canConfirmWhileOffline}
                    />
                    {!canConfirmWhileOffline && <OfflineIndicator />}
                </View>
            </Wrapper>
        </Modal>
    );
}

export default FeatureTrainingModal;

export type {FeatureTrainingModalProps};
