import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import Animated, {Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
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
    role: PropTypes.string.isRequired,
};

const FloatingActionButton = React.forwardRef(({onPress, isActive, accessibilityLabel, role}, ref) => {
    const {success, buttonDefaultBG} = useTheme();
    const styles = useThemeStyles();
    const borderRadius = styles.floatingActionButton.borderRadius;
    const {translate} = useLocalize();
    const fabPressable = useRef(null);
    const sharedValue = useSharedValue(isActive ? 1 : 0);
    const buttonRef = ref;

    useEffect(() => {
        sharedValue.value = withTiming(isActive ? 1 : 0, {
            duration: 340,
            easing: Easing.inOut(Easing.ease),
        });
    }, [isActive, sharedValue]);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(sharedValue.value, [0, 1], [success, buttonDefaultBG]);

        return {
            transform: [{rotate: `${sharedValue.value * 135}deg`}],
            backgroundColor,
            borderRadius,
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
                    role={role}
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
