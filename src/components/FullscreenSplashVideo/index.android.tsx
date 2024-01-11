import {useCallback} from 'react';
import {View} from 'react-native';
import Reanimated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import Video, {ResizeMode} from 'react-native-video';
import useThemeStyles from '@hooks/useThemeStyles';
import type FullscreenSplashVideoProps from './types';

function FullscreenSplashVideo({source}: FullscreenSplashVideoProps) {
    const styles = useThemeStyles();
    const backgroundColor = styles.splashScreenFillView.backgroundColor;

    // While the video is loading we need to display the video with a background color, as otherwise
    // the content underneath the video might be visible before the videos first frame is loaded.
    // We can't keep the background for the reason mentioned further below.
    const isDisplayingVideo = useSharedValue(false);
    const onReadyForDisplay = useCallback(() => {
        isDisplayingVideo.value = true;
    }, [isDisplayingVideo]);
    const animatedVideoContainerStyles = useAnimatedStyle(
        () => ({
            backgroundColor: isDisplayingVideo.value ? 'transparent' : backgroundColor,
        }),
        [backgroundColor, isDisplayingVideo],
    );

    return (
        <View style={styles.flex1}>
            {/* We wrap the space around the video with two views that fill the background, instead of the
                parent view having a background. This is because on android when overlaying semi transparent views their colors
                are blend together and the result looks odd, as you'd be able to see the video view frame then.
            */}
            <View style={styles.splashScreenFillView} />
            <Reanimated.View style={animatedVideoContainerStyles}>
                <Video
                    useTextureView
                    hideShutterView
                    source={source}
                    style={styles.splashScreenVideo}
                    resizeMode={ResizeMode.CONTAIN}
                    onReadyForDisplay={onReadyForDisplay}
                />
            </Reanimated.View>
            <View style={styles.splashScreenFillView} />
        </View>
    );
}

FullscreenSplashVideo.displayName = 'FullscreenSplashVideo';

export default FullscreenSplashVideo;
