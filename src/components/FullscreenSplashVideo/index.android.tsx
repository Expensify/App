import {View} from 'react-native';
import Video, {ResizeMode} from 'react-native-video';
import useThemeStyles from '@hooks/useThemeStyles';
import type FullscreenSplashVideoProps from './types';

function FullscreenSplashVideo({source}: FullscreenSplashVideoProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.flex1}>
            {/* We wrap the space around the video with two views that fill the background, instead of the
                parent view having a background. This is because on android when overlaying semi transparent views their colors
                are blend together and the result looks odd, as you'd be able to see the video view frame then.
            */}
            <View style={styles.splashScreenFillView} />
            <Video
                useTextureView
                hideShutterView
                style={styles.splashScreenVideo}
                resizeMode={ResizeMode.CONTAIN}
                source={source}
            />
            <View style={styles.splashScreenFillView} />
        </View>
    );
}

FullscreenSplashVideo.displayName = 'FullscreenSplashVideo';

export default FullscreenSplashVideo;
