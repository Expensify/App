/** A resizable pane's committed width, clamped to the bounds the window allows. */
import type {PaneWidthOnyxKey} from '@libs/actions/PaneWidth';

import type Beta from '@src/types/onyx/Beta';
import type PaneWidthBounds from '@src/types/utils/PaneWidthBounds';

import lodashClamp from 'lodash/clamp';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

type PaneWidth = {
    width: number;

    /** Whether the user's beta lets them drag the pane. */
    isResizable: boolean;
};

/** Clamped at render rather than when saved, so a window that shrinks and grows back returns to the dragged width. */
function usePaneWidth(onyxKey: PaneWidthOnyxKey, beta: Beta, defaultWidth: number, {min, max}: PaneWidthBounds): PaneWidth {
    const [storedWidth] = useOnyx(onyxKey);
    const {isBetaEnabled} = usePermissions();
    const isResizable = isBetaEnabled(beta);

    // The beta can turn off without a chance to clear the saved width, and there is no handle to drag it back then.
    if (!isResizable) {
        return {width: defaultWidth, isResizable};
    }

    return {width: lodashClamp(storedWidth ?? defaultWidth, min, max), isResizable};
}

export default usePaneWidth;
