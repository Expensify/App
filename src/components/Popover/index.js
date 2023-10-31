import React, {useRef} from 'react';
import {createPortal} from 'react-dom';
import Modal from '@components/Modal';
import {PopoverContext} from '@components/PopoverProvider';
import PopoverWithoutOverlay from '@components/PopoverWithoutOverlay';
import withWindowDimensions from '@components/withWindowDimensions';
import CONST from '@src/CONST';
import {defaultProps, propTypes} from './popoverPropTypes';

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
function Popover(props) {
    const {isVisible, onClose, isSmallScreenWidth, fullscreen, animationInTiming, onLayout, animationOutTiming, disableAnimation, withoutOverlay, anchorPosition, anchorRef} = props;
    const withoutOverlayRef = useRef(null);
    const {close, popover} = React.useContext(PopoverContext);

    // Not adding this inside the PopoverProvider
    // because this is an issue on smaller screens as well.
    React.useEffect(() => {
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
    }, [onClose, isVisible]);

    const onCloseWithPopoverContext = () => {
        if (popover) {
            close(anchorRef);
        }
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
            />,
            document.body,
        );
    }

    return (
        <Modal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onClose={onCloseWithPopoverContext}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.POPOVER}
            popoverAnchorPosition={isSmallScreenWidth ? undefined : anchorPosition}
            fullscreen={isSmallScreenWidth ? true : fullscreen}
            animationInTiming={disableAnimation && !isSmallScreenWidth ? 1 : animationInTiming}
            animationOutTiming={disableAnimation && !isSmallScreenWidth ? 1 : animationOutTiming}
            onLayout={onLayout}
        />
    );
}

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default withWindowDimensions(Popover);
