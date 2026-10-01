import {createContext, useContext} from 'react';

// True while the tab holding this screen is preloaded but not yet opened. Screens read it to hold work
// that assumes the user is looking, such as OpenReport, until the tab is focused.
const IsInPreloadedTabContext = createContext(false);

function useIsInPreloadedTab(): boolean {
    return useContext(IsInPreloadedTabContext);
}

export default useIsInPreloadedTab;
export {IsInPreloadedTabContext};
