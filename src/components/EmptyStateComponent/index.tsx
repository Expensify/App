import type {VideoReadyForDisplayEvent} from 'expo-av';
import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import VideoPlayer from '@components/VideoPlayer';
import useThemeStyles from '@hooks/useThemeStyles';
import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';
import CONST from '@src/CONST';
import type {EmptyStateComponentProps} from './types';

const VIDEO_ASPECT_RATIO = 1280 / 960;

type VideoLoadedEventType = {
    srcElement: {
        videoWidth: number;
        videoHeight: number;
    };
};

function EmptyStateComponent({SkeletonComponent, headerMediaType, headerMedia, buttonText, buttonAction, titleText, subtitleText}: EmptyStateComponentProps) {
    const styles = useThemeStyles();
    const isSmallScreenWidth = getIsSmallScreenWidth();

    const [videoAspectRatio, setVideoAspectRatio] = useState(VIDEO_ASPECT_RATIO);

    const aspectRatio = videoAspectRatio || VIDEO_ASPECT_RATIO;

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
                    videoPlayerStyle={[styles.onboardingVideoPlayer, {aspectRatio}]}
                    onVideoLoaded={setAspectRatio}
                    controlsStatus={CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW}
                    shouldUseControlsBottomMargin={false}
                    shouldPlay
                    isLooping
                />
            );
            break;
        case 'animation':
            <View>
                <Text>Animation</Text>
            </View>;
            break;
        default:
            HeaderComponent = (
                <ImageSVG
                    style={{borderTopLeftRadius: 16, borderTopRightRadius: 16}}
                    width={400}
                    height={220}
                    src={headerMedia}
                />
            );
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
                    {HeaderComponent}
                    <View style={styles.p8}>
                        <Text style={[styles.textAlignCenter, styles.textHeadlineH1, styles.mb2]}>{titleText}</Text>
                        <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal, styles.mb5]}>{subtitleText}</Text>
                        <Button
                            success
                            onPress={buttonAction}
                        >
                            {buttonText}
                        </Button>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default EmptyStateComponent;
