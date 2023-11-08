import React, {ForwardedRef } from 'react';
import {View} from 'react-native';
import DomUtils from '@libs/DomUtils';
import getButtonState from '@libs/getButtonState';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import variables from '@styles/variables';
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
    children: React.ReactNode | ((state: unknown) => React.ReactNode);

    /**
     * Whether the button should be in the active state
     */
    isDelayButtonStateComplete: boolean,
};

/**
 * Component that renders a mini context menu item with a
 * pressable. Also renders a tooltip when hovering the item.
 */
function BaseMiniContextMenuItem({tooltipText, onPress, children, isDelayButtonStateComplete = true}: BaseMiniContextMenuItemProps, ref: ForwardedRef<View>) {
    return (
        <Tooltip text={tooltipText} shouldRender>
            <PressableWithoutFeedback
                ref={ref}
                onPress={onPress}
                onMouseDown={(e) => {
                    if (!ReportActionComposeFocusManager.isFocused() && !ReportActionComposeFocusManager.isEditFocused()) {
                        DomUtils?.getActiveElement()?.blur();
                        return;
                    }

                    // Allow text input blur on right click
                    if (!e || e.button === 2) {
                        return;
                    }

                    // Prevent text input blur on left click
                    e.preventDefault();
                }}
                accessibilityLabel={tooltipText}
                style={({hovered, pressed}) => [
                    styles.reportActionContextMenuMiniButton,
                    StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed, isDelayButtonStateComplete)),
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
