import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import Animated, {useSharedValue, useAnimatedStyle, withTiming, Easing, interpolateColor} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import Tooltip from '../Tooltip';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import useLocalize from '../../hooks/useLocalize';
import FabPlusIcon from './FabPlusIcon';

const AnimatedPressable = Animated.createAnimatedComponent(PressableWithFeedback);
AnimatedPressable.displayName = 'AnimatedPressable';

const propTypes = {
    /* Callback to fire on request to toggle the FloatingActionButton */
    onPress: PropTypes.func.isRequired,

    /* Current state (active or not active) of the component */
    isActive: PropTypes.bool.isRequired,

    /* An accessibility label for the button */
    accessibilityLabel: PropTypes.string.isRequired,

    /* An accessibility role for the button */
    accessibilityRole: PropTypes.string.isRequired,
};

const FloatingActionButton = React.forwardRef(({onPress, isActive, accessibilityLabel, accessibilityRole}, ref) => {
    const {translate} = useLocalize();
    const fabPressable = useRef(null);
    const animatedValue = useSharedValue(isActive ? 1 : 0);
    const buttonRef = ref;

    useEffect(() => {
        animatedValue.value = withTiming(isActive ? 1 : 0, {
            duration: 340,
            easing: Easing.inOut(Easing.ease),
        });
    }, [isActive, animatedValue]);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(animatedValue.value, [0, 1], [themeColors.success, themeColors.buttonDefaultBG]);

        return {
            transform: [{rotate: `${animatedValue.value * 135}deg`}],
            backgroundColor,
            borderRadius: styles.floatingActionButton.borderRadius,
        };
    });

    return (
        <Tooltip text={translate('common.new')}>
            <View style={styles.floatingActionButtonContainer}>
                <AnimatedPressable
                    ref={(el) => {
                        fabPressable.current = el;
                        if (buttonRef) {
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
                    style={[styles.floatingActionButton, animatedStyle]}
                >
                    <FabPlusIcon isActive={isActive} />
                </AnimatedPressable>
            </View>
        </Tooltip>
    );
});

FloatingActionButton.propTypes = propTypes;
FloatingActionButton.displayName = 'FloatingActionButton';

export default FloatingActionButton;
