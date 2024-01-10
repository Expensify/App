import {useEffect, useMemo} from 'react';
import type {ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import Reanimated, {Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import Video, {ResizeMode} from 'react-native-video';
import {splashVideoVariants} from '@components/VideoAnimations';
import useThemeStyles from '@hooks/useThemeStyles';
import {setLastShownSplashScreenVideo} from '@libs/actions/Session';
import BootSplash from '@libs/BootSplash';
import type AnimatedSplashScreenProps from './types';

function AnimatedSplashScreen({onHide = () => {}, shouldHideSplashScreen}: AnimatedSplashScreenProps) {
    const styles = useThemeStyles();
    const navigationBarHeight = BootSplash.navigationBarHeight || 0;
    const opacity = useSharedValue(1);
    const randomIndex = useMemo(() => Math.floor(Math.random() * splashVideoVariants.length), []);

    const opacityStyle = useAnimatedStyle<ViewStyle>(
        () => ({
            opacity: opacity.value,
        }),
        [opacity],
    );

    useEffect(() => {
        setLastShownSplashScreenVideo(splashVideoVariants[randomIndex].fileName);
    }, [randomIndex]);

    useEffect(() => {
        if (!shouldHideSplashScreen) {
            return;
        }
        opacity.value = withDelay(
            300, // delay the animation a bit because the js thread freezing on startup to login screen causing it to be janky
            withTiming(
                0,
                {
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                },
                () => runOnJS(onHide)(),
            ),
        );
    }, [shouldHideSplashScreen, onHide, opacity]);

    return (
        <Reanimated.View
            style={[
                StyleSheet.absoluteFill,
                opacityStyle,
                {
                    // Apply negative margins to center the logo on window (instead of screen)
                    marginBottom: -navigationBarHeight,
                },
            ]}
        >
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
                source={splashVideoVariants[randomIndex].file}
            />
            <View style={styles.splashScreenFillView} />
        </Reanimated.View>
    );
}

AnimatedSplashScreen.displayName = 'AnimatedSplashScreen';

export default AnimatedSplashScreen;
