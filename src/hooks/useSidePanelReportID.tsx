import {SidePanelReportIDContext} from '@components/SidePanel/SidePanelContextProvider';

import {useContext} from 'react';

/**
 * Hook to get the reportID used by the Side Panel.
 * Separated from useSidePanelState to avoid re-rendering components
 * that don't need reportID when it changes.
 */
const useSidePanelReportID = () => useContext(SidePanelReportIDContext);

export default useSidePanelReportID;
