import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
import {
    Animated,
    Easing,
    Platform,
    StatusBar,
    StyleSheet,
} from 'react-native';
import BootSplash from '../../libs/BootSplash';
import Logo from '../../../assets/images/new-expensify-dark.svg';
import styles from '../../styles/styles';

const SCALE_RATIO = 10;

const propTypes = {
    /** Screen is ready to be animated */
    isReady: PropTypes.bool,
};

const defaultProps = {
    isReady: false,
};

const AnimatedSplashScreen = (props) => {
    const [isVisible, setIsVisible] = useState(true);
    const [scale] = useState(() => new Animated.Value(1 / SCALE_RATIO));
    const [opacity] = useState(() => new Animated.Value(1));

    useEffect(() => {
        if (!props.isReady) {
            return;
        }

        Animated.timing(scale, {
            duration: 250,
            easing: Easing.back(0.85),
            toValue: 1,
            isInteraction: false,
            useNativeDriver: true,
        }).start();

        Animated.timing(opacity, {
            duration: 300,
            easing: Easing.out(Easing.ease),
            toValue: 0,
            isInteraction: false,
            useNativeDriver: true,
        }).start(() => {
            setIsVisible(false);
        });
    }, [props.isReady, opacity, scale]);

    if (!isVisible) {
        return null;
    }

    return (
        <Animated.View
            style={[
                StyleSheet.absoluteFill,
                styles.animatedSplashScreen,
                {opacity},
                Platform.OS === 'android' && {
                    // Apply negative margins to center the logo on window (instead of screen)
                    marginTop: -StatusBar.currentHeight,
                    marginBottom: -BootSplash.navigationBarHeight,
                },
            ]}
        >
            <Animated.View
                style={{
                    transform: [{scale}],
                }}
            >
                <Logo
                    viewBox="0 0 100 100"
                    width={100 * SCALE_RATIO}
                    height={100 * SCALE_RATIO}
                />
            </Animated.View>
        </Animated.View>
    );
};

AnimatedSplashScreen.displayName = 'AnimatedSplashScreen';
AnimatedSplashScreen.propTypes = propTypes;
AnimatedSplashScreen.defaultProps = defaultProps;

export default AnimatedSplashScreen;
