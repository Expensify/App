import type {ImageContentFit} from 'expo-image';
import type {SourceLoadEventPayload} from 'expo-video';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image, InteractionManager, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ImageResizeMode, ImageSourcePropType, LayoutChangeEvent, ScrollView as RNScrollView, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import type {MergeExclusive} from 'type-fest';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import {setNameValuePair} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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

    /** Whether to call onHelp when modal is hidden completely */
    shouldCallOnHelpWhenModalHidden?: boolean;
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
    shouldCallOnHelpWhenModalHidden = false,
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
    const hasHelpButtonBeenPressed = useRef(false);
    const scrollViewRef = useRef<RNScrollView>(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const insets = useSafeAreaInsets();
    const {isKeyboardActive} = useKeyboardState();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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

    const setAspectRatio = (event: SourceLoadEventPayload) => {
        const track = event.availableVideoTracks.at(0);

        if (!track) {
            return;
        }

        setIllustrationAspectRatio(track.size.width / track.size.height);
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
        Log.hmmm(`[FeatureTrainingModal] closeModal called - willShowAgain: ${willShowAgain}, shouldGoBack: ${shouldGoBack}, hasOnClose: ${!!onClose}`);

        if (!willShowAgain) {
            Log.hmmm('[FeatureTrainingModal] Dismissing track training modal');
            setNameValuePair(ONYXKEYS.NVP_HAS_SEEN_TRACK_TRAINING, true, false);
        }

        Log.hmmm('[FeatureTrainingModal] Setting modal invisible');
        setIsModalVisible(false);

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            Log.hmmm(`[FeatureTrainingModal] Running after interactions - shouldGoBack: ${shouldGoBack}, hasOnClose: ${!!onClose}`);

            if (shouldGoBack) {
                Log.hmmm('[FeatureTrainingModal] Navigating back');
                Navigation.goBack();
            }

            if (onClose) {
                Log.hmmm('[FeatureTrainingModal] Calling onClose callback');
                onClose();
            } else {
                Log.hmmm('[FeatureTrainingModal] No onClose callback provided');
            }
        });
    }, [onClose, shouldGoBack, willShowAgain]);

    const closeAndConfirmModal = useCallback(() => {
        Log.hmmm(`[FeatureTrainingModal] Button pressed - shouldCloseOnConfirm: ${shouldCloseOnConfirm}, hasOnConfirm: ${!!onConfirm}, willShowAgain: ${willShowAgain}`);

        if (shouldCloseOnConfirm) {
            Log.hmmm('[FeatureTrainingModal] Calling closeModal');
            closeModal();
        }

        if (onConfirm) {
            Log.hmmm('[FeatureTrainingModal] Calling onConfirm callback');
            onConfirm(willShowAgain);
        } else {
            Log.hmmm('[FeatureTrainingModal] No onConfirm callback provided');
        }
    }, [shouldCloseOnConfirm, onConfirm, closeModal, willShowAgain]);

    // Scrolls modal to the bottom when keyboard appears so the action buttons are visible.
    useEffect(() => {
        if (contentHeight <= containerHeight || onboardingIsMediumOrLargerScreenWidth || !shouldUseScrollView) {
            return;
        }
        scrollViewRef.current?.scrollToEnd({animated: false});
    }, [contentHeight, containerHeight, onboardingIsMediumOrLargerScreenWidth, shouldUseScrollView]);

    const Wrapper = shouldUseScrollView ? ScrollView : View;

    const wrapperStyles = useMemo(
        () => (shouldUseScrollView ? StyleUtils.getScrollableFeatureTrainingModalStyles(insets, isKeyboardActive) : {}),
        [shouldUseScrollView, StyleUtils, insets, isKeyboardActive],
    );

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
            onModalHide={() => {
                if (!shouldCallOnHelpWhenModalHidden || !hasHelpButtonBeenPressed.current) {
                    return;
                }
                onHelp();
            }}
            shouldDisableBottomSafeAreaPadding={shouldUseScrollView}
        >
            <Wrapper
                scrollsToTop={false}
                style={[styles.mh100, onboardingIsMediumOrLargerScreenWidth && StyleUtils.getWidthStyle(width), wrapperStyles.style]}
                contentContainerStyle={wrapperStyles.containerStyle}
                keyboardShouldPersistTaps={shouldUseScrollView ? 'handled' : undefined}
                ref={shouldUseScrollView ? scrollViewRef : undefined}
                onLayout={shouldUseScrollView ? (e: LayoutChangeEvent) => setContainerHeight(e.nativeEvent.layout.height) : undefined}
                onContentSizeChange={shouldUseScrollView ? (_w: number, h: number) => setContentHeight(h) : undefined}
                // Wrapper is either a View or ScrollView, which is also a View.
                // eslint-disable-next-line react/forbid-component-props
                fsClass={CONST.FULLSTORY.CLASS.UNMASK}
            >
                <View style={[onboardingIsMediumOrLargerScreenWidth ? {padding: MODAL_PADDING} : {paddingHorizontal: MODAL_PADDING}, illustrationOuterContainerStyle]}>
                    {renderIllustration()}
                </View>
                <View style={[styles.mt5, styles.mh5, contentOuterContainerStyles]}>
                    {!!title && !!description && (
                        <View
                            style={[
                                onboardingIsMediumOrLargerScreenWidth ? [styles.gap1, styles.mb8] : [shouldRenderHTMLDescription ? styles.mb5 : styles.mb10],
                                contentInnerContainerStyles,
                            ]}
                        >
                            {typeof title === 'string' ? <Text style={[styles.textHeadlineH1, titleStyles]}>{title}</Text> : title}
                            {shouldRenderHTMLDescription ? (
                                <View style={styles.mb2}>
                                    <RenderHTML html={description} />
                                </View>
                            ) : (
                                <Text style={styles.textSupporting}>{description}</Text>
                            )}
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
                            onPress={() => {
                                if (shouldCallOnHelpWhenModalHidden) {
                                    setIsModalVisible(false);
                                    hasHelpButtonBeenPressed.current = true;
                                    return;
                                }
                                onHelp();
                            }}
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
