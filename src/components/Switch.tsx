import React, {useEffect, useRef} from 'react';
import {Animated, InteractionManager} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useNativeDriver from '@libs/useNativeDriver';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

type SwitchProps = {
    /** Whether the switch is toggled to the on position */
    isOn: boolean;

    /** Callback to fire when the switch is toggled */
    onToggle: (isOn: boolean) => void;

    /** Accessibility label for the switch */
    accessibilityLabel: string;

    /** Whether the switch is disabled */
    disabled?: boolean;

    /** Whether to show the lock icon even if the switch is enabled */
    showLockIcon?: boolean;

    /** Callback to fire when the switch is toggled in disabled state */
    disabledAction?: () => void;
};

const OFFSET_X = {
    OFF: 0,
    ON: 20,
};

function Switch({isOn, onToggle, accessibilityLabel, disabled, showLockIcon, disabledAction}: SwitchProps) {
    const styles = useThemeStyles();
    const offsetX = useRef(new Animated.Value(isOn ? OFFSET_X.ON : OFFSET_X.OFF));
    const theme = useTheme();

    const handleSwitchPress = () => {
        InteractionManager.runAfterInteractions(() => {
            if (disabled) {
                disabledAction?.();
                return;
            }
            onToggle(!isOn);
        });
    };

    useEffect(() => {
        Animated.timing(offsetX.current, {
            toValue: isOn ? OFFSET_X.ON : OFFSET_X.OFF,
            duration: 300,
            useNativeDriver,
        }).start();
    }, [isOn]);

    return (
        <PressableWithFeedback
            disabled={!disabledAction && disabled}
            style={[styles.switchTrack, !isOn && styles.switchInactive]}
            onPress={handleSwitchPress}
            onLongPress={handleSwitchPress}
            role={CONST.ROLE.SWITCH}
            aria-checked={isOn}
            accessibilityLabel={accessibilityLabel}
            // disable hover dim for switch
            hoverDimmingValue={1}
            pressDimmingValue={0.8}
        >
            <Animated.View style={[styles.switchThumb, styles.switchThumbTransformation(offsetX.current)]}>
                {(!!disabled || !!showLockIcon) && (
                    <Icon
                        src={Expensicons.Lock}
                        fill={isOn ? theme.text : theme.icon}
                        width={styles.toggleSwitchLockIcon.width}
                        height={styles.toggleSwitchLockIcon.height}
                    />
                )}
            </Animated.View>
        </PressableWithFeedback>
    );
}

Switch.displayName = 'Switch';
export default Switch;
