import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import useNativeDriver from '@libs/useNativeDriver';
import CONST from '@src/CONST';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

type SwitchProps = {
    /** Whether the switch is toggled to the on position */
    isOn: boolean;

    /** Callback to fire when the switch is toggled */
    onToggle: (isOn: boolean) => void;

    /** Accessibility label for the switch */
    accessibilityLabel: string;

    /** Whether the menu item should be interactive at all */
    interactive?: boolean;
};

const OFFSET_X = {
    OFF: 0,
    ON: 20,
};

function Switch({isOn, onToggle, accessibilityLabel, interactive = true}: SwitchProps) {
    const styles = useThemeStyles();
    const offsetX = useRef(new Animated.Value(isOn ? OFFSET_X.ON : OFFSET_X.OFF));

    useEffect(() => {
        Animated.timing(offsetX.current, {
            toValue: isOn ? OFFSET_X.ON : OFFSET_X.OFF,
            duration: 300,
            useNativeDriver,
        }).start();
    }, [isOn]);

    const onPressOrLongPressAction = () => {
        if (!interactive) {
            return;
        }

        onToggle(!isOn);
    };

    return (
        <PressableWithFeedback
            style={[styles.switchTrack, !isOn && styles.switchInactive && styles.cursorDefault, !interactive && styles.cursorDefault]}
            onPress={onPressOrLongPressAction}
            onLongPress={onPressOrLongPressAction}
            role={CONST.ROLE.SWITCH}
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
