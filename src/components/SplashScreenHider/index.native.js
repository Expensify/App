import {useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet} from 'react-native';
import Reanimated, {useSharedValue, withTiming, Easing, useAnimatedStyle, runOnJS} from 'react-native-reanimated';
import DeviceInfo from "react-native-device-info";
import BootSplash from '../../libs/BootSplash';
import LogoProduction from '../../../assets/images/new-expensify-dark.svg';
import LogoDev from '../../../assets/images/new-expensify-dev.svg';
import LogoAdHoc from '../../../assets/images/new-expensify-adhoc.svg';
import styles from '../../styles/styles';

const propTypes = {
    /** Splash screen has been hidden */
    onHide: PropTypes.func,
};

const defaultProps = {
    onHide: () => {},
};

const getLogo = () => {
    const bundleId = DeviceInfo.getBundleId()
    switch (bundleId) {
        case "com.expensify.chat.dev": return LogoDev;
        case "com.expensify.chat.adhoc": return LogoAdHoc;
        default: return LogoProduction
    }
}

const SplashScreenHider = (props) => {
    const {onHide} = props;

    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const opacityStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));
    const scaleStyle = useAnimatedStyle(() => ({
        transform: [{scale: scale.value}],
    }));

    const hideHasBeenCalled = useRef(false);
    const Logo = getLogo();

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
                    marginBottom: -(BootSplash.navigationBarHeight || 0),
                },
            ]}
        >
            <Reanimated.View style={scaleStyle}>
                <Logo
                    viewBox="0 0 80 80"
                    width={100}
                    height={100}
                />
            </Reanimated.View>
        </Reanimated.View>
    );
};

SplashScreenHider.displayName = 'SplashScreenHider';
SplashScreenHider.propTypes = propTypes;
SplashScreenHider.defaultProps = defaultProps;

export default SplashScreenHider;
