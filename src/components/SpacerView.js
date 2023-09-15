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

function SpacerView({shouldShow, style}) {
    const marginVertical = useSharedValue(8);
    const borderBottomWidth = useSharedValue(1);
    const animatedStyles = useAnimatedStyle(() => ({
        marginVertical: marginVertical.value,
        borderBottomWidth: borderBottomWidth.value,
    }));

    React.useEffect(() => {
        const duration = 300;
        const values = {
            marginVertical: shouldShow ? 8 : 0,
            borderBottomWidth: shouldShow ? 1 : 0,
        };
        marginVertical.value = withTiming(values.marginVertical, {duration});
        borderBottomWidth.value = withTiming(values.borderBottomWidth, {duration});
    }, [shouldShow, borderBottomWidth, marginVertical]);

    return <Animated.View style={[animatedStyles, ...StyleUtils.parseStyleAsArray(style)]} />;
}

SpacerView.displayName = 'SpacerView';
SpacerView.propTypes = propTypes;
SpacerView.defaultProps = defaultProps;
export default SpacerView;
