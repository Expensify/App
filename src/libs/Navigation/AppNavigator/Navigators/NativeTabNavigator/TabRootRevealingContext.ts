import type {SharedValue} from 'react-native-reanimated';

import {createContext} from 'react';

/** The root screen of the focused tab coming back into view before the navigation state reaches it, as in the iOS swipe-back gesture. */
type TabRootRevealing = {
    /** Tells the tab navigator that the root started or stopped coming back into view. */
    setIsRevealing: (isRevealing: boolean) => void;

    /** 0 from the start of a transition of the root until the root is fully in view, which the transition reports before the navigation state does. */
    revealed: SharedValue<number> | undefined;
};

const TabRootRevealingContext = createContext<TabRootRevealing>({setIsRevealing: () => {}, revealed: undefined});

export default TabRootRevealingContext;
export type {TabRootRevealing};
