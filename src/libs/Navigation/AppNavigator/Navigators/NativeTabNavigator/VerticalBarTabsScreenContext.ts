import {createContext} from 'react';

type VerticalBarTabsScreen = {
    /**
     * Tells the tabs that a tab screen has put a back button in the vertical bar, where it takes the place of the create
     * and scan buttons. Returns what tells them that the button is gone again.
     */
    addBackButton: () => () => void;
};

/**
 * Tells a screen that it is one of the tab screens, whose own native bar reaches the edge the vertical bar is on, and
 * lets it tell the tabs about a back button it puts in the vertical bar.
 */
const VerticalBarTabsScreenContext = createContext<VerticalBarTabsScreen | undefined>(undefined);

export default VerticalBarTabsScreenContext;
export type {VerticalBarTabsScreen};
