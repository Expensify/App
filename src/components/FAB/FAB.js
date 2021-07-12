import React, {PureComponent} from 'react';
import {
    Pressable, Animated, Easing,
} from 'react-native';
import Icon from '../Icon';
import {Plus} from '../Icon/Expensicons';
import styles, {getAnimatedFABStyle} from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import fabPropTypes from './fabPropTypes';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);
AnimatedIcon.displayName = 'AnimatedIcon';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
AnimatedPressable.displayName = 'AnimatedPressable';

class FAB extends PureComponent {
    constructor(props) {
        super(props);
        this.animatedValue = new Animated.Value(0);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isActive !== this.props.isActive) {
            this.animateFloatingActionButton();
        }
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
            <AnimatedPressable
                accessibilityLabel={this.props.accessibilityLabel}
                accessibilityRole={this.props.accessibilityRole}
                onPress={this.props.onPress}
                style={[
                    styles.floatingActionButton,
                    getAnimatedFABStyle(rotate, backgroundColor),
                ]}
            >
                <AnimatedIcon src={Plus} fill={fill} />
            </AnimatedPressable>
        );
    }
}

FAB.propTypes = fabPropTypes;
export default FAB;
