import React from 'react';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import * as StyleUtils from '../styles/StyleUtils';
import stylePropTypes from '../styles/stylePropTypes';
import CONST from '../CONST';

const propTypes = {
    /**
     * Should we show the spacer
     */
    shouldShow: PropTypes.bool.isRequired,

    /**
     * Array of style objects
     * @default []
     */
    style: stylePropTypes,
};

const defaultProps = {
    style: [],
};

function SpacerView({shouldShow = true, style = []}) {
    const marginVertical = useSharedValue(CONST.HORIZONTAL_SPACER.DEFAULT_MARGIN_VERTICAL);
    const borderBottomWidth = useSharedValue(CONST.HORIZONTAL_SPACER.DEFAULT_BORDER_BOTTOM_WIDTH);
    const animatedStyles = useAnimatedStyle(() => ({
        marginVertical: marginVertical.value,
        borderBottomWidth: borderBottomWidth.value,
    }));

    React.useEffect(() => {
        const duration = CONST.ANIMATED_TRANSITION;
        const values = {
            marginVertical: shouldShow ? CONST.HORIZONTAL_SPACER.DEFAULT_MARGIN_VERTICAL : CONST.HORIZONTAL_SPACER.HIDDEN_MARGIN_VERTICAL,
            borderBottomWidth: shouldShow ? CONST.HORIZONTAL_SPACER.DEFAULT_BORDER_BOTTOM_WIDTH : CONST.HORIZONTAL_SPACER.HIDDEN_BORDER_BOTTOM_WIDTH,
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
