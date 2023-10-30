import PropTypes from 'prop-types';
import {useCallback, useRef} from 'react';
import {StyleSheet} from 'react-native';
import Reanimated, {Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Logo from '@assets/images/new-expensify-dark.svg';
import BootSplash from '@libs/BootSplash';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    /** Splash screen has been hidden */
    onHide: PropTypes.func,
};

const defaultProps = {
    onHide: () => {},
};

function SplashScreenHider(props) {
    const styles = useThemeStyles();
    const {onHide} = props;

    const logoSizeRatio = BootSplash.logoSizeRatio || 1;
    const navigationBarHeight = BootSplash.navigationBarHeight || 0;

    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const opacityStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));
    const scaleStyle = useAnimatedStyle(() => ({
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
                <Logo
                    viewBox="0 0 80 80"
                    width={100 * logoSizeRatio}
                    height={100 * logoSizeRatio}
                />
            </Reanimated.View>
        </Reanimated.View>
    );
}

SplashScreenHider.displayName = 'SplashScreenHider';
SplashScreenHider.propTypes = propTypes;
SplashScreenHider.defaultProps = defaultProps;

export default SplashScreenHider;
