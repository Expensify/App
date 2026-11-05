/** A resizable pane's committed width, clamped to the bounds the window allows. */
import type ONYXKEYS from '@src/ONYXKEYS';
import type Beta from '@src/types/onyx/Beta';

import lodashClamp from 'lodash/clamp';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

type PaneWidthOnyxKey = typeof ONYXKEYS.SINGLE_RHP_WIDTH | typeof ONYXKEYS.SIDE_PANEL_WIDTH;

type PaneWidthBounds = {
    min: number;
    max: number;
};

/** Clamped at render rather than when saved, so a window that shrinks and grows back returns to the dragged width. */
function usePaneWidth(onyxKey: PaneWidthOnyxKey, beta: Beta, defaultWidth: number, {min, max}: PaneWidthBounds): number {
    const [storedWidth] = useOnyx(onyxKey);
    const {isBetaEnabled} = usePermissions();

    // The beta can turn off without a chance to clear the saved width, and there is no handle to drag it back then.
    if (!isBetaEnabled(beta)) {
        return defaultWidth;
    }

    return lodashClamp(storedWidth ?? defaultWidth, min, max);
}

export default usePaneWidth;
export type {PaneWidthBounds};
