import {useContext} from 'react';
import {SidePanelStateContext} from '@components/SidePanel/SidePanelContextProvider';

/**
 * Hook to get the animated position of the Side Panel and the margin of the navigator
 */
const useSidePanelState = () => useContext(SidePanelStateContext);

export default useSidePanelState;
