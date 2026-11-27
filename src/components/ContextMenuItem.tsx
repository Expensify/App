import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getButtonState from '@libs/getButtonState';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {WithRequiredSentryLabel} from '@src/types/utils/SentryLabel';

import type {ComponentRef} from 'react';
import type {GestureResponderEvent, StyleProp, View, ViewStyle} from 'react-native';

import React, {useEffect, useRef} from 'react';

import BaseMiniContextMenuItem from './BaseMiniContextMenuItem';
import FocusableMenuItem from './FocusableMenuItem';
import Icon from './Icon';

type ContextMenuItemProps = WithRequiredSentryLabel & {
    icon: IconAsset;
    text: string;

    /** Icon to show when interaction was successful */
    successIcon?: IconAsset;

    /** Text to show when interaction was successful */
    successText?: string;

    /** Whether to show the mini menu */
    isMini?: boolean;

    /** False or a rejected promise leaves the item available for retry. */
    onPress: (event?: GestureResponderEvent | MouseEvent | KeyboardEvent) => boolean | void | Promise<boolean | void>;

    /** A description text to show under the title */
    description?: string;

    /** The action accept for anonymous user or not */
    isAnonymousAction?: boolean;

    isFocused?: boolean;
    shouldLimitWidth?: boolean;

    /** Styles to apply to MenuItem wrapper */
    wrapperStyle?: StyleProp<ViewStyle>;

    shouldPreventDefaultFocusOnPress?: boolean;

    /** The ref of mini context menu item */
    buttonRef?: React.RefObject<ComponentRef<typeof View> | null>;

    onFocus?: () => void;

    /** Handles what to do when the item loose focus */
    onBlur?: () => void;

    disabled?: boolean;
    shouldShowLoadingSpinnerIcon?: boolean;
};

function ContextMenuItem({
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
    sentryLabel,
}: ContextMenuItemProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();
    const [isThrottledButtonActive, setThrottledButtonInactive] = useThrottledButtonState();
    const isPendingRef = useRef(false);
    const isMountedRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const triggerPressAndUpdateSuccess = async (event?: GestureResponderEvent | MouseEvent | KeyboardEvent) => {
        if (!isThrottledButtonActive || isPendingRef.current) {
            return;
        }
        isPendingRef.current = true;
        try {
            const didSucceed = await onPress(event);
            if (didSucceed !== false && (successIcon || successText) && isMountedRef.current) {
                setThrottledButtonInactive();
            }
        } catch {
            // A failed action must not show success or delay a retry.
        }
        isPendingRef.current = false;
    };

    const itemIcon = !isThrottledButtonActive && successIcon ? successIcon : icon;
    const itemText = !isThrottledButtonActive && successText ? successText : text;

    return isMini ? (
        <BaseMiniContextMenuItem
            ref={buttonRef}
            tooltipText={itemText}
            onPress={(event?: GestureResponderEvent | MouseEvent | KeyboardEvent) => {
                triggerPressAndUpdateSuccess(event);
            }}
            isDelayButtonStateComplete={!isThrottledButtonActive}
            shouldPreventDefaultFocusOnPress={shouldPreventDefaultFocusOnPress}
            sentryLabel={sentryLabel}
        >
            {({hovered, pressed}) => (
                <Icon
                    size={CONST.ICON_SIZE.SMALL}
                    src={itemIcon}
                    fill={StyleUtils.getIconFillColor({buttonState: getButtonState({isActive: hovered, isPressed: pressed, isComplete: !isThrottledButtonActive})})}
                />
            )}
        </BaseMiniContextMenuItem>
    ) : (
        <FocusableMenuItem
            title={itemText}
            icon={itemIcon}
            onPress={triggerPressAndUpdateSuccess}
            wrapperStyle={[styles.pr8, wrapperStyle]}
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
            sentryLabel={sentryLabel}
        />
    );
}

export default ContextMenuItem;
