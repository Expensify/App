import {createContext} from 'react';

/** Records the bottom inset a tab screen reads while the tab bar shows, so TabNavigator can work out the bar's shape. */
const TabBarShapeContext = createContext<(tabScreenBottomInset: number) => void>(() => {});

export default TabBarShapeContext;
