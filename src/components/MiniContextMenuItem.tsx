import React from 'react';
import type {PressableStateCallbackType} from 'react-native';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import DomUtils from '@libs/DomUtils';
import getButtonState from '@libs/getButtonState';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import Icon from './Icon';
import type {PressableRef} from './Pressable/GenericPressable/types';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Tooltip from './Tooltip/PopoverAnchorTooltip';

type MiniContextMenuItemProps = WithSentryLabel & {
    /**
     * Text to display when hovering the menu item
     */
    tooltipText: string;

    /**
     * Callback to fire on press
     */
    onPress: () => void;

    /**
     * The children to display within the menu item.
     * Used when custom rendering is needed (e.g. overflow button).
     * Mutually exclusive with `icon`.
     */
    children?: React.ReactNode | ((state: PressableStateCallbackType) => React.ReactNode);

    /**
     * Icon to display. When provided, the component renders an Icon internally
     * instead of using children.
     */
    icon?: IconAsset;

    /**
     * Icon to show after a successful press. Requires `icon` to be set.
     * When provided, the component manages a throttled success state internally.
     */
    successIcon?: IconAsset;

    /**
     * Tooltip text to show during the success state.
     */
    successTooltipText?: string;

    /**
     * Whether the button should be in the active state
     */
    isDelayButtonStateComplete?: boolean;
    /**
     * Can be used to control the click event, and for example whether or not to lose focus from the composer when pressing the item
     */
    shouldPreventDefaultFocusOnPress?: boolean;

    /**
     * Reference to the outer element
     */
    ref?: PressableRef;
};

/**
 * Component that renders a mini context menu item with a
 * pressable. Also renders a tooltip when hovering the item.
 */
function MiniContextMenuItem({
    tooltipText,
    onPress,
    children,
    icon,
    successIcon,
    successTooltipText,
    isDelayButtonStateComplete = true,
    shouldPreventDefaultFocusOnPress = true,
    ref,
    sentryLabel,
}: MiniContextMenuItemProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isThrottledButtonActive, setThrottledButtonInactive] = useThrottledButtonState();

    const showSuccessState = !!successIcon && !isThrottledButtonActive;
    const displayIcon = showSuccessState ? successIcon : icon;
    const displayTooltip = showSuccessState && successTooltipText ? successTooltipText : tooltipText;
    const isComplete = showSuccessState || isDelayButtonStateComplete;

    const handlePress = () => {
        if (successIcon && !isThrottledButtonActive) {
            return;
        }
        onPress();
        if (successIcon) {
            setThrottledButtonInactive();
        }
    };

    return (
        <Tooltip
            text={displayTooltip}
            shouldRender
        >
            <PressableWithoutFeedback
                ref={ref}
                onPress={icon ? handlePress : onPress}
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
                accessibilityLabel={displayTooltip}
                role={CONST.ROLE.BUTTON}
                sentryLabel={sentryLabel}
                style={({hovered, pressed}) => [
                    styles.reportActionContextMenuMiniButton,
                    StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed, isComplete), true),
                    isComplete && styles.cursorDefault,
                ]}
            >
                {(pressableState) => (
                    <View style={[StyleUtils.getWidthAndHeightStyle(variables.iconSizeNormal), styles.alignItemsCenter, styles.justifyContentCenter]}>
                        {!!displayIcon && (
                            <Icon
                                small
                                src={displayIcon}
                                fill={StyleUtils.getIconFillColor(getButtonState(pressableState.hovered, pressableState.pressed, showSuccessState))}
                            />
                        )}
                        {!displayIcon && (typeof children === 'function' ? children(pressableState) : children)}
                    </View>
                )}
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default MiniContextMenuItem;
