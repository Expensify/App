import {BoundsObserver} from '@react-ng/bounds-observer';
import type {HTMLAttributes} from 'react';
import React, {memo, useCallback, useRef} from 'react';
import type {LayoutRectangle} from 'react-native';
import Hoverable from '@components/Hoverable';
import GenericTooltip from '@components/Tooltip/GenericTooltip';
import type TooltipProps from '@components/Tooltip/types';
import {hasHoverSupport} from '@libs/DeviceCapabilities';

type MouseEvents = {
    onMouseEnter: (e: React.MouseEvent) => void | undefined;
};

const deviceHasHoverSupport = hasHoverSupport();

/**
 * A component used to wrap an element intended for displaying a tooltip. The term "tooltip's target" refers to the
 * wrapped element, which, upon hover, triggers the tooltip to be shown.
 */

/**
 * Choose the correct bounding box for the tooltip to be positioned against.
 * This handles the case where the target is wrapped across two lines, and
 * so we need to find the correct part (the one that the user is hovering
 * over) and show the tooltip there.
 *
 * @param target The DOM element being hovered over.
 * @param clientX The X position from the MouseEvent.
 * @param clientY The Y position from the MouseEvent.
 * @return The chosen bounding box.
 */

function chooseBoundingBox(target: HTMLElement, clientX: number, clientY: number): DOMRect {
    const slop = 5;
    const bbs = target.getClientRects();
    const clientXMin = clientX - slop;
    const clientXMax = clientX + slop;
    const clientYMin = clientY - slop;
    const clientYMax = clientY + slop;

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < bbs.length; i++) {
        const bb = bbs[i];
        if (clientXMin <= bb.right && clientXMax >= bb.left && clientYMin <= bb.bottom && clientYMax >= bb.top) {
            return bb;
        }
    }

    // If no matching bounding box is found, fall back to getBoundingClientRect.
    return target.getBoundingClientRect();
}

function Tooltip({children, shouldHandleScroll = false, isFocused = true, ref, ...props}: TooltipProps) {
    const target = useRef<HTMLElement | null>(null);
    const initialMousePosition = useRef({x: 0, y: 0});

    const updateTargetAndMousePosition = useCallback((e: React.MouseEvent) => {
        if (!(e.currentTarget instanceof HTMLElement)) {
            return;
        }
        target.current = e.currentTarget;
        initialMousePosition.current = {x: e.clientX, y: e.clientY};
    }, []);

    /**
     * Get the tooltip bounding rectangle
     */
    const getBounds = (bounds: DOMRect): LayoutRectangle => {
        if (!target.current) {
            return bounds;
        }
        // Choose a bounding box for the tooltip to target.
        // In the case when the target is a link that has wrapped onto
        // multiple lines, we want to show the tooltip over the part
        // of the link that the user is hovering over.
        return chooseBoundingBox(target.current, initialMousePosition.current.x, initialMousePosition.current.y);
    };

    const updateTargetPositionOnMouseEnter = useCallback(
        (e: React.MouseEvent) => {
            updateTargetAndMousePosition(e);
            if (React.isValidElement(children)) {
                const onMouseEnter = (children.props as MouseEvents).onMouseEnter;
                onMouseEnter?.(e);
            }
        },
        [children, updateTargetAndMousePosition],
    );

    // Skip the tooltip and return the children if the device does not support hovering
    if (!deviceHasHoverSupport) {
        return children;
    }

    // Skip the tooltip and return the children if navigation does not focus.
    if (!isFocused) {
        return children;
    }

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <GenericTooltip {...props}>
            {({isVisible, showTooltip, hideTooltip, updateTargetBounds}) =>
                // Checks if valid element so we can wrap the BoundsObserver around it
                // If not, we just return the primitive children
                React.isValidElement(children) ? (
                    <BoundsObserver
                        enabled={isVisible}
                        onBoundsChange={(bounds) => {
                            updateTargetBounds(getBounds(bounds));
                        }}
                        ref={ref}
                    >
                        <Hoverable
                            onHoverIn={showTooltip}
                            onHoverOut={hideTooltip}
                            shouldHandleScroll={shouldHandleScroll}
                        >
                            {React.cloneElement(
                                children as React.ReactElement<HTMLAttributes<HTMLElement>>,
                                {
                                    onMouseEnter: updateTargetPositionOnMouseEnter,
                                } as HTMLAttributes<HTMLElement>,
                            )}
                        </Hoverable>
                    </BoundsObserver>
                ) : (
                    children
                )
            }
        </GenericTooltip>
    );
}

export default memo(Tooltip);
