import {useEffect, useState} from 'react';
import usePopoverPosition from '@hooks/usePopoverPosition';
import Log from '@libs/Log';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type {AnchorRef} from './RootContext';

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
            })
            .catch((error: unknown) => {
                Log.warn('[PopoverMenu.Content] popover position calculation failed', {error: String(error)});
            });
        return () => {
            cancelled = true;
        };
    }, [isVisible, anchorRef, calculatePopoverPosition, anchorAlignment, anchorPositionProp]);

    return anchorPositionProp ?? measured;
}

export default useAnchorMeasurement;
