/** A resizable pane's committed width, clamped to the bounds the window allows. */
import type {PaneWidthOnyxKey} from '@libs/actions/PaneWidth';

import type PaneWidthBounds from '@src/types/utils/PaneWidthBounds';

import lodashClamp from 'lodash/clamp';

import useOnyx from './useOnyx';

/** Clamped at render rather than when saved, so a window that shrinks and grows back returns to the dragged width. */
function usePaneWidth(onyxKey: PaneWidthOnyxKey, defaultWidth: number, {min, max}: PaneWidthBounds): number {
    const [storedWidth] = useOnyx(onyxKey);
    return lodashClamp(storedWidth ?? defaultWidth, min, max);
}

export default usePaneWidth;
