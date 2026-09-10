import {createContext} from 'react';

/**
 * Carries an action item's position index from the list renderer down to the rare consumers that
 * actually need it (e.g. `ReportActionItemMessageEdit` for scroll-to-index during edit mode).
 *
 * Using context keeps `index` out of the prop signatures of every intermediate component, so a
 * position shift caused by a new message arriving doesn't cascade re-renders through items that
 * never read it. Only components that `useContext(ReportActionIndexContext)` re-render on change.
 */
const ReportActionIndexContext = createContext<number>(0);

/** Lets shared list implementations identify their newest report action without assuming an ordering direction. */
const ReportActionIsNewestContext = createContext<boolean | undefined>(undefined);

/** Lets shared list implementations provide their own reliable way to reach the newest action. */
const ReportActionScrollToNewestContext = createContext<(() => void) | undefined>(undefined);

export {ReportActionIsNewestContext, ReportActionScrollToNewestContext};
export default ReportActionIndexContext;
