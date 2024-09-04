import React, {useRef} from 'react';
import {createPortal} from 'react-dom';
import Modal from '@components/Modal';
import {PopoverContext} from '@components/PopoverProvider';
import PopoverWithoutOverlay from '@components/PopoverWithoutOverlay';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import TooltipRefManager from '@libs/TooltipRefManager';
import CONST from '@src/CONST';
import type {PopoverProps} from './types';

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */

function Popover(props: PopoverProps) {
    const {
        isVisible,
        onClose,
        fullscreen,
        animationInTiming = CONST.ANIMATED_TRANSITION,
        onLayout,
        animationOutTiming,
        disableAnimation = true,
        withoutOverlay = false,
        anchorPosition = {},
        anchorRef = () => {},
        animationIn = 'fadeIn',
        animationOut = 'fadeOut',
        shouldCloseWhenBrowserNavigationChanged = true,
    } = props;

    const {isSmallScreenWidth} = useResponsiveLayout();
    const withoutOverlayRef = useRef(null);
    const {close, popover} = React.useContext(PopoverContext);

    // Not adding this inside the PopoverProvider
    // because this is an issue on smaller screens as well.
    React.useEffect(() => {
        if (!shouldCloseWhenBrowserNavigationChanged) {
            return;
        }
        const listener = () => {
            if (!isVisible) {
                return;
            }
            onClose();
        };
        window.addEventListener('popstate', listener);
        return () => {
            window.removeEventListener('popstate', listener);
        };
    }, [onClose, isVisible, shouldCloseWhenBrowserNavigationChanged]);

    const onCloseWithPopoverContext = () => {
        if (popover && 'current' in anchorRef) {
            close(anchorRef);
        }
        TooltipRefManager.hideTooltip();
        onClose();
    };

    if (!fullscreen && !isSmallScreenWidth) {
        return createPortal(
            <Modal
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                onClose={onCloseWithPopoverContext}
                type={CONST.MODAL.MODAL_TYPE.POPOVER}
                popoverAnchorPosition={anchorPosition}
                animationInTiming={disableAnimation ? 1 : animationInTiming}
                animationOutTiming={disableAnimation ? 1 : animationOutTiming}
                shouldCloseOnOutsideClick
                onLayout={onLayout}
                animationIn={animationIn}
                animationOut={animationOut}
            />,
            document.body,
        );
    }

    if (withoutOverlay && !isSmallScreenWidth) {
        return createPortal(
            <PopoverWithoutOverlay
                // eslint-disable-next-line react/jsx-props-no-spreading
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
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onClose={onCloseWithPopoverContext}
            shouldHandleNavigationBack={props.shouldHandleNavigationBack}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.POPOVER}
            popoverAnchorPosition={isSmallScreenWidth ? undefined : anchorPosition}
            fullscreen={isSmallScreenWidth ? true : fullscreen}
            animationInTiming={disableAnimation && !isSmallScreenWidth ? 1 : animationInTiming}
            animationOutTiming={disableAnimation && !isSmallScreenWidth ? 1 : animationOutTiming}
            onLayout={onLayout}
            animationIn={animationIn}
            animationOut={animationOut}
        />
    );
}

Popover.displayName = 'Popover';

export default Popover;
