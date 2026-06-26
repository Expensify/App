import React, {useRef} from 'react';
import {createPortal} from 'react-dom';
import Modal from '@components/Modal';
import {usePopoverActions, usePopoverState} from '@components/PopoverProvider';
import PopoverWithoutOverlay from '@components/PopoverWithoutOverlay';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';
import subscribeToRootNavigation from '@libs/Navigation/helpers/subscribeToRootNavigation';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import TooltipRefManager from '@libs/TooltipRefManager';
import CONST from '@src/CONST';
import type PopoverProps from './types';

const DISABLED_ANIMATION_DURATION = 1;

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */

function Popover(props: PopoverProps) {
    const {
        isVisible,
        onClose,
        fullscreen,
        onLayout,
        animationOutTiming,
        animationInTiming = CONST.MENU_ANIMATION_DURATION,
        disableAnimation = true,
        withoutOverlay = false,
        anchorPosition = {},
        anchorRef = () => {},
        animationIn = 'fadeIn',
        animationOut = 'fadeOut',
        shouldCloseWhenBrowserNavigationChanged = true,
        enableEdgeToEdgeBottomSafeAreaPadding,
    } = props;

    // We need to use isSmallScreenWidth to apply the correct modal type and popoverAnchorPosition
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const withoutOverlayRef = useRef(null);
    const {popover} = usePopoverState();
    const {close} = usePopoverActions();
    const {isSidePanelTransitionEnded} = useSidePanelState();

    // This useEffect handles hiding popovers when SidePanel is animating.
    React.useEffect(() => {
        if (isSidePanelTransitionEnded || isSmallScreenWidth || !isVisible) {
            return;
        }
        onClose?.();
    }, [onClose, isSidePanelTransitionEnded, isSmallScreenWidth, isVisible]);

    // Not adding this inside the PopoverProvider
    // because this is an issue on smaller screens as well.
    React.useEffect(() => {
        // When this Popover manages its own back-guard (`shouldHandleNavigationBack`), the Modal-level
        // history sync (useSyncModalWithHistory) closes it on browser Back and consumes the entry. This
        // listener only covers the other case: dismissing the popover when the active navigation route
        // changes, without intercepting that navigation.
        //
        // We subscribe to React Navigation state events rather than raw `popstate` so that
        // `navigationRef.getCurrentRoute()` is already fresh when the callback fires. Sentinel-only
        // history changes (e.g. a nested YearPickerModal opening/closing) do NOT change the focused
        // route key, so the calendar popover stays open. A real navigation away changes the key and
        // closes the popover.
        if (!shouldCloseWhenBrowserNavigationChanged || props.shouldHandleNavigationBack || !isVisible) {
            return;
        }

        let isActive = true;
        let baselineKey: string | undefined;
        let baselineParamsStr: string | undefined;
        // Holds the unsubscribe function once the subscription is set up asynchronously.
        const unsubscribeRef: {current: (() => void) | undefined} = {current: undefined};

        Navigation.isNavigationReady().then(() => {
            if (!isActive) {
                return;
            }
            const initialRoute = navigationRef.getCurrentRoute();
            baselineKey = initialRoute?.key;
            baselineParamsStr = JSON.stringify(initialRoute?.params);
            unsubscribeRef.current = subscribeToRootNavigation(() => {
                if (!isActive || baselineKey === undefined) {
                    return;
                }
                const currentRoute = navigationRef.getCurrentRoute();
                if (currentRoute?.key !== baselineKey || JSON.stringify(currentRoute?.params) !== baselineParamsStr) {
                    onClose?.();
                }
            });
        });

        return () => {
            isActive = false;
            unsubscribeRef.current?.();
        };
    }, [onClose, isVisible, shouldCloseWhenBrowserNavigationChanged, props.shouldHandleNavigationBack]);

    const onCloseWithPopoverContext = () => {
        if (popover && 'current' in anchorRef) {
            close(anchorRef);
        }
        TooltipRefManager.hideTooltip();
        onClose?.();
    };

    if (!fullscreen && !shouldUseNarrowLayout) {
        return createPortal(
            <Modal
                {...props}
                onClose={onCloseWithPopoverContext}
                type={CONST.MODAL.MODAL_TYPE.POPOVER}
                popoverAnchorPosition={anchorPosition}
                animationInTiming={disableAnimation ? DISABLED_ANIMATION_DURATION : animationInTiming}
                animationOutTiming={disableAnimation ? DISABLED_ANIMATION_DURATION : animationOutTiming}
                onLayout={onLayout}
                animationIn={animationIn}
                animationOut={animationOut}
                enableEdgeToEdgeBottomSafeAreaPadding={enableEdgeToEdgeBottomSafeAreaPadding}
            />,
            document.body,
        );
    }

    if (withoutOverlay && !shouldUseNarrowLayout) {
        return createPortal(
            <PopoverWithoutOverlay
                {...props}
                withoutOverlayRef={withoutOverlayRef}
                animationIn={animationIn}
                animationOut={animationOut}
            />,
            document.body,
        );
    }

    return (
        <Modal
            {...props}
            onClose={onCloseWithPopoverContext}
            shouldHandleNavigationBack={props.shouldHandleNavigationBack}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.POPOVER}
            popoverAnchorPosition={isSmallScreenWidth ? undefined : anchorPosition}
            fullscreen={shouldUseNarrowLayout ? true : fullscreen}
            animationInTiming={disableAnimation && !shouldUseNarrowLayout ? DISABLED_ANIMATION_DURATION : animationInTiming}
            animationOutTiming={disableAnimation && !shouldUseNarrowLayout ? DISABLED_ANIMATION_DURATION : animationOutTiming}
            onLayout={onLayout}
            animationIn={animationIn}
            animationOut={animationOut}
            enableEdgeToEdgeBottomSafeAreaPadding={enableEdgeToEdgeBottomSafeAreaPadding}
        />
    );
}

export default Popover;
