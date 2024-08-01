import {useCallback, useRef} from 'react';
import type {ViewStyle} from 'react-native';
import {StyleSheet} from 'react-native';
import Reanimated, {Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Logo from '@assets/images/new-expensify-dark.svg';
import ImageSVG from '@components/ImageSVG';
import useThemeStyles from '@hooks/useThemeStyles';
import BootSplash from '@libs/BootSplash';
import type {SplashScreenHiderProps, SplashScreenHiderReturnType} from './types';

function SplashScreenHider({onHide = () => {}}: SplashScreenHiderProps): SplashScreenHiderReturnType {
    const styles = useThemeStyles();
    const logoSizeRatio = BootSplash.logoSizeRatio || 1;
    const navigationBarHeight = BootSplash.navigationBarHeight || 0;

    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const opacityStyle = useAnimatedStyle<ViewStyle>(() => ({
        opacity: opacity.value,
    }));
    const scaleStyle = useAnimatedStyle<ViewStyle>(() => ({
        transform: [{scale: scale.value}],
    }));

    const hideHasBeenCalled = useRef(false);

    const hide = useCallback(() => {
        // hide can only be called once
        if (hideHasBeenCalled.current) {
            return;
        }

        hideHasBeenCalled.current = true;

        BootSplash.hide().then(() => {
            // eslint-disable-next-line react-compiler/react-compiler
            scale.value = withTiming(0, {
                duration: 200,
                easing: Easing.back(2),
            });

            opacity.value = withTiming(
                0,
                {
                    duration: 250,
                    easing: Easing.out(Easing.ease),
                },
                () => runOnJS(onHide)(),
            );
        });
    }, [opacity, scale, onHide]);

    return (
        <Reanimated.View
            onLayout={hide}
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
            <Reanimated.View style={scaleStyle}>
                <ImageSVG
                    contentFit="fill"
                    style={{width: 100 * logoSizeRatio, height: 100 * logoSizeRatio}}
                    src={Logo}
                />
            </Reanimated.View>
        </Reanimated.View>
    );
}

SplashScreenHider.displayName = 'SplashScreenHider';

export default SplashScreenHider;
