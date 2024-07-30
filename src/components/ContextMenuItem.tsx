import type {ForwardedRef} from 'react';
import React, {forwardRef, useImperativeHandle} from 'react';
import type {GestureResponderEvent, StyleProp, View, ViewStyle} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getButtonState from '@libs/getButtonState';
import type IconAsset from '@src/types/utils/IconAsset';
import BaseMiniContextMenuItem from './BaseMiniContextMenuItem';
import FocusableMenuItem from './FocusableMenuItem';
import Icon from './Icon';

type ContextMenuItemProps = {
    /** Icon Component */
    icon: IconAsset;

    /** Text to display */
    text: string;

    /** Icon to show when interaction was successful */
    successIcon?: IconAsset;

    /** Text to show when interaction was successful */
    successText?: string;

    /** Whether to show the mini menu */
    isMini?: boolean;

    /** Callback to fire when the item is pressed */
    onPress: (event?: GestureResponderEvent | MouseEvent | KeyboardEvent) => void;

    /** A description text to show under the title */
    description?: string;

    /** The action accept for anonymous user or not */
    isAnonymousAction?: boolean;

    /** Whether the menu item is focused or not */
    isFocused?: boolean;

    /** Whether the width should be limited */
    shouldLimitWidth?: boolean;

    /** Styles to apply to ManuItem wrapper */
    wrapperStyle?: StyleProp<ViewStyle>;

    shouldPreventDefaultFocusOnPress?: boolean;

    /** The ref of mini context menu item */
    buttonRef?: React.RefObject<View>;

    /** Handles what to do when the item is focused */
    onFocus?: () => void;

    /** Handles what to do when the item loose focus */
    onBlur?: () => void;

    /** Whether the menu item is disabled or not */
    disabled?: boolean;

    /** Whether the menu item should show loading icon */
    shouldShowLoadingSpinnerIcon?: boolean;
};

type ContextMenuItemHandle = {
    triggerPressAndUpdateSuccess?: () => void;
};

function ContextMenuItem(
    {
        onPress,
        successIcon,
        successText = '',
        icon,
        text,
        isMini = false,
        description = '',
        isAnonymousAction = false,
        isFocused = false,
        shouldLimitWidth = true,
        wrapperStyle,
        shouldPreventDefaultFocusOnPress = true,
        buttonRef = {current: null},
        onFocus = () => {},
        onBlur = () => {},
        disabled = false,
        shouldShowLoadingSpinnerIcon = false,
    }: ContextMenuItemProps,
    ref: ForwardedRef<ContextMenuItemHandle>,
) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();
    const [isThrottledButtonActive, setThrottledButtonInactive] = useThrottledButtonState();

    const triggerPressAndUpdateSuccess = (event?: GestureResponderEvent | MouseEvent | KeyboardEvent) => {
        if (!isThrottledButtonActive) {
            return;
        }
        onPress(event);

        // We only set the success state when we have icon or text to represent the success state
        // We may want to replace this check by checking the Result from OnPress Callback in future.
        if (!!successIcon || successText) {
            setThrottledButtonInactive();
        }
    };

    useImperativeHandle(ref, () => ({triggerPressAndUpdateSuccess}));

    const itemIcon = !isThrottledButtonActive && successIcon ? successIcon : icon;
    const itemText = !isThrottledButtonActive && successText ? successText : text;

    return isMini ? (
        <BaseMiniContextMenuItem
            ref={buttonRef}
            tooltipText={itemText}
            onPress={triggerPressAndUpdateSuccess}
            isDelayButtonStateComplete={!isThrottledButtonActive}
            shouldPreventDefaultFocusOnPress={shouldPreventDefaultFocusOnPress}
        >
            {({hovered, pressed}) => (
                <Icon
                    small
                    src={itemIcon}
                    fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, !isThrottledButtonActive))}
                />
            )}
        </BaseMiniContextMenuItem>
    ) : (
        <FocusableMenuItem
            title={itemText}
            icon={itemIcon}
            onPress={triggerPressAndUpdateSuccess}
            wrapperStyle={[styles.pr9, wrapperStyle]}
            success={!isThrottledButtonActive}
            description={description}
            descriptionTextStyle={styles.breakWord}
            style={shouldLimitWidth && StyleUtils.getContextMenuItemStyles(windowWidth)}
            isAnonymousAction={isAnonymousAction}
            focused={isFocused}
            interactive={isThrottledButtonActive}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={disabled}
            shouldShowLoadingSpinnerIcon={shouldShowLoadingSpinnerIcon}
        />
    );
}

ContextMenuItem.displayName = 'ContextMenuItem';

export default forwardRef(ContextMenuItem);
export type {ContextMenuItemHandle};
