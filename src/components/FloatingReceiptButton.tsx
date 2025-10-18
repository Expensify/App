import React, {useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Role, Text, View as ViewType} from 'react-native';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import variables from '@styles/variables';
import Icon from './Icon';
import {ReceiptPlus} from './Icon/Expensicons';
import {PressableWithoutFeedback} from './Pressable';

type FloatingReceiptButtonProps = {
    /* Callback to fire on request to toggle the FloatingReceiptButton */
    onPress: (event: GestureResponderEvent | KeyboardEvent | undefined) => void;

    /* An accessibility label for the button */
    accessibilityLabel: string;

    /* An accessibility role for the button */
    role: Role;
};

function FloatingReceiptButton({onPress, accessibilityLabel, role}: FloatingReceiptButtonProps) {
    const {successHover, textLight} = useTheme();
    const styles = useThemeStyles();
    const borderRadius = styles.floatingActionButton.borderRadius;
    const fabPressable = useRef<HTMLDivElement | ViewType | Text | null>(null);

    const toggleFabAction = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        // Drop focus to avoid blue focus ring.
        fabPressable.current?.blur();
        onPress(event);
    };

    return (
        <PressableWithoutFeedback
            ref={(el) => {
                fabPressable.current = el ?? null;
            }}
            style={[
                styles.navigationTabBarFABItem,

                // Prevent text selection on touch devices (e.g. on long press)
                canUseTouchScreen() && styles.userSelectNone,
            ]}
            accessibilityLabel={accessibilityLabel}
            onPress={toggleFabAction}
            role={role}
            shouldUseHapticsOnLongPress
            testID="floating-receipt-button"
        >
            {({hovered}) => (
                <View
                    style={[styles.floatingActionButton, {borderRadius}, styles.floatingActionButtonSmall, hovered && {backgroundColor: successHover}]}
                    testID="floating-receipt-button-container"
                >
                    <Icon
                        fill={textLight}
                        src={ReceiptPlus}
                        width={variables.iconSizeSmall}
                        height={variables.iconSizeSmall}
                    />
                </View>
            )}
        </PressableWithoutFeedback>
    );
}

FloatingReceiptButton.displayName = 'FloatingReceiptButton';

export default FloatingReceiptButton;
