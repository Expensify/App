import type {SourceLoadEventPayload} from 'expo-video';
import React, {useState} from 'react';
import {Image, View} from 'react-native';
import type {ImageResizeMode, ImageSourcePropType} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Button from '@components/Button';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import ImageSVG from '@components/ImageSVG';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import OfflineIndicator from '@components/OfflineIndicator';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import VideoPlayer from '@components/VideoPlayer';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Accessibility from '@libs/Accessibility';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import CONST from '@src/CONST';
import type {BaseFeatureTrainingModalProps, FeatureTrainingModalPageProps} from './index';

// Aspect ratio and height of the video.
// Useful before video loads to reserve space.
const VIDEO_ASPECT_RATIO = 1280 / 960;

type VideoStatus = 'video' | 'animation';

const LANDSCAPE_ILLUSTRATION_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO = 0.7;

type FeatureTrainingModalBodyProps = BaseFeatureTrainingModalProps &
    FeatureTrainingModalPageProps & {
        /** Padding for the modal */
        modalPadding: number;

        /** Whether the modal should be shown again */
        willShowAgain: boolean;

        /** A callback to call when the modal should be shown again */
        toggleWillShowAgain: () => void;

        /** A callback to call when we want to close the modal */
        closeModal: (didPressHelpButton?: boolean) => void;

        /** A callback to call when we want to close the modal and confirm */
        confirmModal: () => void;

        /** Whether to show the back button to navigate back to the previous page in carousel mode */
        shouldShowBackButton?: boolean;

        /** A callback to call when we want to navigate back to the previous page in carousel mode */
        onBack?: () => void;

        /** Pagination dot nodes overlaid on the bottom of the illustration in carousel mode */
        paginationDots?: React.ReactNode;
    };

function FeatureTrainingModalBody({
    animation,
    animationStyle,
    illustrationInnerContainerStyle,
    illustrationOuterContainerStyle,
    videoURL,
    illustrationAspectRatio: illustrationAspectRatioProp,
    image,
    contentFitImage,
    width,
    title = '',
    subtitle = '',
    description = '',
    secondaryDescription = '',
    titleStyles,
    shouldShowDismissModalOption = false,
    confirmText = '',
    helpText = '',
    onHelp = () => {},
    children,
    contentInnerContainerStyles,
    contentOuterContainerStyles,
    imageWidth,
    imageHeight,
    shouldRenderSVG = true,
    shouldRenderHTMLDescription = false,
    shouldShowConfirmationLoader = false,
    canConfirmWhileOffline = true,
    shouldCallOnHelpWhenModalHidden = false,
    helpSentryLabel,
    confirmSentryLabel,
    modalPadding,
    willShowAgain = true,
    toggleWillShowAgain,
    closeModal,
    confirmModal,
    shouldShowBackButton = false,
    onBack,
    paginationDots,
}: FeatureTrainingModalBodyProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['Hands']);
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const [illustrationAspectRatio, setIllustrationAspectRatio] = useState(illustrationAspectRatioProp ?? VIDEO_ASPECT_RATIO);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);

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

    const renderIllustration = () => {
        const aspectRatio = illustrationAspectRatio || VIDEO_ASPECT_RATIO;

        return (
            <View
                style={[
                    isInLandscapeMode ? styles.h100 : styles.w100,
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
                            accessibilityIgnoresInvertColors
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
                        {isReduceMotionEnabled && (animation ?? LottieAnimations.Hands) === LottieAnimations.Hands ? (
                            <ImageSVG
                                src={illustrations.Hands}
                                style={styles.h100}
                            />
                        ) : (
                            <Lottie
                                source={animation ?? LottieAnimations.Hands}
                                style={styles.h100}
                                webStyle={shouldUseNarrowLayout ? styles.h100 : undefined}
                                autoPlay
                                loop
                            />
                        )}
                    </View>
                )}
                {!!paginationDots && (
                    <View
                        pointerEvents="none"
                        style={[styles.pAbsolute, styles.flexRow, styles.justifyContentCenter, styles.w100, styles.l0, styles.r0, {bottom: 12}]}
                    >
                        {paginationDots}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={width ? StyleUtils.getWidthStyle(width) : undefined}>
            <View
                style={[
                    onboardingIsMediumOrLargerScreenWidth ? {padding: modalPadding} : {paddingHorizontal: modalPadding},
                    illustrationOuterContainerStyle,
                    isInLandscapeMode ? [{maxHeight: windowHeight * LANDSCAPE_ILLUSTRATION_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO}, styles.alignSelfCenter] : undefined,
                ]}
            >
                {renderIllustration()}
            </View>
            <View style={[styles.mt5, styles.mh5, contentOuterContainerStyles]}>
                {!!title && !!description && (
                    <View style={[onboardingIsMediumOrLargerScreenWidth ? [styles.gap1, styles.mb8] : [shouldRenderHTMLDescription ? styles.mb5 : styles.mb10], contentInnerContainerStyles]}>
                        {!!subtitle && <Text style={[styles.textLabel, styles.textBold, styles.textSuccess]}>{subtitle}</Text>}
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
                                closeModal(true);
                                return;
                            }
                            onHelp();
                        }}
                        text={helpText}
                        sentryLabel={helpSentryLabel}
                    />
                )}
                <View style={styles.featureTrainingModalNavButtons}>
                    {shouldShowBackButton && (
                        <Button
                            large
                            onPress={onBack}
                            text={translate('common.back')}
                            sentryLabel={confirmSentryLabel}
                            style={styles.flex1}
                        />
                    )}
                    <FormAlertWithSubmitButton
                        onSubmit={confirmModal}
                        isLoading={shouldShowConfirmationLoader}
                        buttonText={confirmText}
                        enabledWhenOffline={canConfirmWhileOffline}
                        sentryLabel={confirmSentryLabel}
                        buttonStyles={styles.flex1}
                        containerStyles={styles.flex1}
                    />
                </View>
                {!canConfirmWhileOffline && <OfflineIndicator />}
            </View>
        </View>
    );
}

export default FeatureTrainingModalBody;
