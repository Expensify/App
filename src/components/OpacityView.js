import React from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import * as StyleUtils from '../styles/StyleUtils';
import variables from '../styles/variables';

const propTypes = {
    /**
     * Should we dim the view
     */
    shouldDim: PropTypes.bool.isRequired,

    /**
     * Content to render
     */
    children: PropTypes.node.isRequired,

    /**
     * Array of style objects
     * @default []
     */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.arrayOf(PropTypes.object),

    /**
     * The value to use for the opacity when the view is dimmed
     * @default 0.5
     */
    dimmingValue: PropTypes.number,
};

const defaultProps = {
    style: [],
    dimmingValue: variables.hoverDimValue,
};

const OpacityView = (props) => {
    const opacity = useSharedValue(1);
    const opacityStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    React.useEffect(() => {
        if (props.shouldDim) {
            opacity.value = withTiming(props.dimmingValue, {duration: 50});
        } else {
            opacity.value = withTiming(1, {duration: 50});
        }
    }, [props.shouldDim, props.dimmingValue, opacity]);

    return (
        <Animated.View style={[opacityStyle]}>
            <View style={StyleUtils.parseStyleAsArray(props.style)}>{props.children}</View>
        </Animated.View>
    );
};

OpacityView.displayName = 'OpacityView';
OpacityView.propTypes = propTypes;
OpacityView.defaultProps = defaultProps;
export default OpacityView;
