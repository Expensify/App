import FormHelpMessage from '@components/FormHelpMessage';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

type MenuItemFormMessageProps = {
    /** The message to display */
    children: string | ReactNode;

    /** Whether the message is styled as an error */
    isError: boolean;

    /** Should the red dot indicator be shown next to the message */
    shouldShowRedDotIndicator?: boolean;

    /** Whether the message should be rendered as HTML */
    shouldRenderAsHTML?: boolean;

    /** Any additional styles to apply to the message */
    style?: StyleProp<ViewStyle>;
};

/**
 * Shared internals of `MenuItem.Error` and `MenuItem.Hint` — not exported from the barrel.
 */
function MenuItemFormMessage({children, isError, shouldShowRedDotIndicator = false, shouldRenderAsHTML = false, style}: MenuItemFormMessageProps) {
    const styles = useThemeStyles();

    return (
        <FormHelpMessage
            isError={isError}
            shouldShowRedDotIndicator={shouldShowRedDotIndicator}
            message={children}
            style={[styles.menuItemError, style]}
            shouldRenderMessageAsHTML={shouldRenderAsHTML}
        />
    );
}

MenuItemFormMessage.displayName = 'MenuItemFormMessage';

export type {MenuItemFormMessageProps};
export default MenuItemFormMessage;
