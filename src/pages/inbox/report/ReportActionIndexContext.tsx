import type {PropsWithChildren} from 'react';

import {createContext, useMemo} from 'react';

type ReportActionPosition = {
    index: number;
    isNewest: boolean;
};

/**
 * Carries an action item's position from the list renderer down to the rare consumers that
 * actually need it (e.g. `ReportActionItemMessageEdit` for scrolling during edit mode).
 *
 * Using context keeps position data out of the prop signatures of every intermediate component, so
 * a shift caused by a new message arriving doesn't cascade re-renders through items that never read
 * it. Only components that `useContext(ReportActionIndexContext)` re-render on change.
 */
const ReportActionIndexContext = createContext<ReportActionPosition>({index: 0, isNewest: true});

/** Lets shared list implementations provide their own reliable way to reach the newest action. */
const ReportActionScrollToNewestContext = createContext<(() => void) | undefined>(undefined);

function ReportActionPositionContextProvider({children, index, isNewest}: PropsWithChildren<ReportActionPosition>) {
    const value = useMemo(() => ({index, isNewest}), [index, isNewest]);

    return <ReportActionIndexContext.Provider value={value}>{children}</ReportActionIndexContext.Provider>;
}

export {ReportActionPositionContextProvider, ReportActionScrollToNewestContext};
export default ReportActionIndexContext;
