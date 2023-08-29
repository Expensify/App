import React, {PureComponent} from 'react';
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
            outputRange: [themeColors.success, themeColors.buttonDefaultBG],
        });

        const fill = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [themeColors.textLight, themeColors.textDark],
        });

        return (
            <Tooltip text={this.props.translate('common.new')}>
                <View style={styles.floatingActionButtonContainer}>
                    <AnimatedPressable
                        ref={(el) => {
                            this.fabPressable = el;
                            if (this.props.buttonRef) {
                                this.props.buttonRef.current = el;
                            }
                        }}
                        accessibilityLabel={this.props.accessibilityLabel}
                        accessibilityRole={this.props.accessibilityRole}
                        pressDimmingValue={1}
                        onPress={(e) => {
                            // Drop focus to avoid blue focus ring.
                            this.fabPressable.blur();
                            this.props.onPress(e);
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
