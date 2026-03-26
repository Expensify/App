import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import {AccessibilityInfo, View} from 'react-native';
import type {View as RNView} from 'react-native';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Accessibility from '@libs/Accessibility';
import {close} from '@libs/actions/Modal';
import {isSafari} from '@libs/Browser';
import getPlatform from '@libs/getPlatform';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import CONST from '@src/CONST';
import FABFirstItemRefContext from './FABFirstItemRefContext';
import {FABMenuContext} from './FABMenuContext';

const FAB_ITEM_ORDER = [
    CONST.FAB_MENU_ITEM_IDS.EXPENSE,
    CONST.FAB_MENU_ITEM_IDS.TRACK_DISTANCE,
    CONST.FAB_MENU_ITEM_IDS.CREATE_REPORT,
    CONST.FAB_MENU_ITEM_IDS.NEW_CHAT,
    CONST.FAB_MENU_ITEM_IDS.INVOICE,
    CONST.FAB_MENU_ITEM_IDS.TRAVEL,
    CONST.FAB_MENU_ITEM_IDS.TEST_DRIVE,
    CONST.FAB_MENU_ITEM_IDS.NEW_WORKSPACE,
    CONST.FAB_MENU_ITEM_IDS.QUICK_ACTION,
] as const;

const MAX_FIRST_MENU_ITEM_FOCUS_RETRIES = 5;
const FIRST_MENU_ITEM_NATIVE_FOCUS_RETRY_DELAY_MS = 50;

type FABPopoverMenuProps = {
    isVisible: boolean;
    onClose: () => void;
    onItemSelected: () => void;
    anchorRef: RefObject<View | HTMLDivElement | null>;
    animationInTiming?: number;
    animationOutTiming?: number;
    children: React.ReactNode;
};

function FABPopoverMenu({isVisible, onClose, onItemSelected, anchorRef, animationInTiming, animationOutTiming, children}: FABPopoverMenuProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const anchorPosition = styles.createMenuPositionSidebar(windowHeight);
    const platform = getPlatform();
    const isWeb = platform === CONST.PLATFORM.WEB;
    const isAndroid = platform === CONST.PLATFORM.ANDROID;
    const isIOS = platform === CONST.PLATFORM.IOS;
    const shouldDeferDismissButtonAccessibility = isIOS;

    const [registeredSet, setRegisteredSet] = useState<ReadonlySet<string>>(new Set());
    const firstItemRef = useRef<RNView>(null);
    const isVisibleRef = useRef(isVisible);
    const hasFocusedFirstItemOnCurrentOpenRef = useRef(false);
    const firstMenuItemFocusRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [shouldEnableBottomDockedDismissAccessibility, setShouldEnableBottomDockedDismissAccessibility] = useState(!shouldDeferDismissButtonAccessibility);

    const registeredItems = FAB_ITEM_ORDER.filter((id) => registeredSet.has(id));
    const itemCount = registeredItems.length;

    const registerItem = (id: string) => {
        setRegisteredSet((prev) => {
            if (prev.has(id)) {
                return prev;
            }
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const unregisterItem = (id: string) => {
        setRegisteredSet((prev) => {
            if (!prev.has(id)) {
                return prev;
            }
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        maxIndex: itemCount - 1,
        isActive: isVisible,
    });

    const clearScheduledFirstMenuItemFocus = useCallback(() => {
        if (!firstMenuItemFocusRetryTimeoutRef.current) {
            return;
        }

        clearTimeout(firstMenuItemFocusRetryTimeoutRef.current);
        firstMenuItemFocusRetryTimeoutRef.current = null;
    }, []);

    const markFirstMenuItemUnfocused = useCallback(() => {
        clearScheduledFirstMenuItemFocus();
        hasFocusedFirstItemOnCurrentOpenRef.current = false;
        if (shouldDeferDismissButtonAccessibility) {
            setShouldEnableBottomDockedDismissAccessibility(false);
        }
    }, [clearScheduledFirstMenuItemFocus, shouldDeferDismissButtonAccessibility]);

    useEffect(() => {
        isVisibleRef.current = isVisible;
        if (isVisible) {
            return;
        }
        markFirstMenuItemUnfocused();
    }, [isVisible]);

    useEffect(
        () => () => {
            clearScheduledFirstMenuItemFocus();
        },
        [clearScheduledFirstMenuItemFocus],
    );

    const handleClose = () => {
        setFocusedIndex(-1);
        onClose();
    };

    const onItemPress = (onSelected: () => void, options?: {shouldCallAfterModalHide?: boolean}) => {
        onItemSelected();
        if (options?.shouldCallAfterModalHide && !isSafari()) {
            close(() => {
                navigateAfterInteraction(onSelected);
            });
        } else {
            navigateAfterInteraction(onSelected);
        }
        setFocusedIndex(-1);
    };

    const getFirstMenuItemTarget = useCallback(() => {
        if (!isVisibleRef.current || hasFocusedFirstItemOnCurrentOpenRef.current) {
            return null;
        }

        return firstItemRef.current;
    }, []);

    const markFirstMenuItemFocused = useCallback(() => {
        clearScheduledFirstMenuItemFocus();
        hasFocusedFirstItemOnCurrentOpenRef.current = true;
        if (shouldDeferDismissButtonAccessibility) {
            setShouldEnableBottomDockedDismissAccessibility(true);
        }
    }, [clearScheduledFirstMenuItemFocus, shouldDeferDismissButtonAccessibility]);

    const focusFirstMenuItemOnWeb = useCallback(() => {
        const target = getFirstMenuItemTarget();
        if (!target || !('focus' in target) || typeof target.focus !== 'function') {
            return false;
        }

        target.focus();
        markFirstMenuItemFocused();
        return true;
    }, [getFirstMenuItemTarget, markFirstMenuItemFocused]);

    const focusFirstMenuItemOnNative = useCallback(() => {
        const target = getFirstMenuItemTarget();
        if (!target) {
            return false;
        }

        const sendAccessibilityEvent = AccessibilityInfo.sendAccessibilityEvent;
        if (sendAccessibilityEvent && isAndroid) {
            sendAccessibilityEvent(target, 'viewHoverEnter');
        }

        Accessibility.moveAccessibilityFocus(firstItemRef);
        if (!shouldDeferDismissButtonAccessibility) {
            markFirstMenuItemFocused();
        }
        return true;
    }, [getFirstMenuItemTarget, isAndroid, markFirstMenuItemFocused, shouldDeferDismissButtonAccessibility]);

    const focusFirstMenuItem = useCallback(() => {
        if (isWeb) {
            return focusFirstMenuItemOnWeb();
        }

        return focusFirstMenuItemOnNative();
    }, [focusFirstMenuItemOnNative, focusFirstMenuItemOnWeb, isWeb]);

    const scheduleFocusFirstMenuItemOnWeb = useCallback(() => {
        const focusFirstMenuItemWithRetries = (retries = MAX_FIRST_MENU_ITEM_FOCUS_RETRIES) => {
            if (!isVisibleRef.current || hasFocusedFirstItemOnCurrentOpenRef.current) {
                return;
            }

            if (focusFirstMenuItem()) {
                return;
            }

            if (retries <= 0) {
                return;
            }

            requestAnimationFrame(() => focusFirstMenuItemWithRetries(retries - 1));
        };

        requestAnimationFrame(() => focusFirstMenuItemWithRetries());
    }, [focusFirstMenuItem]);

    const scheduleFocusFirstMenuItemOnNative = useCallback(() => {
        const focusFirstMenuItemWithRetries = (retries = MAX_FIRST_MENU_ITEM_FOCUS_RETRIES) => {
            requestAnimationFrame(() => {
                if (!isVisibleRef.current || hasFocusedFirstItemOnCurrentOpenRef.current) {
                    return;
                }

                focusFirstMenuItem();

                if (!shouldDeferDismissButtonAccessibility || hasFocusedFirstItemOnCurrentOpenRef.current) {
                    return;
                }

                if (retries <= 0) {
                    markFirstMenuItemFocused();
                    return;
                }

                firstMenuItemFocusRetryTimeoutRef.current = setTimeout(() => {
                    firstMenuItemFocusRetryTimeoutRef.current = null;
                    focusFirstMenuItemWithRetries(retries - 1);
                }, FIRST_MENU_ITEM_NATIVE_FOCUS_RETRY_DELAY_MS);
            });
        };

        clearScheduledFirstMenuItemFocus();
        firstMenuItemFocusRetryTimeoutRef.current = setTimeout(() => {
            firstMenuItemFocusRetryTimeoutRef.current = null;
            focusFirstMenuItemWithRetries();
        }, isIOS ? (animationInTiming ?? 0) : 0);
    }, [animationInTiming, clearScheduledFirstMenuItemFocus, focusFirstMenuItem, isIOS, markFirstMenuItemFocused, shouldDeferDismissButtonAccessibility]);

    const scheduleFocusFirstMenuItem = useCallback(() => {
        if (isWeb) {
            scheduleFocusFirstMenuItemOnWeb();
            return;
        }

        scheduleFocusFirstMenuItemOnNative();
    }, [isWeb, scheduleFocusFirstMenuItemOnNative, scheduleFocusFirstMenuItemOnWeb]);

    const handleModalShow = useCallback(() => {
        if (!shouldUseNarrowLayout) {
            return;
        }

        scheduleFocusFirstMenuItem();
    }, [scheduleFocusFirstMenuItem, shouldUseNarrowLayout]);

    useEffect(() => {
        if (!isVisible || !shouldUseNarrowLayout || hasFocusedFirstItemOnCurrentOpenRef.current) {
            return;
        }

        scheduleFocusFirstMenuItem();
    }, [isVisible, scheduleFocusFirstMenuItem, shouldUseNarrowLayout]);

    useEffect(() => {
        if (!isVisible || !shouldDeferDismissButtonAccessibility || focusedIndex !== 0 || hasFocusedFirstItemOnCurrentOpenRef.current) {
            return;
        }

        markFirstMenuItemFocused();
    }, [focusedIndex, isVisible, markFirstMenuItemFocused, shouldDeferDismissButtonAccessibility]);

    return (
        <FABMenuContext.Provider
            value={{
                focusedIndex,
                setFocusedIndex,
                onItemPress,
                isVisible,
                registeredItems,
                registerItem,
                unregisterItem,
            }}
        >
            <FABFirstItemRefContext.Provider value={firstItemRef}>
                <PopoverWithMeasuredContent
                    anchorPosition={anchorPosition}
                    anchorRef={anchorRef}
                    anchorAlignment={{
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                    }}
                    onClose={handleClose}
                    isVisible={isVisible}
                    onModalShow={handleModalShow}
                    fromSidebarMediumScreen={!shouldUseNarrowLayout}
                    animationIn="fadeIn"
                    animationOut="fadeOut"
                    animationInTiming={animationInTiming}
                    animationOutTiming={animationOutTiming}
                    disableAnimation={false}
                    shouldHandleNavigationBack
                    shouldEnableBottomDockedDismissAccessibility={shouldDeferDismissButtonAccessibility ? shouldEnableBottomDockedDismissAccessibility : undefined}
                    innerContainerStyle={styles.pv0}
                >
                    <FocusTrapForModal
                        active={isVisible}
                        shouldReturnFocus
                    >
                        <View style={shouldUseNarrowLayout ? styles.flexGrow1 : [styles.createMenuContainer, styles.pv0, styles.flex1]}>
                            <View style={styles.pv4}>{children}</View>
                        </View>
                    </FocusTrapForModal>
                </PopoverWithMeasuredContent>
            </FABFirstItemRefContext.Provider>
        </FABMenuContext.Provider>
    );
}

export default FABPopoverMenu;
