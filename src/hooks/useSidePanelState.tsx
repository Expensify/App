import {SidePanelStateContext} from '@components/SidePanel/SidePanelContextProvider';

import {useContext} from 'react';

/**
 * Hook to get the animated position of the Side Panel and the margin of the navigator
 */
const useSidePanelState = () => useContext(SidePanelStateContext);

export default useSidePanelState;
