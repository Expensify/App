import {useContext} from 'react';
import {SidePanelActionsContext} from '@components/SidePanel/SidePanelContextProvider';

/**
 * Hook to get the animated position of the Side Panel and the margin of the navigator
 */
const useSidePanelActions = () => useContext(SidePanelActionsContext);

export default useSidePanelActions;
