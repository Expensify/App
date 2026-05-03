import {useEffect, useState} from 'react';
import type {ActiveAnchor, AnchorRect, AnchorRef} from '@components/PopoverMenu/v2/root/RootContext';
import usePopoverPosition from '@hooks/usePopoverPosition';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import useOnValueChange from './useOnValueChange';

/** Source-precedence: `anchorPositionProp` (event coords) > `activeAnchor` (Trigger sync rect) > `anchorRef` (legacy async). */
function useAnchorMeasurement({
    activeAnchor,
    anchorRef,
    anchorPositionProp,
    anchorAlignment,
    isVisible,
}: {
    activeAnchor: ActiveAnchor | null;
    anchorRef: AnchorRef | null;
    anchorPositionProp?: AnchorPosition;
    anchorAlignment: AnchorAlignment;
    isVisible: boolean;
}): AnchorPosition | null {
    const {calculatePopoverPosition} = usePopoverPosition();
    const [measured, setMeasured] = useState<AnchorPosition | null>(null);
    const [hasFreshMeasurement, setHasFreshMeasurement] = useState(false);
    const fromActiveAnchor = activeAnchor ? computeAnchorPositionFromRect(activeAnchor.rect, anchorAlignment) : null;

    // Invalidate cache on reopen so the modal doesn't flash a stale anchor.
    useOnValueChange(isVisible, (next) => {
        if (!next || anchorPositionProp || fromActiveAnchor) {
            return;
        }
        setHasFreshMeasurement(false);
    });

    useEffect(() => {
        if (anchorPositionProp || fromActiveAnchor || !anchorRef?.current || !isVisible) {
            return;
        }
        let cancelled = false;
        calculatePopoverPosition(anchorRef, anchorAlignment)
            .then((next) => {
                if (cancelled) {
                    return;
                }
                setMeasured(next);
                setHasFreshMeasurement(true);
            })
            .catch((error: unknown) => {
                Log.warn('[PopoverMenu.Content] popover position calculation failed', {error: String(error)});
            });
        return () => {
            cancelled = true;
        };
    }, [isVisible, anchorRef, calculatePopoverPosition, anchorAlignment, anchorPositionProp, fromActiveAnchor]);

    if (anchorPositionProp) {
        return anchorPositionProp;
    }
    if (fromActiveAnchor) {
        return fromActiveAnchor;
    }
    // Keep `measured` while closing so the modal hide path renders.
    if (!isVisible) {
        return measured;
    }
    if (!hasFreshMeasurement) {
        return null;
    }
    return measured;
}

/** Sync mirror of the math in `usePopoverPosition.calculatePopoverPosition`. */
function computeAnchorPositionFromRect(rect: AnchorRect, alignment: AnchorAlignment): AnchorPosition {
    const {x, y, width, height} = rect;

    let horizontal: number;
    if (alignment.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT) {
        horizontal = x;
    } else if (alignment.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER) {
        horizontal = x + width / 2;
    } else {
        horizontal = x + width;
    }

    const vertical = alignment.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP ? y + height + CONST.MODAL.POPOVER_MENU_PADDING : y - CONST.MODAL.POPOVER_MENU_PADDING;

    return {horizontal, vertical};
}

export default useAnchorMeasurement;
