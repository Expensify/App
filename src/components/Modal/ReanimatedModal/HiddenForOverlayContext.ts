import {createContext} from 'react';

/**
 * Lets content rendered inside a ReanimatedModal ask its hosting modal to hide in place — visually hidden,
 * backdrop dropped, and the whole modal subtree made pointer-transparent — while staying mounted so its state
 * survives. Used when a @react-navigation route (e.g. the dynamic year-selector RHP) is intentionally shown
 * over a kept-mounted popover: the modal's full-screen wrappers would otherwise paint over the route and
 * swallow its clicks. The value is a stable React state setter; `undefined` means there is no ReanimatedModal
 * ancestor (e.g. the content is hosted on a navigation card), in which case consumers fall back to hiding
 * themselves.
 */
const HiddenForOverlayContext = createContext<((isHidden: boolean) => void) | undefined>(undefined);

export default HiddenForOverlayContext;
