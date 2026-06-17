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

export default ReportActionIndexContext;
