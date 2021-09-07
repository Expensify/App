import {Animated, Easing} from 'react-native';

class SpinningIndicatorAnimation {
    constructor() {
        this.rotate = new Animated.Value(0);
        this.scale = new Animated.Value(1);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.getSyncingStyles = this.getSyncingStyles.bind(this);
    }

    /**
     * Start Animation for Indicator
     *
     * @memberof AvatarWithImagePicker
     * @memberof
     */
    start() {
        this.rotate.setValue(0);

        Animated.parallel([
            Animated.timing(this.rotate, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true,
            }),
            Animated.spring(this.scale, {
                toValue: 1.666,
                tension: 1,
                isInteraction: false,
                useNativeDriver: true,
            }),
        ]).start(({finished}) => {
            if (finished) {
                this.start();
            }
        });
    }

    /**
     * Stop Animation for Indicator
     *
     * @memberof AvatarWithImagePicker
     */
    stop() {
        Animated.spring(this.scale, {
            toValue: 1,
            tension: 1,
            isInteraction: false,
            useNativeDriver: true,
        }).start(() => {
            this.rotate.resetAnimation();
            this.scale.resetAnimation();
            this.rotate.setValue(0);
        });
    }

    /**
     * Get Indicator Styles while animating
     *
     * @returns {Object}
     */
    getSyncingStyles() {
        return {
            transform: [{
                rotate: this.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-360deg'],
                }),
            },
            {
                scale: this.scale,
            }],
        };
    }
}

export default SpinningIndicatorAnimation;
