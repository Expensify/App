import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React, {createContext, useState} from 'react';

/** Whether the tab navigator currently draws its own floating tab bar. */
const NavigatorTabBarVisibleContext = createContext(false);

const SetNavigatorTabBarVisibleContext = createContext<(isVisible: boolean) => void>(() => {});

function NavigatorTabBarVisibilityProvider({children}: ChildrenProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <SetNavigatorTabBarVisibleContext.Provider value={setIsVisible}>
            <NavigatorTabBarVisibleContext.Provider value={isVisible}>{children}</NavigatorTabBarVisibleContext.Provider>
        </SetNavigatorTabBarVisibleContext.Provider>
    );
}

export default NavigatorTabBarVisibilityProvider;
export {NavigatorTabBarVisibleContext, SetNavigatorTabBarVisibleContext};
