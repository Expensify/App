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

const FloatingActionButton = React.forwardRef(({onPress, isActive, accessibilityLabel, role}, ref) => null);

FloatingActionButton.propTypes = propTypes;
FloatingActionButton.displayName = 'FloatingActionButton';

export default FloatingActionButton;
