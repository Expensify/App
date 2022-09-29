import React, {PureComponent} from 'react';
import {
    Pressable, Animated, Easing,
} from 'react-native';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import themeColors from '../../styles/themes/default';
import floatingActionButtonPropTypes from './floatingActionButtonPropTypes';
import Tooltip from '../Tooltip';
import withLocalize from '../withLocalize';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);
AnimatedIcon.displayName = 'AnimatedIcon';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
AnimatedPressable.displayName = 'AnimatedPressable';

class FloatingActionButtonBase extends PureComponent {
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
            outputRange: [themeColors.buttonSuccessBG, themeColors.buttonDefaultBG],
        });

        const fill = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [themeColors.componentBG, themeColors.heading],
        });

        return (
            <Tooltip absolute text={this.props.translate('common.new')}>
                <AnimatedPressable
                    accessibilityLabel={this.props.accessibilityLabel}
                    accessibilityRole={this.props.accessibilityRole}
                    onPress={this.props.onPress}
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

FloatingActionButtonBase.propTypes = floatingActionButtonPropTypes;
export default withLocalize(FloatingActionButtonBase);
