import type {Dispatch, PropsWithChildren, SetStateAction} from 'react';

import {useRecyclingState} from '@legendapp/list/react-native';
import {createContext, useContext, useState} from 'react';

type ReportActionPosition = {
    index: number;
    isNewest: boolean;
    /** LegendList reuses mounted rows for different actions; their item state must reset when the row is recycled. */
    isRecycling?: boolean;
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

function ReportActionPositionContextProvider({children, index, isNewest, isRecycling}: PropsWithChildren<ReportActionPosition>) {
    return <ReportActionIndexContext.Provider value={{index, isNewest, isRecycling}}>{children}</ReportActionIndexContext.Provider>;
}

/** Uses LegendList's recycling-aware state in the main report list and useState in shared, non-recycled lists. */
function useReportActionItemState<State>(initialState: State | (() => State)): [State, Dispatch<SetStateAction<State>>] {
    const {isRecycling = false} = useContext(ReportActionIndexContext);
    const state = useState(initialState);
    const recyclingState = useRecyclingState(initialState);
    return isRecycling ? [...recyclingState] : state;
}

export {ReportActionPositionContextProvider, ReportActionScrollToNewestContext, useReportActionItemState};
export default ReportActionIndexContext;
