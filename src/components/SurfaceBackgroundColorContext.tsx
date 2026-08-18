import {createContext, useContext} from 'react';

/**
 * Provides the background color of the surface (card, list, page) that rows are rendered on.
 * Rows such as MenuItem read it to derive their hover color one product step darker, so a row on a
 * card (cardBG = product200) hovers to product300 while a row on appBG (product100) hovers to product200.
 */
const SurfaceBackgroundColorContext = createContext<string | undefined>(undefined);

function useSurfaceBackgroundColor(): string | undefined {
    return useContext(SurfaceBackgroundColorContext);
}

export default SurfaceBackgroundColorContext;
export {useSurfaceBackgroundColor};
