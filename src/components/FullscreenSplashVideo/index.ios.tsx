import {View} from 'react-native';
import Video, {ResizeMode} from 'react-native-video';
import useThemeStyles from '@hooks/useThemeStyles';
import type FullscreenSplashVideoProps from './types';

function FullscreenSplashVideo({source}: FullscreenSplashVideoProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.splashScreenVideoContainerIOS}>
            <Video
                style={styles.splashScreenVideo}
                resizeMode={ResizeMode.CONTAIN}
                source={source}
            />
        </View>
    );
}

FullscreenSplashVideo.displayName = 'FullscreenSplashVideo';

export default FullscreenSplashVideo;
