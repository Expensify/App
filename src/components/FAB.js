import React from 'react';
import {Pressable, Animated, Easing} from 'react-native';
import PropTypes from 'prop-types';
import {PlusIcon} from './Expensicons';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';

const AnimatedPlusIcon = Animated.createAnimatedComponent(PlusIcon);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const propTypes = {
    // Callback to fire on request to toggle the FAB
    onPress: PropTypes.func.isRequired,

    // Current state (active or not active) of the component
    isActive: PropTypes.bool.isRequired,
};

class FAB extends React.Component {
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
            outputRange: [themeColors.buttonSuccessBG, themeColors.sidebar],
        });

        const fill = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [themeColors.componentBG, themeColors.icon],
        });

        return (
            <AnimatedPressable
                onPress={this.props.onPress}
                style={[
                    styles.floatingActionButton,
                    {transform: [{rotate}], backgroundColor},
                ]}
            >
                <AnimatedPlusIcon fill={fill} />
            </AnimatedPressable>
        );
    }
}

FAB.propTypes = propTypes;
export default FAB;
