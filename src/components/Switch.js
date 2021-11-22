import React, {Component} from 'react';
import {TouchableOpacity, Animated} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    /** Whether the switch is toggled to the on position */
    isOn: PropTypes.bool.isRequired,

    /** Callback to fire when the switch is toggled */
    onToggle: PropTypes.func.isRequired,
};

class Switch extends Component {
    constructor(props) {
        super(props);
        this.offPosition = 0;
        this.onPosition = 20;
        this.offsetX = new Animated.Value(props.isOn ? this.onPosition : this.offPosition);

        this.toggleSwitch = this.toggleSwitch.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isOn === this.props.isOn) {
            return;
        }

        this.toggleSwitch();
    }

    toggleSwitch() {
        Animated.timing(this.offsetX, {
            toValue: this.props.isOn ? this.onPosition : this.offPosition,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }

    render() {
        const switchTransform = {transform: [{translateX: this.offsetX}]};
        return (
            <TouchableOpacity
                style={[styles.switchTrack, !this.props.isOn && styles.switchInactive]}
                activeOpacity={0.8}
                onPress={() => this.props.onToggle(!this.props.isOn)}
            >
                <Animated.View style={[styles.switchThumb, switchTransform]} />
            </TouchableOpacity>
        );
    }
}

Switch.propTypes = propTypes;

export default Switch;
