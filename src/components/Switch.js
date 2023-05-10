import React, {Component} from 'react';
import {Animated} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import * as Pressables from './Pressable';

const propTypes = {
    /** Whether the switch is toggled to the on position */
    isOn: PropTypes.bool.isRequired,

    /** Callback to fire when the switch is toggled */
    onToggle: PropTypes.func.isRequired,

    /** Accessibility label for the switch */
    accessibilityLabel: PropTypes.string.isRequired,
};

const PressableWithFeedback = Pressables.PressableWithFeedback;
class Switch extends Component {
    constructor(props) {
        super(props);
        this.offPosition = 0;
        this.onPosition = 20;
        this.offsetX = new Animated.Value(props.isOn ? this.onPosition : this.offPosition);

        this.toggleSwitch = this.toggleSwitch.bind(this);
        this.toggleAction = this.toggleAction.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isOn === this.props.isOn) {
            return;
        }

        this.toggleSwitch();
    }

    // animates the switch to the on or off position
    toggleSwitch() {
        Animated.timing(this.offsetX, {
            toValue: this.props.isOn ? this.onPosition : this.offPosition,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }

    // executes the callback passed in as a prop
    toggleAction() {
        this.props.onToggle(!this.props.isOn);
    }

    render() {
        const switchTransform = {transform: [{translateX: this.offsetX}]};
        return (
            <PressableWithFeedback
                style={[styles.switchTrack, !this.props.isOn && styles.switchInactive]}
                onPress={this.toggleAction}
                onLongPress={this.toggleAction}
                accessibilityRole="switch"
                accessibilityState={{checked: this.props.isOn}}
                aria-checked={this.props.isOn}
                accessibilityLabel={this.props.accessibilityLabel}
                // disable hover dim for switch
                hoverDimmingValue={1}
                pressDimmingValue={0.8}
            >
                <Animated.View style={[styles.switchThumb, switchTransform]} />
            </PressableWithFeedback>
        );
    }
}

Switch.propTypes = propTypes;

export default Switch;
