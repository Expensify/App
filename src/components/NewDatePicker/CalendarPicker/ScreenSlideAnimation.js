import {Portal} from '@gorhom/portal';
import PropTypes from 'prop-types';
import React from 'react';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../withWindowDimensions';

const propTypes = {
    /** Children to render */
    children: PropTypes.node.isRequired,

    /** TestID for test */
    testID: PropTypes.string,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    testID: undefined,
};

const ScreenSlideAnimation = React.forwardRef(({children, testID, isSmallScreenWidth, windowHeight}, ref) => {
    const [visible, setVisible] = React.useState(false);
    const width = isSmallScreenWidth ? windowHeight : variables.sideBarWidth;
    const translateX = useSharedValue(width);

    React.useImperativeHandle(
        ref,
        () => ({
            close: () => {
                translateX.value = withTiming(width, {duration: CONST.ANIMATED_TRANSITION}, (finished) => {
                    if (!finished) {
                        return;
                    }
                    runOnJS(setVisible)(false);
                });
            },
            open: () => setVisible(true),
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [width],
    );

    React.useEffect(() => {
        if (!visible) {
            return;
        }
        translateX.value = withTiming(0, {duration: CONST.ANIMATED_TRANSITION});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({width, transform: [{translateX: translateX.value}]}), [translateX.value, width]);

    if (!visible) return null;

    return (
        <Portal hostName="RigthModalNavigator">
            <Animated.View
                testID={testID}
                style={[styles.sidebarAnimatedWrapperContainer, animatedStyle]}
            >
                {children}
            </Animated.View>
        </Portal>
    );
});

ScreenSlideAnimation.displayName = 'ScreenSlideAnimation';
ScreenSlideAnimation.propTypes = propTypes;
ScreenSlideAnimation.defaultProps = defaultProps;

export default withWindowDimensions(ScreenSlideAnimation);
