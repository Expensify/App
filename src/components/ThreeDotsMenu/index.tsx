import Icon from '@components/Icon';
import type BaseModalProps from '@components/Modal/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {isMobile} from '@libs/Browser';

import type {AnchorPosition} from '@styles/index';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import KeyboardUtils from '@src/utils/keyboard';

import type {ComponentRef} from 'react';

import debounce from 'lodash/debounce';
import React, {useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type ThreeDotsMenuProps from './types';

// Kept at module scope so it is referentially stable — it feeds the effect that repositions an open menu.
const defaultAnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
};

function ThreeDotsMenu({
    iconTooltip = 'common.more',
    icon,
    iconFill,
    iconStyles,
    iconHoverStyle,
    iconWidth,
    iconHeight,
    shouldChangeFillOnOpen = true,
    testID,
    onIconPress = () => {},
    menuItems,
    anchorPosition,
    anchorAlignment = defaultAnchorAlignment,
    getAnchorPosition,
    shouldOverlay = false,
    shouldSetModalVisibility = true,
    disabled = false,
    hideProductTrainingTooltip,
    renderProductTrainingTooltipContent,
    shouldShowProductTrainingTooltip = false,
    isNested = false,
    shouldSelfPosition = false,
    threeDotsMenuRef,
    sentryLabel,
    isContainerFocused = true,
}: ThreeDotsMenuProps) {
    const [modal] = useOnyx(ONYXKEYS.MODAL);

    const theme = useTheme();
    const styles = useThemeStyles();
    const [isPopupMenuVisible, setPopupMenuVisible] = useState(false);
    const [restoreFocusType, setRestoreFocusType] = useState<BaseModalProps['restoreFocusType']>();
    const [position, setPosition] = useState<AnchorPosition>();
    const buttonRef = useRef<ComponentRef<typeof View>>(null);
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ThreeDots']);
    const isBehindModal = modal?.willAlertModalBecomeVisible && !modal?.isPopover && !shouldOverlay;
    const {windowWidth, windowHeight} = useWindowDimensions();
    const showPopoverMenu = () => {
        setPopupMenuVisible(true);
    };

    const hidePopoverMenu = useCallback((selectedItem?: PopoverMenuItem) => {
        if (selectedItem?.shouldKeepModalOpen || selectedItem?.shouldCloseModalOnSelect === false) {
            return;
        }
        setPopupMenuVisible(false);
    }, []);

    const {calculatePopoverPosition} = usePopoverPosition();

    const calculateAndSetThreeDotsMenuPosition = useCallback(() => calculatePopoverPosition(buttonRef, anchorAlignment), [anchorAlignment, calculatePopoverPosition]);

    const getMenuPosition = shouldSelfPosition ? calculateAndSetThreeDotsMenuPosition : getAnchorPosition;

    const onThreeDotsPress = () => {
        if (isPopupMenuVisible) {
            hidePopoverMenu();
            return;
        }
        hideProductTrainingTooltip?.();
        buttonRef.current?.blur();

        // Dismiss the keyboard before opening the menu so the menu doesn't
        // render while the keyboard is still animating closed (which creates
        // a blank-space flash on mobile web).
        onIconPress?.();

        const openMenu = () => {
            if (getMenuPosition) {
                getMenuPosition?.().then((value) => {
                    setPosition(value);
                    showPopoverMenu();
                });
            } else {
                showPopoverMenu();
            }
        };

        // On mobile web, wait for the keyboard to fully close before opening the menu.
        // KeyboardUtils.dismiss() uses visualViewport to detect keyboard state and resolves
        // immediately if the keyboard is not open. On desktop, call openMenu() synchronously
        // to preserve the original behavior (avoids async microtask deferral on desktop Chrome).
        if (isMobile()) {
            KeyboardUtils.dismiss().then(openMenu);
        } else {
            openMenu();
        }
    };

    useImperativeHandle(threeDotsMenuRef as React.RefObject<{hidePopoverMenu: () => void; isPopupMenuVisible: boolean; onThreeDotsPress: () => void}> | undefined, () => ({
        isPopupMenuVisible,
        hidePopoverMenu,
        onThreeDotsPress,
    }));
    useEffect(() => {
        if ((!isBehindModal || !isPopupMenuVisible) && isContainerFocused) {
            return;
        }
        hidePopoverMenu();
    }, [hidePopoverMenu, isBehindModal, isPopupMenuVisible, isContainerFocused]);

    useLayoutEffect(() => {
        if (!getMenuPosition || !isPopupMenuVisible) {
            return;
        }

        // Debounce so a resize collapses into a single measurement taken after the layout has settled.
        // Measuring on every intermediate dimension tick can read the anchor's pre-resize coordinates
        // (the anchor may live in a virtualized list that re-lays out after the resize) and pin the open
        // menu to where the button used to be.
        const debouncedSetMenuPosition = debounce(() => {
            getMenuPosition().then((value) => {
                setPosition(value);
            });
        }, CONST.TIMING.RESIZE_DEBOUNCE_TIME);
        debouncedSetMenuPosition();

        return () => debouncedSetMenuPosition.cancel();
    }, [windowWidth, windowHeight, getMenuPosition, isPopupMenuVisible]);

    const getIconFill = () => {
        if (!shouldChangeFillOnOpen) {
            return iconFill ?? theme.icon;
        }
        return (iconFill ?? isPopupMenuVisible) ? theme.success : theme.icon;
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
                        style={[styles.touchableButtonImage, styles.threeDotsMenuIconWidth, iconStyles]}
                        hoverStyle={iconHoverStyle}
                        role={CONST.ROLE.BUTTON}
                        isNested={isNested}
                        accessibilityLabel={translate(iconTooltip)}
                        sentryLabel={sentryLabel}
                        testID={testID}
                    >
                        <Icon
                            src={icon ?? expensifyIcons.ThreeDots}
                            fill={getIconFill()}
                            width={iconWidth}
                            height={iconHeight}
                        />
                    </PressableWithoutFeedback>
                </TooltipToRender>
            </View>
            <PopoverMenu
                onClose={hidePopoverMenu}
                onModalHide={() => setRestoreFocusType(undefined)}
                isVisible={isPopupMenuVisible && !isBehindModal && isContainerFocused}
                anchorPosition={position ?? anchorPosition ?? {horizontal: 0, vertical: 0}}
                anchorAlignment={anchorAlignment}
                onItemSelected={(item) => {
                    setRestoreFocusType(CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE);
                    hidePopoverMenu(item);
                }}
                menuItems={menuItems}
                withoutOverlay={!shouldOverlay}
                shouldSetModalVisibility={shouldSetModalVisibility}
                anchorRef={buttonRef}
                shouldEnableNewFocusManagement
                // The button blurs itself before opening and is not a text input, so ComposerFocusManager has nothing to restore — the trap has to return focus.
                shouldReturnFocus
                restoreFocusType={restoreFocusType}
                enableEdgeToEdgeBottomSafeAreaPadding
            />
        </>
    );
}

export default ThreeDotsMenu;
