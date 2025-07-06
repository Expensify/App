import React, {createContext} from 'react';

type NarrowPaneContextType = {
    // Whether the screen/component accessing the context is in narrow pane navigator (RHP)
    isInNarrowPane: boolean;
};

const NarrowPaneContext = createContext<NarrowPaneContextType>({isInNarrowPane: false});

const IS_IN_NARROW_PANE_CONTEXT_VALUE: NarrowPaneContextType = {
    isInNarrowPane: true,
};

function NarrowPaneContextProvider({children}: {children: React.ReactNode}) {
    return <NarrowPaneContext.Provider value={IS_IN_NARROW_PANE_CONTEXT_VALUE}>{children}</NarrowPaneContext.Provider>;
}

export default NarrowPaneContext;
export {NarrowPaneContextProvider};
