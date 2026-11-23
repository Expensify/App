import {useState} from 'react';

import type {ScreenWrapperTopInsetHeaderContextType} from './ScreenWrapperTopInsetHeaderContext';

/**
 * Tracks the headers of a screen that ask to place themselves in the top inset (see useTopInsetHeaderStyle) and gives the
 * inset to the first of them only. A header further down the screen, like the one the date filter shows below the advanced
 * filters header, asks too, but must stay below the inset with its own height.
 */

type TopInsetHeaderContextValue = {
    /** Whether a header took the top inset over, so the screen leaves it out of its padding */
    isHeaderInTopInset: boolean;

    /** The value the screen provides to its headers through ScreenWrapperTopInsetHeaderContext */
    topInsetHeaderContextValue: ScreenWrapperTopInsetHeaderContextType;
};

/** Returns whether the screen leaves its top inset to a header, and the context value its headers ask for the inset through */
function useTopInsetHeaderContextValue(includePaddingTop: boolean): TopInsetHeaderContextValue {
    // The headers in the order they asked. Headers ask from a layout effect, and those run in the order the components
    // appear on the screen, so the header at the top asks first even when a header below it mounts in the same commit.
    const [headerIDs, setHeaderIDs] = useState<string[]>([]);
    // Kept in state so it never changes identity, otherwise a header's layout effect would register again on every render.
    const [registerTopInsetHeader] = useState(() => (headerID: string) => {
        setHeaderIDs((ids) => [...ids, headerID]);
        return () => setHeaderIDs((ids) => ids.filter((id) => id !== headerID));
    });
    const topInsetHeaderID = includePaddingTop ? headerIDs.at(0) : undefined;

    return {
        isHeaderInTopInset: topInsetHeaderID !== undefined,
        topInsetHeaderContextValue: {topInsetHeaderID, registerTopInsetHeader},
    };
}

export default useTopInsetHeaderContextValue;
