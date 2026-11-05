import {createContext} from 'react';

/**
 * Tells the tab navigator that the root screen of the focused tab started or stopped coming back into view before the
 * navigation state reaches it, as in the iOS swipe-back gesture.
 */
const TabRootRevealingContext = createContext<(isRevealing: boolean) => void>(() => {});

export default TabRootRevealingContext;
