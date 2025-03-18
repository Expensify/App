import type {ForwardedRef} from 'react';
import React from 'react';
import type {PressableStateCallbackType} from 'react-native';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import DomUtils from '@libs/DomUtils';
import getButtonState from '@libs/getButtonState';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Tooltip from './Tooltip/PopoverAnchorTooltip';

type BaseMiniContextMenuItemProps = {
    /**
     * Text to display when hovering the menu item
     */
    tooltipText: string;

    /**
     * Callback to fire on press
     */
    onPress: () => void;

    /**
     * The children to display within the menu item
     */
    children: React.ReactNode | ((state: PressableStateCallbackType) => React.ReactNode);

    /**
     * Whether the button should be in the active state
     */
    isDelayButtonStateComplete: boolean;
    /**
     * Can be used to control the click event, and for example whether or not to lose focus from the composer when pressing the item
     */
    shouldPreventDefaultFocusOnPress?: boolean;
};

/**
 * Component that renders a mini context menu item with a
 * pressable. Also renders a tooltip when hovering the item.
 */
function BaseMiniContextMenuItem(
    {tooltipText, onPress, children, isDelayButtonStateComplete = true, shouldPreventDefaultFocusOnPress = true}: BaseMiniContextMenuItemProps,
    ref: ForwardedRef<View>,
) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    return (
        <Tooltip
            text={tooltipText}
            shouldRender
        >
            <PressableWithoutFeedback
                ref={ref}
                onPress={onPress}
                onMouseDown={(event) => {
                    if (!ReportActionComposeFocusManager.isFocused() && !ReportActionComposeFocusManager.isEditFocused()) {
                        const activeElement = DomUtils.getActiveElement();
                        if (activeElement instanceof HTMLElement) {
                            activeElement?.blur();
                        }
                        return;
                    }

                    // Allow text input blur on right click
                    if (!event || event.button === 2) {
                        return;
                    }

                    // Prevent text input blur on left click
                    if (shouldPreventDefaultFocusOnPress) {
                        event.preventDefault();
                    }
                }}
                accessibilityLabel={tooltipText}
                role={CONST.ROLE.BUTTON}
                style={({hovered, pressed}) => [
                    styles.reportActionContextMenuMiniButton,
                    StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed, isDelayButtonStateComplete), true),
                    isDelayButtonStateComplete && styles.cursorDefault,
                ]}
            >
                {(pressableState) => (
                    <View style={[StyleUtils.getWidthAndHeightStyle(variables.iconSizeNormal), styles.alignItemsCenter, styles.justifyContentCenter]}>
                        {typeof children === 'function' ? children(pressableState) : children}
                    </View>
                )}
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

BaseMiniContextMenuItem.displayName = 'BaseMiniContextMenuItem';

export default React.forwardRef(BaseMiniContextMenuItem);
