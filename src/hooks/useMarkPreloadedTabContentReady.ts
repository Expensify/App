import {createContext, useContext} from 'react';

// Lets a screen in a tab preloaded at idle report that its first content is on screen, so the tab can freeze from then
// on instead of re-rendering on every data change until the user opens it.
// Called by every first content state: SearchPage, Search's onLayoutChart and SearchLoadingSkeleton.
const PreloadedTabContentReadyContext = createContext<() => void>(() => {});

function useMarkPreloadedTabContentReady(): () => void {
    return useContext(PreloadedTabContentReadyContext);
}

export default useMarkPreloadedTabContentReady;
export {PreloadedTabContentReadyContext};
