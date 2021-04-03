/* eslint-disable react/jsx-props-no-spreading */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Animated,
    Easing,
    View,
    StyleSheet,
} from 'react-native';
import Svg, {Circle} from 'react-native-svg';

const propTypes = {
    useNativeDriver: PropTypes.bool,
    size: PropTypes.number,
};

const defaultProps = {
    useNativeDriver: true,
    size: 40,
};

class LoadingIndicator extends Component {
    constructor(props) {
        super(props);

        this.spinValue = new Animated.Value(0);

        this.spinTransform = this.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });

        this.circleProps = {
            style: StyleSheet.absoluteFillObject,
            cx: 0,
            cy: 0,
            r: 40,
            fill: 'transparent',
            stroke: 'rgb(142, 152, 158)',
            strokeWidth: 8,
            strokeLinecap: 'butt',
            strokeDasharray: 0,
            strokeDashoffset: 0,
        };
    }

    componentDidMount() {
        this.spin();
    }

    spin() {
        Animated.loop(
            Animated.timing(
                this.spinValue,
                {
                    toValue: 1,
                    duration: 690,
                    easing: Easing.linear,
                    useNativeDriver: this.props.useNativeDriver,
                },
            ),
        ).start();
    }

    render() {
        const size = this.props.size;

        return (
            <View style={styles.container}>
                <Animated.View style={{transform: [{rotate: this.spinTransform}]}}>
                    <Svg viewBox="-80 -80 160 160" width={size} height={size}>
                        <Circle
                            {...this.circleProps}
                            stroke="rgb(142, 152, 158)"
                            strokeDasharray={0}
                            strokeDashoffset={0}
                        />
                        <Circle
                            {...this.circleProps}
                            stroke="rgb(81,96,105)"
                            strokeDasharray={175}
                            strokeDashoffset={45}
                        />
                    </Svg>
                </Animated.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

LoadingIndicator.propTypes = propTypes;
LoadingIndicator.defaultProps = defaultProps;

export default LoadingIndicator;
