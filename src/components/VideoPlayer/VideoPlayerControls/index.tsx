import type {VideoPlayer, VideoView} from 'expo-video';
import type {RefObject} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import type {GestureResponderEvent, LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import IconButton from '@components/VideoPlayer/IconButton';
import {convertSecondsToTime} from '@components/VideoPlayer/utils';
import {useFullScreenContext} from '@components/VideoPlayerContexts/FullScreenContext';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
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
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {updateCurrentURLAndReportID} = usePlaybackContext();
    const {isFullScreenRef} = useFullScreenContext();
    const [shouldShowTime, setShouldShowTime] = useState(false);
    const iconSpacing = small ? styles.mr3 : styles.mr4;

    const onLayout = (event: LayoutChangeEvent) => {
        setShouldShowTime(event.nativeEvent.layout.width > CONST.VIDEO_PLAYER.HIDE_TIME_TEXT_WIDTH);
    };

    const enterFullScreenMode = useCallback(() => {
        updateCurrentURLAndReportID(url, reportID);

        const result = videoViewRef.current?.enterFullscreen();
        // eslint-disable-next-line react-compiler/react-compiler
        result?.then(() => (isFullScreenRef.current = true)).catch(() => {});
    }, [isFullScreenRef, reportID, updateCurrentURLAndReportID, url, videoViewRef]);

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
                            src={isPlaying ? Expensicons.Pause : Expensicons.Play}
                            tooltipText={isPlaying ? translate('videoPlayer.pause') : translate('videoPlayer.play')}
                            onPress={togglePlayCurrentVideo}
                            style={styles.mr2}
                            small={small}
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
                            src={Expensicons.Fullscreen}
                            tooltipText={translate('videoPlayer.fullscreen')}
                            onPress={enterFullScreenMode}
                            style={iconSpacing}
                            small={small}
                        />
                        <IconButton
                            src={Expensicons.ThreeDots}
                            tooltipText={translate('common.more')}
                            onPress={showPopoverMenu}
                            small={small}
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

VideoPlayerControls.displayName = 'VideoPlayerControls';

export default VideoPlayerControls;
