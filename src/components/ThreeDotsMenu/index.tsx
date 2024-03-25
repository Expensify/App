import React, {useEffect, useRef, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Browser from '@libs/Browser';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnchorPosition} from '@src/styles';
import type {Modal} from '@src/types/onyx';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type IconAsset from '@src/types/utils/IconAsset';

type ThreeDotsMenuOnyxProps = {
    /** Details about any modals being used */
    modal: OnyxEntry<Modal>;
};

type ThreeDotsMenuProps = ThreeDotsMenuOnyxProps & {
    /** Tooltip for the popup icon */
    iconTooltip?: TranslationPaths;

    /** icon for the popup trigger */
    icon?: IconAsset;

    /** Any additional styles to pass to the icon container. */
    iconStyles?: StyleProp<ViewStyle>;

    /** The fill color to pass into the icon. */
    iconFill?: string;

    /** Function to call on icon press */
    onIconPress?: () => void;

    /** menuItems that'll show up on toggle of the popup menu */
    menuItems: PopoverMenuItem[];

    /** The anchor position of the menu */
    anchorPosition: AnchorPosition;

    /** The anchor alignment of the menu */
    anchorAlignment?: AnchorAlignment;

    /** Whether the popover menu should overlay the current view */
    shouldOverlay?: boolean;

    /** Whether the menu is disabled */
    disabled?: boolean;

    /** Should we announce the Modal visibility changes? */
    shouldSetModalVisibility?: boolean;
};

function ThreeDotsMenu({
    iconTooltip = 'common.more',
    icon = Expensicons.ThreeDots,
    iconFill,
    iconStyles,
    onIconPress = () => {},
    menuItems,
    anchorPosition,
    anchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    shouldOverlay = false,
    shouldSetModalVisibility = true,
    disabled = false,
    modal = {},
}: ThreeDotsMenuProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [isPopupMenuVisible, setPopupMenuVisible] = useState(false);
    const buttonRef = useRef<HTMLDivElement | null>(null);
    const {translate} = useLocalize();
    const isBehindModal = modal?.willAlertModalBecomeVisible && !modal?.isPopover && !shouldOverlay;

    const showPopoverMenu = () => {
        setPopupMenuVisible(true);
    };

    const hidePopoverMenu = () => {
        setPopupMenuVisible(false);
    };

    useEffect(() => {
        if (!isBehindModal || !isPopupMenuVisible) {
            return;
        }
        hidePopoverMenu();
    }, [isBehindModal, isPopupMenuVisible]);

    return (
        <>
            <View>
                <Tooltip text={translate(iconTooltip)}>
                    <PressableWithoutFeedback
                        onPress={() => {
                            if (isPopupMenuVisible) {
                                hidePopoverMenu();
                                return;
                            }
                            buttonRef.current?.blur();
                            showPopoverMenu();
                            if (onIconPress) {
                                onIconPress();
                            }
                        }}
                        disabled={disabled}
                        onMouseDown={(e) => {
                            /* Keep the focus state on mWeb like we did on the native apps. */
                            if (!Browser.isMobile()) {
                                return;
                            }
                            e.preventDefault();
                        }}
                        ref={buttonRef}
                        style={[styles.touchableButtonImage, iconStyles]}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate(iconTooltip)}
                    >
                        <Icon
                            src={icon}
                            fill={iconFill ?? theme.icon}
                        />
                    </PressableWithoutFeedback>
                </Tooltip>
            </View>
            <PopoverMenu
                onClose={hidePopoverMenu}
                isVisible={isPopupMenuVisible && !isBehindModal}
                anchorPosition={anchorPosition}
                anchorAlignment={anchorAlignment}
                onItemSelected={hidePopoverMenu}
                menuItems={menuItems}
                withoutOverlay={!shouldOverlay}
                shouldSetModalVisibility={shouldSetModalVisibility}
                anchorRef={buttonRef}
            />
        </>
    );
}

ThreeDotsMenu.displayName = 'ThreeDotsMenu';

export default withOnyx<ThreeDotsMenuProps, ThreeDotsMenuOnyxProps>({
    modal: {
        key: ONYXKEYS.MODAL,
    },
})(ThreeDotsMenu);
