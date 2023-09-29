import React from 'react';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import variables from '../styles/variables';
import * as StyleUtils from '../styles/StyleUtils';
import shouldRenderOffscreen from '../libs/shouldRenderOffscreen';

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
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

    /**
     * The value to use for the opacity when the view is dimmed
     * @default 0.5
     */
    dimmingValue: PropTypes.number,

    /** Whether the view needs to be rendered offscreen (for Android only) */
    needsOffscreenAlphaCompositing: PropTypes.bool,
};

const defaultProps = {
    style: [],
    dimmingValue: variables.hoverDimValue,
    needsOffscreenAlphaCompositing: false,
};

function OpacityView(props) {
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
        <Animated.View
            style={[opacityStyle, ...StyleUtils.parseStyleAsArray(props.style)]}
            needsOffscreenAlphaCompositing={shouldRenderOffscreen ? props.needsOffscreenAlphaCompositing : undefined}
        >
            {props.children}
        </Animated.View>
    );
}

OpacityView.displayName = 'OpacityView';
OpacityView.propTypes = propTypes;
OpacityView.defaultProps = defaultProps;
export default OpacityView;
