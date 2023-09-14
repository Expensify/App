import React from 'react';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import * as StyleUtils from '../styles/StyleUtils';

const propTypes = {
    /**
     * Should we show the spacer
     */
    shouldShow: PropTypes.bool.isRequired,

    /**
     * Array of style objects
     * @default []
     */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const defaultProps = {
    style: [],
};

function SpacerView(props) {
    const marginVertical = useSharedValue(8);
    const borderBottomWidth = useSharedValue(1);
    const animatedStyles = useAnimatedStyle(() => ({
        marginVertical: marginVertical.value,
        borderBottomWidth: borderBottomWidth.value,
    }));

    React.useEffect(() => {
        if (props.shouldShow) {
            marginVertical.value = withTiming(8, {duration: 300});
            borderBottomWidth.value = withTiming(1, {duration: 300});
        } else {
            marginVertical.value = withTiming(0, {duration: 300});
            borderBottomWidth.value = withTiming(0, {duration: 300});
        }
    }, [props.shouldShow, borderBottomWidth, marginVertical]);

    return <Animated.View style={[animatedStyles, ...StyleUtils.parseStyleAsArray(props.style)]} />;
}

SpacerView.displayName = 'SpacerView';
SpacerView.propTypes = propTypes;
SpacerView.defaultProps = defaultProps;
export default SpacerView;
