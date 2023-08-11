import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import CONST from '../CONST';
import styles from '../styles/styles';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

const propTypes = {
    /** Whether the switch is toggled to the on position */
    isOn: PropTypes.bool.isRequired,

    /** Callback to fire when the switch is toggled */
    onToggle: PropTypes.func.isRequired,

    /** Accessibility label for the switch */
    accessibilityLabel: PropTypes.string.isRequired,
};

const OFFSET_X = {
    OFF: 0,
    ON: 20,
};

function Switch(props) {
    const offsetX = useRef(new Animated.Value(props.isOn ? OFFSET_X.ON : OFFSET_X.OFF));

    useEffect(() => {
        Animated.timing(offsetX.current, {
            toValue: props.isOn ? OFFSET_X.ON : OFFSET_X.OFF,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [props.isOn]);

    return (
        <PressableWithFeedback
            style={[styles.switchTrack, !props.isOn && styles.switchInactive]}
            onPress={() => props.onToggle(!props.isOn)}
            onLongPress={() => props.onToggle(!props.isOn)}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.SWITCH}
            accessibilityState={{checked: props.isOn}}
            aria-checked={props.isOn}
            accessibilityLabel={props.accessibilityLabel}
            // disable hover dim for switch
            hoverDimmingValue={1}
            pressDimmingValue={0.8}
        >
            <Animated.View style={[styles.switchThumb, styles.switchThumbTransformation(offsetX.current)]} />
        </PressableWithFeedback>
    );
}

Switch.propTypes = propTypes;
Switch.displayName = 'Switch';

export default Switch;
