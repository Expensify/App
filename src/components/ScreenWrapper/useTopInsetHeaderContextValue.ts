import {useContext, useState} from 'react';

import type {ScreenWrapperTopInsetHeaderContextType} from './ScreenWrapperTopInsetHeaderContext';

import ScreenWrapperStatusContext from './ScreenWrapperStatusContext';
import ScreenWrapperTopInsetHeaderContext from './ScreenWrapperTopInsetHeaderContext';

/**
 * Tracks the headers of a screen that ask to place themselves in the top inset (see useTopInsetHeaderStyle) and gives the
 * inset to the first of them only. A header further down the screen, like the one the date filter shows below the advanced
 * filters header, asks too, but must stay below the inset with its own height.
 *
 * A ScreenWrapper nested in one that already pads the top inset passes its headers' requests up to that one, because the
 * outer screen is the one that has to leave the inset out of its padding.
 */

type TopInsetHeaderContextValue = {
    /** Whether a header took the top inset over, so the screen leaves it out of its padding */
    isHeaderInTopInset: boolean;

    /** The value the screen provides to its headers through ScreenWrapperTopInsetHeaderContext */
    topInsetHeaderContextValue: ScreenWrapperTopInsetHeaderContextType;
};

/** Returns whether the screen leaves its top inset to a header, and the context value its headers ask for the inset through */
function useTopInsetHeaderContextValue(includePaddingTop: boolean): TopInsetHeaderContextValue {
    // Read from the ScreenWrapper around this one, if any (this hook runs outside the providers of its own screen)
    const parentTopInsetHeaderContext = useContext(ScreenWrapperTopInsetHeaderContext);
    const isParentPaddingTopInset = !!useContext(ScreenWrapperStatusContext)?.isSafeAreaTopPaddingApplied;

    // The headers in the order they asked. Headers ask from a layout effect, and those run in the order the components
    // appear on the screen, so the header at the top asks first even when a header below it mounts in the same commit.
    const [headerIDs, setHeaderIDs] = useState<string[]>([]);
    // Kept in state so it never changes identity, otherwise a header's layout effect would register again on every render.
    const [registerTopInsetHeader] = useState(() => (headerID: string) => {
        setHeaderIDs((ids) => [...ids, headerID]);
        return () => setHeaderIDs((ids) => ids.filter((id) => id !== headerID));
    });

    // The outer screen already pads the top inset and the nested one adds no padding of its own, so a header of the nested
    // screen that kept the request here would sit below the outer padding with the inset layout on top of it.
    if (parentTopInsetHeaderContext && isParentPaddingTopInset) {
        return {
            isHeaderInTopInset: parentTopInsetHeaderContext.topInsetHeaderID !== undefined,
            topInsetHeaderContextValue: parentTopInsetHeaderContext,
        };
    }

    const topInsetHeaderID = includePaddingTop ? headerIDs.at(0) : undefined;

    return {
        isHeaderInTopInset: topInsetHeaderID !== undefined,
        topInsetHeaderContextValue: {topInsetHeaderID, registerTopInsetHeader},
    };
}

export default useTopInsetHeaderContextValue;
