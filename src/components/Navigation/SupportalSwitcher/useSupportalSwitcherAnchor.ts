import useAnchoredPopoverOpener from '@hooks/useAnchoredPopoverOpener';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

/** The switcher opens above its trigger, with their left edges aligned. */
const SUPPORTAL_SWITCHER_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

/** Measures the trigger, then opens the switcher at its position. */
function useSupportalSwitcherAnchor(showSwitcher: () => void) {
    const {anchorRef, anchorPosition, openPopover} = useAnchoredPopoverOpener<HTMLDivElement>(SUPPORTAL_SWITCHER_ANCHOR_ALIGNMENT, showSwitcher);
    return {anchorRef, anchorPosition, openSwitcher: openPopover};
}

export default useSupportalSwitcherAnchor;
export {SUPPORTAL_SWITCHER_ANCHOR_ALIGNMENT};
