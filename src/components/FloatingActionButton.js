import PropTypes from 'prop-types';
import React, {memo, useCallback, useEffect, useRef} from 'react';
import {Animated, Easing, View} from 'react-native';
import usePrevious from '@hooks/usePrevious';
import compose from '@libs/compose';
import * as StyleUtils from '@styles/StyleUtils';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Tooltip from './Tooltip/PopoverAnchorTooltip';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withTheme, {withThemePropTypes} from './withTheme';
import withThemeStyles, {withThemeStylesPropTypes} from './withThemeStyles';

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
    ...withThemeStylesPropTypes,
    ...withThemePropTypes,
};

const defaultProps = {
    buttonRef: () => {},
};

function FloatingActionButton(props) {
    const animatedValue = useRef(new Animated.Value(props.isActive ? 1 : 0));
    const previousIsActive = usePrevious(props.isActive);
    const fabPressable = useRef(null);

    /**
     * Animates the floating action button
     * Method is called when the isActive prop changes
     */
    const animateFloatingActionButton = useCallback(() => {
        const animationFinalValue = props.isActive ? 1 : 0;
        Animated.timing(animatedValue.current, {
            toValue: animationFinalValue,
            duration: 340,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [props.isActive]);

    useEffect(() => {
        if (props.isActive === previousIsActive) {
            return;
        }

        animateFloatingActionButton();
    }, [props.isActive, animateFloatingActionButton, previousIsActive]);

    const rotate = animatedValue.current.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '135deg'],
    });

    const backgroundColor = animatedValue.current.interpolate({
        inputRange: [0, 1],
        outputRange: [props.theme.success, props.theme.buttonDefaultBG],
    });

    const fill = animatedValue.current.interpolate({
        inputRange: [0, 1],
        outputRange: [props.theme.textLight, props.theme.textDark],
    });

    return (
        <Tooltip text={props.translate('common.new')}>
            <View style={props.themeStyles.floatingActionButtonContainer}>
                <AnimatedPressable
                    ref={(el) => {
                        fabPressable.current = el;
                        if (props.buttonRef) {
                            // eslint-disable-next-line no-param-reassign
                            props.buttonRef.current = el;
                        }
                    }}
                    accessibilityLabel={props.accessibilityLabel}
                    role={props.role}
                    pressDimmingValue={1}
                    onPress={(e) => {
                        // Drop focus to avoid blue focus ring.
                        fabPressable.current.blur();
                        props.onPress(e);
                    }}
                    onLongPress={() => {}}
                    style={[props.themeStyles.floatingActionButton, StyleUtils.getAnimatedFABStyle(rotate, backgroundColor)]}
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

const FloatingActionButtonWithLocalizeWithRef = React.forwardRef((props, ref) => (
    <FloatingActionButtonWithLocalize
        // eslint-disable-next-line
        {...props}
        buttonRef={ref}
    />
));

FloatingActionButtonWithLocalizeWithRef.displayName = 'FloatingActionButtonWithLocalizeWithRef';

export default compose(withThemeStyles, withTheme, memo)(FloatingActionButtonWithLocalizeWithRef);
