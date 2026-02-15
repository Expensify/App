import type {SourceLoadEventPayload} from 'expo-video';
import isEmpty from 'lodash/isEmpty';
import React, {useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import ImageSVG from '@components/ImageSVG';
import Lottie from '@components/Lottie';
import Text from '@components/Text';
import VideoPlayer from '@components/VideoPlayer';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {containsCustomEmoji, containsOnlyCustomEmoji} from '@libs/EmojiUtils';
import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';
import CONST from '@src/CONST';
import type {EmptyStateComponentProps} from './types';

const VIDEO_ASPECT_RATIO = 400 / 225;

function EmptyStateComponent({
    SkeletonComponent,
    headerMediaType,
    headerMedia,
    buttons,
    containerStyles,
    title,
    titleStyles,
    subtitle,
    children,
    headerStyles,
    cardStyles,
    cardContentStyles,
    headerContentStyles,
    lottieWebViewStyles,
    minModalHeight = 400,
    subtitleText,
}: EmptyStateComponentProps) {
    const styles = useThemeStyles();
    const [videoAspectRatio, setVideoAspectRatio] = useState(VIDEO_ASPECT_RATIO);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const doesSubtitleContainCustomEmojiAndMore = containsCustomEmoji(subtitle ?? '') && !containsOnlyCustomEmoji(subtitle ?? '');

    const setAspectRatio = (event: SourceLoadEventPayload) => {
        const track = event.availableVideoTracks.at(0);

        if (!track) {
            return;
        }

        setVideoAspectRatio(track.size.width / track.size.height);
    };

    const HeaderComponent = useMemo(() => {
        switch (headerMediaType) {
            case CONST.EMPTY_STATE_MEDIA.VIDEO:
                return (
                    <VideoPlayer
                        url={headerMedia}
                        videoPlayerStyle={[headerContentStyles, styles.emptyStateVideo, {aspectRatio: videoAspectRatio}]}
                        onSourceLoaded={setAspectRatio}
                        controlsStatus={CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW}
                        shouldUseControlsBottomMargin={false}
                        shouldPlay
                        isLooping
                    />
                );
            case CONST.EMPTY_STATE_MEDIA.ANIMATION:
                return (
                    <Lottie
                        source={headerMedia}
                        autoPlay
                        loop
                        style={headerContentStyles}
                        webStyle={lottieWebViewStyles}
                    />
                );
            case CONST.EMPTY_STATE_MEDIA.ILLUSTRATION:
                return (
                    <ImageSVG
                        style={StyleSheet.flatten(headerContentStyles)}
                        src={headerMedia}
                    />
                );
            default:
                return null;
        }
    }, [headerMedia, headerMediaType, headerContentStyles, videoAspectRatio, styles.emptyStateVideo, lottieWebViewStyles]);

    return (
        <View style={[{minHeight: minModalHeight}, styles.flexGrow1, styles.flexShrink0, containerStyles]}>
            {!!SkeletonComponent && (
                <View style={[styles.skeletonBackground, styles.overflowHidden]}>
                    <SkeletonComponent
                        gradientOpacityEnabled
                        shouldAnimate={false}
                    />
                </View>
            )}
            <View style={styles.emptyStateForeground}>
                <View style={[styles.emptyStateContent, cardStyles]}>
                    <View style={[styles.emptyStateHeader, styles.emptyStateHeaderPosition(headerMediaType === CONST.EMPTY_STATE_MEDIA.ILLUSTRATION), headerStyles]}>{HeaderComponent}</View>
                    <View style={[shouldUseNarrowLayout ? styles.p5 : styles.p8, cardContentStyles]}>
                        <Text style={[styles.textAlignCenter, styles.textHeadlineH1, styles.mb2, titleStyles]}>{title}</Text>
                        {subtitleText ??
                            (doesSubtitleContainCustomEmojiAndMore ? (
                                <TextWithEmojiFragment
                                    style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}
                                    message={subtitle}
                                />
                            ) : (
                                <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}>{subtitle}</Text>
                            ))}
                        {children}
                        {!isEmpty(buttons) && (
                            <View style={[styles.gap2, styles.mt5, !shouldUseNarrowLayout ? styles.flexRow : styles.flexColumn, styles.justifyContentCenter]}>
                                {buttons?.map(({buttonText, buttonAction, success, icon, isDisabled, style, dropDownOptions}) =>
                                    dropDownOptions ? (
                                        <ButtonWithDropdownMenu
                                            key={buttonText}
                                            onPress={() => {}}
                                            shouldAlwaysShowDropdownMenu
                                            customText={buttonText}
                                            options={dropDownOptions}
                                            isSplitButton={false}
                                            style={[styles.flex1, style]}
                                        />
                                    ) : (
                                        <Button
                                            key={buttonText}
                                            success={success}
                                            onPress={buttonAction}
                                            text={buttonText}
                                            icon={icon}
                                            large
                                            isDisabled={isDisabled}
                                            style={[styles.flex1, style]}
                                        />
                                    ),
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

export default EmptyStateComponent;
