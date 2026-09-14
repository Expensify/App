import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import withViewportOffsetTop from '@components/withViewportOffsetTop';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useKeyboardState from '@hooks/useKeyboardState';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import usePopstateListener from '@hooks/usePopstateListener';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import subscribeToRootNavigation from '@libs/Navigation/helpers/subscribeToRootNavigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import KeyboardUtils from '@src/utils/keyboard';

import type {ReactNode, RefObject} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import {useIsFocused} from '@react-navigation/core';
import {willAlertModalBecomeVisibleSelector} from '@selectors/Modal';
import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';

type PopoverComponentProps = {
    isExpanded: boolean;
    closeOverlay: () => void;
    setPopoverWidth?: (width: number | undefined) => void;
};

type ButtonComponentProps = {
    onPress: () => void;
    ref: RefObject<View | null>;
    isExpanded: boolean;
};

type FilterPopupButtonProps = {
    viewportOffsetTop: number;
    wrapperStyle?: StyleProp<ViewStyle>;
    popoverWidth?: number;
    popoverAnchorAlignment?: AnchorAlignment;
    PopoverComponent: (props: PopoverComponentProps) => ReactNode;
    renderButton: (props: ButtonComponentProps) => ReactNode;

    /** Exposes an imperative `open` (same code path as pressing the button), e.g. for the saved-view "Edit filters" flow */
    handleRef?: RefObject<FilterPopupButtonHandle | null>;

    /** Called whenever the popover closes (click-outside, Cancel, Save or browser back) so the caller can leave any associated edit mode */
    onOverlayClose?: (isClosedByBrowserNavigation?: boolean) => void;

    /** Called after a browser back/forward while the popover is open; return true to close it (in-app pushes/pops never trigger this) */
    shouldCloseOnBrowserNavigation?: () => boolean;
};

type FilterPopupButtonHandle = {
    /** Opens the popover, bypassing the transient modal-transition guard (e.g. the LHN 3-dot menu is still closing) */
    open: () => void;
};

const ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

// Fallback wait after a popstate in case the navigation state event fired before our listener ran.
const POPSTATE_SETTLE_TIME_MS = 1000;

function FilterPopupButton({
    viewportOffsetTop,
    popoverWidth,
    wrapperStyle,
    popoverAnchorAlignment: popoverAnchorAlignmentProp,
    PopoverComponent,
    renderButton,
    handleRef,
    onOverlayClose,
    shouldCloseOnBrowserNavigation,
}: FilterPopupButtonProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHP and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const styles = useThemeStyles();
    const {isKeyboardActive} = useKeyboardState();
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: isSmallScreenWidth && !isKeyboardActive});
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const triggerRef = useRef<View | null>(null);
    const anchorRef = useRef<View | null>(null);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    // Defer mounting the (potentially heavy) popover content until the dropdown is first opened, then keep it
    // mounted so the close animation and reopening stay instant. The content is otherwise mounted eagerly on
    // screen focus even while hidden, which runs each filter selector's expensive option-building on page load.
    const [hasEverExpanded, setHasEverExpanded] = useState(false);
    const [customPopoverWidth, setCustomPopoverWidth] = useState<number | undefined>(undefined);
    const {calculatePopoverPosition} = usePopoverPosition();

    const [popoverTriggerPosition, setPopoverTriggerPosition] = useState({
        horizontal: 0,
        vertical: 0,
    });

    const [willAlertModalBecomeVisible] = useOnyx(ONYXKEYS.MODAL, {selector: willAlertModalBecomeVisibleSelector});

    const popoverAnchorAlignment = popoverAnchorAlignmentProp ?? ANCHOR_ORIGIN;

    const openOverlay = (shouldBypassAlertModalCheck = false) => {
        if (willAlertModalBecomeVisible && !shouldBypassAlertModalCheck) {
            return;
        }
        // Dismiss the keyboard before opening the popover. On Android, if a search input is still focused, the
        // keyboard stays up. The bottom-docked popover's KeyboardAvoidingView then reserves keyboard-height
        // padding, so the sheet renders mid-screen instead of at the bottom. dismissKeyboardAndExecute waits for
        // keyboardDidHide on Android before running the callback; on other platforms it runs immediately.
        KeyboardUtils.dismissKeyboardAndExecute(() => {
            calculatePopoverPosition(anchorRef, popoverAnchorAlignment).then((position) => {
                setPopoverTriggerPosition({...position, vertical: position.vertical});
                // Latch in the same batch as the open so the deferred subtree mounts together with the popover becoming visible.
                setHasEverExpanded(true);
                setIsOverlayVisible(true);
            });
        });
    };

    const closeOverlay = () => {
        setIsOverlayVisible(false);
        onOverlayClose?.();
    };

    const toggleOverlay = () => {
        if (isOverlayVisible) {
            closeOverlay();
            return;
        }
        openOverlay();
    };

    // Imperative open — the same code path as pressing the button, bypassing the transient modal-transition guard.
    useImperativeHandle(handleRef, () => ({open: () => openOverlay(true)}));

    // Close on browser back/forward when the caller confirms the navigation left the popover's context (in-app
    // pushes/pops never fire popstate here, so e.g. RHP year pickers keep the popover open).
    const shouldCloseOnBrowserNavigationRef = useRef(shouldCloseOnBrowserNavigation);
    const onOverlayCloseRef = useRef(onOverlayClose);
    const isOverlayVisibleRef = useRef(isOverlayVisible);
    useEffect(() => {
        shouldCloseOnBrowserNavigationRef.current = shouldCloseOnBrowserNavigation;
        onOverlayCloseRef.current = onOverlayClose;
        isOverlayVisibleRef.current = isOverlayVisible;
    });
    // If the component unmounts while the popover is open (e.g. the screen remounts on browser back), end the caller's
    // edit session too — otherwise its state would outlive the popover.
    useEffect(
        () => () => {
            if (!isOverlayVisibleRef.current) {
                return;
            }
            onOverlayCloseRef.current?.(true);
        },
        [],
    );
    usePopstateListener(isOverlayVisible && !!shouldCloseOnBrowserNavigation, () => {
        // Capture the pre-navigation check now (its closure holds the pre-back query), then evaluate it on the next
        // navigation state event — or on a fallback timer in case that event already fired before this listener ran.
        const didNavigateAway = shouldCloseOnBrowserNavigationRef.current;
        if (!didNavigateAway) {
            return;
        }
        let isDone = false;
        let unsubscribe: (() => void) | undefined;
        let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
        const evaluate = () => {
            if (isDone) {
                return;
            }
            isDone = true;
            unsubscribe?.();
            clearTimeout(fallbackTimer);
            if (!isOverlayVisibleRef.current || !didNavigateAway()) {
                return;
            }
            setIsOverlayVisible(false);
            onOverlayCloseRef.current?.(true);
        };
        unsubscribe = subscribeToRootNavigation(evaluate);
        fallbackTimer = setTimeout(evaluate, POPSTATE_SETTLE_TIME_MS);
    });

    const actualPopoverWidth = customPopoverWidth ?? popoverWidth ?? CONST.POPOVER_DROPDOWN_WIDTH;
    const containerStyles = isSmallScreenWidth ? styles.w100 : {width: actualPopoverWidth};

    const popoverContent = PopoverComponent({closeOverlay, isExpanded: isOverlayVisible, setPopoverWidth: setCustomPopoverWidth});

    return (
        <View
            ref={anchorRef}
            style={wrapperStyle}
        >
            {/* Dropdown Trigger */}
            {renderButton({ref: triggerRef, onPress: toggleOverlay, isExpanded: isOverlayVisible})}
            {/* Dropdown overlay. Gated on hasEverExpanded so the (potentially heavy) content subtree isn't mounted
                until the dropdown is first opened — PopoverWithMeasuredContentBase mounts children even while hidden. */}
            {isFocused && hasEverExpanded && (
                <PopoverWithMeasuredContent
                    anchorRef={triggerRef}
                    avoidKeyboard
                    isVisible={isOverlayVisible}
                    onClose={closeOverlay}
                    anchorPosition={popoverTriggerPosition}
                    anchorAlignment={popoverAnchorAlignment}
                    restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
                    shouldEnableNewFocusManagement
                    shouldMeasureAnchorPositionFromTop={false}
                    outerStyle={{...StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop), ...containerStyles}}
                    // This must be false because we dont want the modal to close if we open the RHP for selections
                    // such as date years
                    shouldCloseWhenBrowserNavigationChanged={false}
                    innerContainerStyle={{...containerStyles, ...styles.p0}}
                    popoverDimensions={{
                        width: actualPopoverWidth,
                        height: CONST.POPOVER_DROPDOWN_MIN_HEIGHT,
                    }}
                    shouldSkipRemeasurement
                    shouldDisplayBelowModals
                    shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
                    enableEdgeToEdgeBottomSafeAreaPadding
                >
                    <View style={bottomSafeAreaPaddingStyle}>{popoverContent}</View>
                </PopoverWithMeasuredContent>
            )}
        </View>
    );
}

export type {PopoverComponentProps, ButtonComponentProps, FilterPopupButtonProps, FilterPopupButtonHandle};
export default withViewportOffsetTop(FilterPopupButton);
