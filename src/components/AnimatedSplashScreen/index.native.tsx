import {useEffect} from 'react';
import {StyleSheet, ViewStyle} from 'react-native';
import Reanimated, {Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import Video from 'react-native-video';
import {splashVideoVariants} from '@components/VideoAnimations';
import {setLastShownSplashScreenVideo} from '@libs/actions/Session';
import BootSplash from '@libs/BootSplash';
import styles from '@styles/styles';
import type AnimatedSplashScreenProps from './types';

function AnimatedSplashScreen({onHide = () => {}, shouldHideSplashScreen}: AnimatedSplashScreenProps) {
    const navigationBarHeight = BootSplash.navigationBarHeight || 0;
    const opacity = useSharedValue(1);
    const randomIndex = Math.floor(Math.random() * splashVideoVariants.length);
    setLastShownSplashScreenVideo(splashVideoVariants[randomIndex].fileName);

    const opacityStyle = useAnimatedStyle<ViewStyle>(() => ({
        opacity: opacity.value,
    }));

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
                styles.splashScreenHider,
                opacityStyle,
                {
                    // Apply negative margins to center the logo on window (instead of screen)
                    marginBottom: -navigationBarHeight,
                },
            ]}
        >
            <Video
                useTextureView
                resizeMode="contain"
                source={splashVideoVariants[randomIndex].file}
                style={StyleSheet.absoluteFill}
            />
        </Reanimated.View>
    );
}

AnimatedSplashScreen.displayName = 'AnimatedSplashScreen';

export default AnimatedSplashScreen;
