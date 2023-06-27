import {Portal} from '@gorhom/portal';
import PropTypes from 'prop-types';
import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

const propTypes = {
    /** Children to render */
    children: PropTypes.node.isRequired,

    /** TestID for test */
    testID: PropTypes.string,
};

const defaultProps = {
    testID: undefined,
};

const height = Dimensions.get('window').height;

const ScreenSlideAnimation = React.forwardRef(({children, testID}, ref) => {
    const [visible, setVisible] = React.useState(false);
    const translateX = useSharedValue(height);

    React.useImperativeHandle(
        ref,
        () => ({
            close: () => {
                translateX.value = withTiming(height, {duration: 500}, (finished) => {
                    if (!finished) {
                        return;
                    }
                    runOnJS(setVisible)(false);
                });
            },
            open: () => setVisible(true),
        }),
        [],
    );

    React.useEffect(() => {
        if (!visible) {
            return;
        }
        translateX.value = withTiming(0, {duration: 500});
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({transform: [{translateX: translateX.value}]}), [translateX.value]);

    if (!visible) return null;

    return (
        <Portal hostName="RigthModalNavigator">
            <Animated.View
                testID={testID}
                style={[StyleSheet.absoluteFillObject, animatedStyle]}
            >
                {children}
            </Animated.View>
        </Portal>
    );
});

ScreenSlideAnimation.displayName = 'ScreenSlideAnimation';
ScreenSlideAnimation.propTypes = propTypes;
ScreenSlideAnimation.defaultProps = defaultProps;

export default ScreenSlideAnimation;
