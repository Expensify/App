import type {VideoReadyForDisplayEvent} from 'expo-av';
import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ImageSVG from '@components/ImageSVG';
import Lottie from '@components/Lottie';
import Text from '@components/Text';
import VideoPlayer from '@components/VideoPlayer';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type {EmptyStateComponentProps, VideoLoadedEventType} from './types';

const VIDEO_ASPECT_RATIO = 400 / 225;

function EmptyStateComponent({SkeletonComponent, headerMediaType, headerMedia, buttonText, buttonAction, title, subtitle, headerStyles, headerContentStyles}: EmptyStateComponentProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    const [videoAspectRatio, setVideoAspectRatio] = useState(VIDEO_ASPECT_RATIO);

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

    let HeaderComponent;
    switch (headerMediaType) {
        case 'video':
            HeaderComponent = (
                <VideoPlayer
                    url={headerMedia}
                    videoPlayerStyle={[headerContentStyles, {aspectRatio: videoAspectRatio}]}
                    videoStyle={styles.emptyStateVideo}
                    onVideoLoaded={setAspectRatio}
                    controlsStatus={CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW}
                    shouldUseControlsBottomMargin={false}
                    shouldPlay
                    isLooping
                />
            );
            break;
        case 'animation':
            HeaderComponent = (
                <Lottie
                    source={headerMedia}
                    autoPlay
                    loop
                    style={headerContentStyles}
                />
            );
            break;
        case 'illustration':
            HeaderComponent = (
                <ImageSVG
                    style={headerContentStyles}
                    src={headerMedia}
                />
            );
            break;
        default:
            HeaderComponent = null;
            break;
    }

    return (
        <View style={styles.flex1}>
            <View style={styles.skeletonBackground}>
                <SkeletonComponent
                    gradientOpacity
                    shouldAnimate={false}
                />
            </View>
            <View style={styles.emptyStateForeground(isSmallScreenWidth)}>
                <View style={[styles.emptyStateContent(isSmallScreenWidth)]}>
                    <View style={[styles.emptyStateHeader(headerMediaType === 'illustration'), headerStyles]}>{HeaderComponent}</View>
                    <View style={styles.p8}>
                        <Text style={[styles.textAlignCenter, styles.textHeadlineH1, styles.mb2]}>{title}</Text>
                        <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal, styles.mb5]}>{subtitle}</Text>
                        {buttonText && buttonAction && (
                            <Button
                                success
                                onPress={buttonAction}
                            >
                                {buttonText}
                            </Button>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

export default EmptyStateComponent;
