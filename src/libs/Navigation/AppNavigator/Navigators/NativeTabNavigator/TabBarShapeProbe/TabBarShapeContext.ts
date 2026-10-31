import {createContext} from 'react';

const TabBarShapeContext = createContext<(isTabBarVertical: boolean) => void>(() => {});

export default TabBarShapeContext;
