import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import useNativeDriver from '@libs/useNativeDriver';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

type SwitchProps = {
    /** Whether the switch is toggled to the on position */
    isOn: boolean;

    /** Callback to fire when the switch is toggled */
    onToggle: (isOn: boolean) => void;

    /** Accessibility label for the switch */
    accessibilityLabel: string;
};

const OFFSET_X = {
    OFF: 0,
    ON: 20,
};

function Switch({isOn, onToggle, accessibilityLabel}: SwitchProps) {
    const styles = useThemeStyles();
    const offsetX = useRef(new Animated.Value(isOn ? OFFSET_X.ON : OFFSET_X.OFF));

    useEffect(() => {
        Animated.timing(offsetX.current, {
            toValue: isOn ? OFFSET_X.ON : OFFSET_X.OFF,
            duration: 300,
            useNativeDriver,
        }).start();
    }, [isOn]);

    return (
        <PressableWithFeedback
            style={[styles.switchTrack, !isOn && styles.switchInactive]}
            onPress={() => onToggle(!isOn)}
            onLongPress={() => onToggle(!isOn)}
            role={CONST.ACCESSIBILITY_ROLE.SWITCH}
            aria-checked={isOn}
            accessibilityLabel={accessibilityLabel}
            // disable hover dim for switch
            hoverDimmingValue={1}
            pressDimmingValue={0.8}
        >
            <Animated.View style={[styles.switchThumb, styles.switchThumbTransformation(offsetX.current)]} />
        </PressableWithFeedback>
    );
}

Switch.displayName = 'Switch';
export default Switch;
