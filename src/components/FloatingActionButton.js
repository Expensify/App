import React, {useEffect, useRef} from 'react';
import {Animated, Easing, View} from 'react-native';
import PropTypes from 'prop-types';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import themeColors from '../styles/themes/default';
import Tooltip from './Tooltip';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import usePrevious from '../hooks/usePrevious';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);
AnimatedIcon.displayName = 'AnimatedIcon';

const AnimatedPressable = Animated.createAnimatedComponent(PressableWithFeedback);
AnimatedPressable.displayName = 'AnimatedPressable';

const propTypes = {
    // Callback to fire on request to toggle the FloatingActionButton
    onPress: PropTypes.func.isRequired,

    // Current state (active or not active) of the component
    isActive: PropTypes.bool.isRequired,

    // Ref for the button
    buttonRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

    ...withLocalizePropTypes,
};

const defaultProps = {
    buttonRef: () => {},
};

function FloatingActionButton({isActive, onPress, buttonRef, translate, accessibilityLabel, accessibilityRole}) {
    const animatedValue = useRef(isActive ? 1 : 0);
    const fabPressable = useRef(null);
    const previousIsActive = usePrevious(isActive);

    useEffect(() => {
        if (isActive === previousIsActive) {
            return;
        }

        const animationFinalValue = isActive ? 1 : 0;

        Animated.timing(animatedValue.current, {
           toValue: animationFinalValue,
           duration: 340,
           easing: Easing.inOut(Easing.ease),
           useNativeDriver: false,
       }).start();
    }, [isActive, previousIsActive]);

    const rotate = animatedValue.current.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '135deg'],
    });

    const backgroundColor = animatedValue.current.interpolate({
        inputRange: [0, 1],
        outputRange: [themeColors.success, themeColors.buttonDefaultBG],
    });

    const fill = animatedValue.current.interpolate({
        inputRange: [0, 1],
        outputRange: [themeColors.textLight, themeColors.textDark],
    });

    return (
        <Tooltip text={translate('common.new')}>
            <View style={styles.floatingActionButtonContainer}>
                <AnimatedPressable
                    ref={(el) => {
                        fabPressable.current = el;
                        if (buttonRef) {
                            // eslint-disable-next-line no-param-reassign
                            buttonRef.current = el;
                        }
                    }}
                    accessibilityLabel={accessibilityLabel}
                    accessibilityRole={accessibilityRole}
                    pressDimmingValue={1}
                    onPress={(e) => {
                        // Drop focus to avoid blue focus ring.
                        fabPressable.current.blur();
                        onPress(e);
                    }}
                    onLongPress={() => {}}
                    style={[styles.floatingActionButton, StyleUtils.getAnimatedFABStyle(rotate, backgroundColor)]}
                >
                    <AnimatedIcon
                        src={Expensicons.Plus}
                        fill={fill}
                    />
                </AnimatedPressable>
            </View>
        </Tooltip>
    );
}

FloatingActionButton.propTypes = propTypes;
FloatingActionButton.defaultProps = defaultProps;

const FloatingActionButtonWithLocalize = withLocalize(FloatingActionButton);

export default React.forwardRef((props, ref) => (
    <FloatingActionButtonWithLocalize
        // eslint-disable-next-line
        {...props}
        buttonRef={ref}
    />
));
