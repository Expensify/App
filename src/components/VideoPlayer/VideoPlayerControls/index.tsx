import type {VideoPlayer, VideoView} from 'expo-video';
import type {RefObject} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import type {GestureResponderEvent, LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import Text from '@components/Text';
import IconButton from '@components/VideoPlayer/IconButton';
import {convertSecondsToTime} from '@components/VideoPlayer/utils';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ProgressBar from './ProgressBar';
import VolumeButton from './VolumeButton';

type VideoPlayerControlsProps = {
    /** Duration of a video. */
    duration: number;

    /** Position of progress pointer. */
    position: number;

    /** Url of a video. */
    url: string;

    /** Ref for video player. */
    videoPlayerRef: RefObject<VideoPlayer | null>;

    /** Ref for video view component. */
    videoViewRef: RefObject<VideoView | null>;

    /** Is video playing. */
    isPlaying: boolean;

    /** Defines if component should have small icons and tighter spacing inline. */
    small?: boolean;

    /** Style of video player controls. */
    style?: StyleProp<ViewStyle>;

    /** Function called to show popover menu. */
    showPopoverMenu: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

    /** Function to play and pause the video.  */
    togglePlayCurrentVideo: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

    controlsStatus: ValueOf<typeof CONST.VIDEO_PLAYER.CONTROLS_STATUS>;

    reportID: string | undefined;
};

function VideoPlayerControls({
    duration,
    position,
    url,
    videoPlayerRef,
    videoViewRef,
    isPlaying,
    small = false,
    style,
    showPopoverMenu,
    togglePlayCurrentVideo,
    controlsStatus = CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW,
    reportID,
}: VideoPlayerControlsProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Fullscreen', 'Pause', 'Play', 'ThreeDots'] as const);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {updateCurrentURLAndReportID} = usePlaybackContext();
    const [shouldShowTime, setShouldShowTime] = useState(false);
    const iconSpacing = small ? styles.mr3 : styles.mr4;

    const onLayout = (event: LayoutChangeEvent) => {
        setShouldShowTime(event.nativeEvent.layout.width > CONST.VIDEO_PLAYER.HIDE_TIME_TEXT_WIDTH);
    };

    const enterFullScreenMode = useCallback(() => {
        updateCurrentURLAndReportID(url, reportID);
        videoViewRef.current?.enterFullscreen();
    }, [reportID, updateCurrentURLAndReportID, url, videoViewRef]);

    const seekPosition = useCallback(
        (newPosition: number) => {
            if (!videoPlayerRef.current) {
                return;
            }
            // eslint-disable-next-line no-param-reassign
            videoPlayerRef.current.currentTime = newPosition;
        },
        [videoPlayerRef],
    );

    const durationFormatted = useMemo(() => convertSecondsToTime(duration), [duration]);

    return (
        <Animated.View
            style={[
                styles.videoPlayerControlsContainer,
                small ? [styles.p2, styles.pb0] : [styles.p3, styles.pb1],
                controlsStatus === CONST.VIDEO_PLAYER.CONTROLS_STATUS.VOLUME_ONLY && [styles.pt2, styles.pb2],
                style,
            ]}
            onLayout={onLayout}
        >
            {controlsStatus === CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW && (
                <View style={[styles.videoPlayerControlsButtonContainer, !small && styles.mb4]}>
                    <View style={[styles.videoPlayerControlsRow]}>
                        <IconButton
                            src={isPlaying ? icons.Pause : icons.Play}
                            tooltipText={isPlaying ? translate('videoPlayer.pause') : translate('videoPlayer.play')}
                            onPress={togglePlayCurrentVideo}
                            style={styles.mr2}
                            small={small}
                            sentryLabel={CONST.SENTRY_LABEL.VIDEO_PLAYER.PLAY_PAUSE_BUTTON}
                        />
                        {shouldShowTime && (
                            <View style={[styles.videoPlayerControlsRow]}>
                                <Text style={[styles.videoPlayerText, styles.videoPlayerTimeComponentWidth]}>{convertSecondsToTime(position)}</Text>
                                <Text style={[styles.videoPlayerText]}>/</Text>
                                <Text style={[styles.videoPlayerText, styles.videoPlayerTimeComponentWidth]}>{durationFormatted}</Text>
                            </View>
                        )}
                    </View>
                    <View style={[styles.videoPlayerControlsRow]}>
                        <VolumeButton style={iconSpacing} />
                        <IconButton
                            src={icons.Fullscreen}
                            tooltipText={translate('videoPlayer.fullscreen')}
                            onPress={enterFullScreenMode}
                            style={iconSpacing}
                            small={small}
                            sentryLabel={CONST.SENTRY_LABEL.VIDEO_PLAYER.FULLSCREEN_BUTTON}
                        />
                        <IconButton
                            src={icons.ThreeDots}
                            tooltipText={translate('common.more')}
                            onPress={showPopoverMenu}
                            small={small}
                            sentryLabel={CONST.SENTRY_LABEL.VIDEO_PLAYER.MORE_BUTTON}
                        />
                    </View>
                </View>
            )}
            <View style={styles.videoPlayerControlsRow}>
                <View style={[styles.flex1]}>
                    <ProgressBar
                        duration={duration}
                        position={position}
                        seekPosition={seekPosition}
                    />
                </View>
                {controlsStatus === CONST.VIDEO_PLAYER.CONTROLS_STATUS.VOLUME_ONLY && <VolumeButton style={styles.ml3} />}
            </View>
        </Animated.View>
    );
}

export default VideoPlayerControls;
