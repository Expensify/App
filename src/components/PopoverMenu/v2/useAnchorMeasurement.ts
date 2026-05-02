import {useEffect, useState} from 'react';
import usePopoverPosition from '@hooks/usePopoverPosition';
import Log from '@libs/Log';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type {AnchorRef} from './RootContext';
import useOnValueChange from './useOnValueChange';

/** Returns measured anchor position; uses `anchorPositionProp` if set, else measures `anchorRef`. `null` until ready. */
function useAnchorMeasurement({
    anchorRef,
    anchorPositionProp,
    anchorAlignment,
    isVisible,
}: {
    anchorRef: AnchorRef;
    anchorPositionProp?: AnchorPosition;
    anchorAlignment: AnchorAlignment;
    isVisible: boolean;
}): AnchorPosition | null {
    const {calculatePopoverPosition} = usePopoverPosition();
    const [measured, setMeasured] = useState<AnchorPosition | null>(null);
    const [hasFreshMeasurement, setHasFreshMeasurement] = useState(false);

    // On reopen, invalidate the cache so the modal waits for a fresh measurement instead of flashing the old anchor.
    useOnValueChange(isVisible, (next) => {
        if (!next || anchorPositionProp) {
            return;
        }
        setHasFreshMeasurement(false);
    });

    useEffect(() => {
        if (anchorPositionProp || !anchorRef.current || !isVisible) {
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
    }, [isVisible, anchorRef, calculatePopoverPosition, anchorAlignment, anchorPositionProp]);

    if (anchorPositionProp) {
        return anchorPositionProp;
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

export default useAnchorMeasurement;
