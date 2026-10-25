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

/**
 * FlashList writes an explicit pixel width onto each row after the window has already resized, which moves this
 * button without changing the button's own size. Watch the ancestors that do change size, and report once the button's window rect has actually moved.
 */
function subscribeToAnchorMovement(anchor: HTMLElement, onMove: () => void): () => void {
    if (typeof ResizeObserver === 'undefined') {
        return () => {};
    }

    const initialRect = anchor.getBoundingClientRect();
    let lastLeft = initialRect.left;
    let lastTop = initialRect.top;
    let lastWidth = initialRect.width;
    let lastHeight = initialRect.height;
    let frame = 0;

    const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
            if (!anchor.isConnected) {
                return;
            }
            const nextRect = anchor.getBoundingClientRect();
            if (nextRect.left === lastLeft && nextRect.top === lastTop && nextRect.width === lastWidth && nextRect.height === lastHeight) {
                return;
            }
            lastLeft = nextRect.left;
            lastTop = nextRect.top;
            lastWidth = nextRect.width;
            lastHeight = nextRect.height;
            onMove();
        });
    });

    let node: HTMLElement | null = anchor;
    while (node) {
        observer.observe(node);
        node = node.parentElement;
    }

    return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
    };
}

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
    anchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
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
    const getMenuPositionRef = useRef(getMenuPosition);
    const isPopupMenuVisibleRef = useRef(isPopupMenuVisible);
    // Compared inside the resize effect so opening the menu does not schedule a measurement of its own.
    const windowSizeRef = useRef({windowWidth, windowHeight});

    useLayoutEffect(() => {
        getMenuPositionRef.current = getMenuPosition;
        isPopupMenuVisibleRef.current = isPopupMenuVisible;
    }, [getMenuPosition, isPopupMenuVisible]);

    const refreshAnchorPosition = useCallback(() => {
        const resolvePosition = getMenuPositionRef.current;
        if (!isPopupMenuVisibleRef.current || !resolvePosition) {
            return;
        }
        resolvePosition().then((value) => {
            if (!isPopupMenuVisibleRef.current) {
                return;
            }
            setPosition((previousPosition) => (previousPosition?.horizontal === value.horizontal && previousPosition?.vertical === value.vertical ? previousPosition : value));
        });
    }, []);

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
        // Record resizes that happen while the menu is closed so opening it later is not treated as a resize.
        // While it is open, leave the recorded size unchanged until the deferred measurement runs. Updating it
        // before that would swallow the change when this effect is cleaned up and run again.
        if (!isPopupMenuVisible || !getMenuPositionRef.current) {
            windowSizeRef.current = {windowWidth, windowHeight};
            return;
        }
        if (windowSizeRef.current.windowWidth === windowWidth && windowSizeRef.current.windowHeight === windowHeight) {
            return;
        }

        // The row width lands after this commit, so measuring immediately would store the button's old coordinates.
        const debouncedRefresh = debounce(() => {
            windowSizeRef.current = {windowWidth, windowHeight};
            refreshAnchorPosition();
        }, CONST.TIMING.RESIZE_DEBOUNCE_TIME);
        debouncedRefresh();
        return () => debouncedRefresh.cancel();
    }, [windowWidth, windowHeight, isPopupMenuVisible, refreshAnchorPosition]);

    useEffect(() => {
        if (!isPopupMenuVisible || typeof HTMLElement === 'undefined') {
            return;
        }
        const anchor = buttonRef.current;
        if (!(anchor instanceof HTMLElement)) {
            return;
        }
        return subscribeToAnchorMovement(anchor, refreshAnchorPosition);
    }, [isPopupMenuVisible, refreshAnchorPosition]);

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
