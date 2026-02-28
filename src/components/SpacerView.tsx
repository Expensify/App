import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import usePrevious from '@hooks/usePrevious';
import CONST from '@src/CONST';

type SpacerViewProps = {
    /**
     * Should we show the spacer
     */
    shouldShow: boolean;

    /**
     * Array of style objects
     */
    style?: StyleProp<ViewStyle>;
};

function SpacerView({shouldShow, style}: SpacerViewProps) {
    const marginVertical = useSharedValue<number>(shouldShow ? CONST.HORIZONTAL_SPACER.DEFAULT_MARGIN_VERTICAL : CONST.HORIZONTAL_SPACER.HIDDEN_MARGIN_VERTICAL);
    const borderBottomWidth = useSharedValue<number>(shouldShow ? CONST.HORIZONTAL_SPACER.DEFAULT_BORDER_BOTTOM_WIDTH : CONST.HORIZONTAL_SPACER.HIDDEN_BORDER_BOTTOM_WIDTH);
    const prevShouldShow = usePrevious(shouldShow);
    const duration = CONST.ANIMATED_TRANSITION;
    const animatedStyles = useAnimatedStyle(() => ({
        borderBottomWidth: withTiming(borderBottomWidth.get(), {duration}),
        marginTop: withTiming(marginVertical.get(), {duration}),
        marginBottom: withTiming(marginVertical.get(), {duration}),
    }));

    React.useEffect(() => {
        if (shouldShow === prevShouldShow) {
            return;
        }
        const values = {
            marginVertical: shouldShow ? CONST.HORIZONTAL_SPACER.DEFAULT_MARGIN_VERTICAL : CONST.HORIZONTAL_SPACER.HIDDEN_MARGIN_VERTICAL,
            borderBottomWidth: shouldShow ? CONST.HORIZONTAL_SPACER.DEFAULT_BORDER_BOTTOM_WIDTH : CONST.HORIZONTAL_SPACER.HIDDEN_BORDER_BOTTOM_WIDTH,
        };
        marginVertical.set(values.marginVertical);
        borderBottomWidth.set(values.borderBottomWidth);

        // eslint-disable-next-line react-hooks/exhaustive-deps -- we only need to trigger when shouldShow prop is changed
    }, [shouldShow, prevShouldShow]);

    return <Animated.View style={[animatedStyles, style]} />;
}

export default SpacerView;
