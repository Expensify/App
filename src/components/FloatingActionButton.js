import React, {PureComponent} from 'react';
import {Pressable, Animated, Easing} from 'react-native';
import PropTypes from 'prop-types';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import themeColors from '../styles/themes/default';
import Tooltip from './Tooltip';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);
AnimatedIcon.displayName = 'AnimatedIcon';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
AnimatedPressable.displayName = 'AnimatedPressable';

const propTypes = {
    // Callback to fire on request to toggle the FloatingActionButton
    onPress: PropTypes.func.isRequired,

    // Current state (active or not active) of the component
    isActive: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
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
            <Tooltip absolute text={this.props.translate('common.new')}>
                <AnimatedPressable
                    ref={el => this.fabPressable = el}
                    accessibilityLabel={this.props.accessibilityLabel}
                    accessibilityRole={this.props.accessibilityRole}
                    onPress={(e) => {
                        // Drop focus to avoid blue focus ring.
                        this.fabPressable.blur();
                        this.props.onPress(e);
                    }}
                    style={[
                        styles.floatingActionButton,
                        StyleUtils.getAnimatedFABStyle(rotate, backgroundColor),
                    ]}
                >
                    <AnimatedIcon src={Expensicons.Plus} fill={fill} />
                </AnimatedPressable>
            </Tooltip>
        );
    }
}

FloatingActionButton.propTypes = propTypes;

export default withLocalize(FloatingActionButton);
