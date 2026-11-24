import usePopoverPosition from '@hooks/usePopoverPosition';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import {useRef, useState} from 'react';

/** The switcher opens above its trigger, with their left edges aligned. */
const SUPPORTAL_SWITCHER_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

/** Measures the trigger, then opens the switcher at its position. */
function useSupportalSwitcherAnchor(showSwitcher: () => void) {
    const {calculatePopoverPosition} = usePopoverPosition();

    const anchorRef = useRef<HTMLDivElement | null>(null);
    const isOpeningRef = useRef(false);
    const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>({
        horizontal: 0,
        vertical: 0,
    });

    const openSwitcher = () => {
        // The switcher only counts as open once the measurement resolves, so a second press before then must not start another one.
        if (isOpeningRef.current) {
            return;
        }
        isOpeningRef.current = true;
        calculatePopoverPosition(anchorRef, SUPPORTAL_SWITCHER_ANCHOR_ALIGNMENT)
            .then(({horizontal, vertical}) => {
                setAnchorPosition({horizontal, vertical});
                showSwitcher();
            })
            .finally(() => {
                isOpeningRef.current = false;
            });
    };

    return {anchorRef, anchorPosition, openSwitcher};
}

export default useSupportalSwitcherAnchor;
export {SUPPORTAL_SWITCHER_ANCHOR_ALIGNMENT};
