import React, {useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Role, Text, View as ViewType} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import variables from '@styles/variables';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import Icon from './Icon';
import {PressableWithoutFeedback} from './Pressable';
import Tooltip from './Tooltip';

type FloatingReceiptButtonProps = WithSentryLabel & {
    /* Callback to fire on request to toggle the FloatingReceiptButton */
    onPress: (event: GestureResponderEvent | KeyboardEvent | undefined) => void;

    /* An accessibility label for the button */
    accessibilityLabel: string;

    /* An accessibility role for the button */
    role: Role;
};

function FloatingReceiptButton({onPress, accessibilityLabel, role, sentryLabel}: FloatingReceiptButtonProps) {
    const {successHover, textLight} = useTheme();
    const styles = useThemeStyles();
    const borderRadius = styles.floatingActionButton.borderRadius;
    const fabPressable = useRef<HTMLDivElement | ViewType | Text | null>(null);
    const icons = useMemoizedLazyExpensifyIcons(['ReceiptPlus']);
    const {translate} = useLocalize();

    const toggleFabAction = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        // Drop focus to avoid blue focus ring.
        fabPressable.current?.blur();
        onPress(event);
    };

    return (
        <Tooltip text={translate('tabSelector.scan')}>
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
                sentryLabel={sentryLabel}
            >
                {({hovered}) => (
                    <View
                        style={[styles.floatingActionButton, {borderRadius}, styles.floatingActionButtonSmall, hovered && {backgroundColor: successHover}]}
                        testID="floating-receipt-button-container"
                    >
                        <Icon
                            fill={textLight}
                            src={icons.ReceiptPlus}
                            width={variables.iconSizeSmall}
                            height={variables.iconSizeSmall}
                        />
                    </View>
                )}
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default FloatingReceiptButton;
