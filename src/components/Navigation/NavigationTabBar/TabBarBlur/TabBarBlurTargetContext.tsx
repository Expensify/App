import type {RefObject} from 'react';
import type {View} from 'react-native';

import React, {createContext, useContext, useState} from 'react';

type BlurTarget = RefObject<View | null> | null;

type TabBarBlurTargetActionsContextType = {
    setBlurTarget: (blurTarget: BlurTarget) => void;
};

type TabBarBlurTargetContextProviderProps = {
    children: React.ReactNode;
};

const TabBarBlurTargetStateContext = createContext<BlurTarget>(null);

const TabBarBlurTargetActionsContext = createContext<TabBarBlurTargetActionsContextType>({
    setBlurTarget: () => {},
});

/**
 * Tells the floating tab bar which view it lays over. Each tab scene registers its own view when it gains focus,
 * so the bar always blurs the scene the user is looking at rather than one that is mounted but hidden.
 */
function TabBarBlurTargetContextProvider({children}: TabBarBlurTargetContextProviderProps) {
    const [blurTarget, setBlurTarget] = useState<BlurTarget>(null);

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsContextValue = {setBlurTarget};

    return (
        <TabBarBlurTargetActionsContext.Provider value={actionsContextValue}>
            <TabBarBlurTargetStateContext.Provider value={blurTarget}>{children}</TabBarBlurTargetStateContext.Provider>
        </TabBarBlurTargetActionsContext.Provider>
    );
}

function useTabBarBlurTarget(): BlurTarget {
    return useContext(TabBarBlurTargetStateContext);
}

function useTabBarBlurTargetActions(): TabBarBlurTargetActionsContextType {
    return useContext(TabBarBlurTargetActionsContext);
}

export default TabBarBlurTargetContextProvider;
export {useTabBarBlurTarget, useTabBarBlurTargetActions};
