import {createContext, useContext} from 'react';

const IsInSidePanelContext = createContext(false);

function useIsInSidePanel(): boolean {
    return useContext(IsInSidePanelContext);
}

export default useIsInSidePanel;
export {IsInSidePanelContext};
