import {useContext} from 'react';
import {SidePanelContext} from '@components/SidePanel/SidePanelContextProvider';

/**
 * Hook to get the animated position of the Side Panel and the margin of the navigator
 */
const useSidePanel = () => useContext(SidePanelContext);

export default useSidePanel;
