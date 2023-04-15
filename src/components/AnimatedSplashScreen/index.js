import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
import {Animated, StatusBar, StyleSheet} from 'react-native';
import BootSplash from '../../libs/BootSplash';
import Logo from '../../../assets/images/new-expensify-dark.svg';
import colors from '../../styles/colors';

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
        if (!props.isReady || !isVisible) {
            return;
        }

        Animated.stagger(220, [
            Animated.spring(scale, {
                toValue: 1 / (SCALE_RATIO * 2),
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.timing(opacity, {
            delay: 220,
            duration: 220,
            toValue: 0,
            useNativeDriver: true,
        }).start(() => {
            setIsVisible(false);
        });
    }, [props.isReady, isVisible, opacity, scale]);

    if (!isVisible) {
        return null;
    }

    return (
        <Animated.View
            style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: colors.green400,
                alignItems: 'center',
                justifyContent: 'center',
                opacity,
                marginTop: -StatusBar.currentHeight,
                marginBottom: -BootSplash.navigationBarHeight,
            }}
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
