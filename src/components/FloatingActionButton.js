import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {Animated, Easing, View} from 'react-native';
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

class FloatingActionButton extends PureComponent {
    constructor(props) {
        super(props);
        this.animatedValue = new Animated.Value(props.isActive ? 1 : 0);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isActive === this.props.isActive) {
            return;
        }

        this.animateFloatingActionButton();
    }

    /**
     * Animates the floating action button
     * Method is called when the isActive prop changes
     */
    animateFloatingActionButton() {
        const animationFinalValue = this.props.isActive ? 1 : 0;

        Animated.timing(this.animatedValue, {
            toValue: animationFinalValue,
            duration: 340,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    }

    render() {
        const rotate = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '135deg'],
        });

        const backgroundColor = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [this.props.theme.success, this.props.theme.buttonDefaultBG],
        });

        const fill = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [this.props.theme.textLight, this.props.theme.textDark],
        });

        return (
            <Tooltip text={this.props.translate('common.new')}>
                <View style={this.props.themeStyles.floatingActionButtonContainer}>
                    <AnimatedPressable
                        ref={(el) => {
                            this.fabPressable = el;
                            if (this.props.buttonRef) {
                                this.props.buttonRef.current = el;
                            }
                        }}
                        accessibilityLabel={this.props.accessibilityLabel}
                        role={this.props.role}
                        pressDimmingValue={1}
                        onPress={(e) => {
                            // Drop focus to avoid blue focus ring.
                            this.fabPressable.blur();
                            this.props.onPress(e);
                        }}
                        onLongPress={() => {}}
                        style={[this.props.themeStyles.floatingActionButton, StyleUtils.getAnimatedFABStyle(rotate, backgroundColor)]}
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

export default compose(withThemeStyles, withTheme)(FloatingActionButtonWithLocalizeWithRef);
