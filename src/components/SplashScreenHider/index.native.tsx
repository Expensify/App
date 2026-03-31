import {useCallback, useRef} from 'react';
import type {ViewStyle} from 'react-native';
import {StyleSheet} from 'react-native';
import Reanimated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import Logo from '@assets/images/new-expensify-dark.svg';
import ImageSVG from '@components/ImageSVG';
import useThemeStyles from '@hooks/useThemeStyles';
import BootSplash from '@libs/BootSplash';
import type {SplashScreenHiderProps, SplashScreenHiderReturnType} from './types';

function SplashScreenHider({onHide = () => {}}: SplashScreenHiderProps): SplashScreenHiderReturnType {
    const styles = useThemeStyles();
    const logoSizeRatio = BootSplash.logoSizeRatio || 1;

    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const opacityStyle = useAnimatedStyle<ViewStyle>(() => ({
        opacity: opacity.get(),
    }));
    const scaleStyle = useAnimatedStyle<ViewStyle>(() => ({
        transform: [{scale: scale.get()}],
    }));

    const hideHasBeenCalled = useRef(false);

    const hide = useCallback(() => {
        // hide can only be called once
        if (hideHasBeenCalled.current) {
            return;
        }

        hideHasBeenCalled.current = true;

        BootSplash.hide().then(() => {
            scale.set(
                withTiming(0, {
                    duration: 200,
                    easing: Easing.back(2),
                }),
            );

            opacity.set(
                withTiming(
                    0,
                    {
                        duration: 250,
                        easing: Easing.out(Easing.ease),
                    },
                    () => scheduleOnRN(onHide),
                ),
            );
        });
    }, [opacity, scale, onHide]);

    return (
        <Reanimated.View style={[StyleSheet.absoluteFill, styles.splashScreenHider, opacityStyle]}>
            <Reanimated.View style={scaleStyle}>
                <ImageSVG
                    onLoadEnd={hide}
                    contentFit="fill"
                    style={{width: 100 * logoSizeRatio, height: 100 * logoSizeRatio}}
                    src={Logo}
                />
            </Reanimated.View>
        </Reanimated.View>
    );
}

export default SplashScreenHider;
