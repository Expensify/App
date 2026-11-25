import type {NavigationProp, ParamListBase} from '@react-navigation/native';

import {createContext} from 'react';

type VerticalBarTabsScreen = {
    /** The navigation of the screen that holds the tabs, whose bar shows the create and scan buttons in the vertical bar. */
    navigation: NavigationProp<ParamListBase>;

    /** Whether that bar has those buttons now, which it does while the tab bar is shown as a column. */
    hasBarItems: boolean;
};

/**
 * Tells a screen that it is one of the tab screens, and gives it the screen that holds them. UIKit moves the bar items of
 * these screens into the vertical bar, and leaves those of a screen presented over them, such as a modal, in its top
 * bar. It also lays the items of each native bar out from the top of the vertical bar on their own, so a tab screen with
 * a back button adds it to the bar that has the create and scan buttons, where UIKit puts it over them.
 */
const VerticalBarTabsScreenContext = createContext<VerticalBarTabsScreen | undefined>(undefined);

export default VerticalBarTabsScreenContext;
export type {VerticalBarTabsScreen};
