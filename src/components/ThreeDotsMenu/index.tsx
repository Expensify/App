import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobile} from '@libs/Browser';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ThreeDotsMenuProps from './types';

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
    hideProductTrainingTooltip,
    renderProductTrainingTooltipContent,
    shouldShowProductTrainingTooltip = false,
}: ThreeDotsMenuProps) {
    const [modal] = useOnyx(ONYXKEYS.MODAL);

    const theme = useTheme();
    const styles = useThemeStyles();
    const [isPopupMenuVisible, setPopupMenuVisible] = useState(false);
    const buttonRef = useRef<View>(null);
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

    const onThreeDotsPress = () => {
        if (isPopupMenuVisible) {
            hidePopoverMenu();
            return;
        }
        hideProductTrainingTooltip?.();
        buttonRef.current?.blur();
        showPopoverMenu();
        if (onIconPress) {
            onIconPress();
        }
    };

    const TooltipToRender = shouldShowProductTrainingTooltip ? EducationalTooltip : Tooltip;
    const tooltipProps = shouldShowProductTrainingTooltip
        ? {
              renderTooltipContent: renderProductTrainingTooltipContent,
              shouldRender: shouldShowProductTrainingTooltip,
              anchorAlignment: {
                  horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                  vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
              },
              shiftHorizontal: variables.savedSearchShiftHorizontal,
              shiftVertical: variables.savedSearchShiftVertical,
              wrapperStyle: [styles.mh4, styles.pv2, styles.productTrainingTooltipWrapper],
              onTooltipPress: onThreeDotsPress,
          }
        : {text: translate(iconTooltip), shouldRender: true};

    return (
        <>
            <View>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <TooltipToRender {...tooltipProps}>
                    <PressableWithoutFeedback
                        onPress={onThreeDotsPress}
                        disabled={disabled}
                        onMouseDown={(e) => {
                            /* Keep the focus state on mWeb like we did on the native apps. */
                            if (!isMobile()) {
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
                            fill={iconFill ?? isPopupMenuVisible ? theme.success : theme.icon}
                        />
                    </PressableWithoutFeedback>
                </TooltipToRender>
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
                shouldEnableNewFocusManagement
            />
        </>
    );
}

ThreeDotsMenu.displayName = 'ThreeDotsMenu';

export default ThreeDotsMenu;
