import React, {useEffect, useMemo} from 'react';
import Animated, {interpolateColor, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Icon from './Icon';
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
    const {translate} = useLocalize();
    const offsetX = useSharedValue(isOn ? OFFSET_X.ON : OFFSET_X.OFF);
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lock']);

    useEffect(() => {
        offsetX.set(withTiming(isOn ? OFFSET_X.ON : OFFSET_X.OFF, {duration: 300}));
    }, [isOn, offsetX]);

    const handleSwitchPress = () => {
        requestAnimationFrame(() => {
            if (disabled) {
                disabledAction?.();
                return;
            }
            onToggle(!isOn);
        });
    };

    const animatedThumbStyle = useAnimatedStyle(() => ({
        transform: [{translateX: offsetX.get()}],
    }));

    const animatedSwitchTrackStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(offsetX.get(), [OFFSET_X.OFF, OFFSET_X.ON], [theme.icon, theme.success]),
    }));

    // Enhance accessibility label to include locked state when disabled
    const enhancedAccessibilityLabel = useMemo(() => {
        if (disabled) {
            return `${accessibilityLabel}, ${translate('common.locked')}`;
        }
        return accessibilityLabel;
    }, [accessibilityLabel, disabled, translate]);

    return (
        <PressableWithFeedback
            disabled={!disabledAction && disabled}
            onPress={handleSwitchPress}
            onLongPress={handleSwitchPress}
            role={CONST.ROLE.SWITCH}
            aria-checked={isOn}
            accessibilityLabel={enhancedAccessibilityLabel}
            // disable hover dim for switch
            hoverDimmingValue={1}
            pressDimmingValue={0.8}
            sentryLabel={enhancedAccessibilityLabel}
        >
            <Animated.View style={[styles.switchTrack, animatedSwitchTrackStyle]}>
                <Animated.View style={[styles.switchThumb, animatedThumbStyle]}>
                    {(!!disabled || !!showLockIcon) && (
                        <Icon
                            src={expensifyIcons.Lock}
                            fill={isOn ? theme.text : theme.icon}
                            width={styles.toggleSwitchLockIcon.width}
                            height={styles.toggleSwitchLockIcon.height}
                        />
                    )}
                </Animated.View>
            </Animated.View>
        </PressableWithFeedback>
    );
}

export default Switch;
