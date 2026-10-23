import {createContext} from 'react';

/** Tells the tab navigator that the root screen of the focused tab started or stopped coming back into view. */
const SetTabRootRevealingContext = createContext<(isRevealing: boolean) => void>(() => {});

export default SetTabRootRevealingContext;
