import PropTypes from 'prop-types';
import React from 'react';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import usePrevious from '@hooks/usePrevious';
import useStyleUtils from '@hooks/useStyleUtils';
import stylePropTypes from '@styles/stylePropTypes';
import CONST from '@src/CONST';

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
    const StyleUtils = useStyleUtils();
    const marginVertical = useSharedValue(shouldShow ? CONST.HORIZONTAL_SPACER.DEFAULT_MARGIN_VERTICAL : CONST.HORIZONTAL_SPACER.HIDDEN_MARGIN_VERTICAL);
    const borderBottomWidth = useSharedValue(shouldShow ? CONST.HORIZONTAL_SPACER.DEFAULT_BORDER_BOTTOM_WIDTH : CONST.HORIZONTAL_SPACER.HIDDEN_BORDER_BOTTOM_WIDTH);
    const prevShouldShow = usePrevious(shouldShow);

    const duration = CONST.ANIMATED_TRANSITION;
    const animatedStyles = useAnimatedStyle(() => ({
        borderBottomWidth: withTiming(borderBottomWidth.value, {duration}),
        marginTop: withTiming(marginVertical.value, {duration}),
        marginBottom: withTiming(marginVertical.value, {duration}),
    }));

    React.useEffect(() => {
        if (shouldShow === prevShouldShow) {
            return;
        }
        const values = {
            marginVertical: shouldShow ? CONST.HORIZONTAL_SPACER.DEFAULT_MARGIN_VERTICAL : CONST.HORIZONTAL_SPACER.HIDDEN_MARGIN_VERTICAL,
            borderBottomWidth: shouldShow ? CONST.HORIZONTAL_SPACER.DEFAULT_BORDER_BOTTOM_WIDTH : CONST.HORIZONTAL_SPACER.HIDDEN_BORDER_BOTTOM_WIDTH,
        };
        marginVertical.value = values.marginVertical;
        borderBottomWidth.value = values.borderBottomWidth;

        // eslint-disable-next-line react-hooks/exhaustive-deps -- we only need to trigger when shouldShow prop is changed
    }, [shouldShow, prevShouldShow]);

    return <Animated.View style={[animatedStyles, ...StyleUtils.parseStyleAsArray(style)]} />;
}

SpacerView.displayName = 'SpacerView';
SpacerView.propTypes = propTypes;
SpacerView.defaultProps = defaultProps;
export default SpacerView;
