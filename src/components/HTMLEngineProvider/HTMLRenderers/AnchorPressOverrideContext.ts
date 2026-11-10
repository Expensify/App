import {createContext} from 'react';

/** Lets a message override selected anchor presses without replacing the shared anchor renderer. */
const AnchorPressOverrideContext = createContext<((href: string) => (() => void) | undefined) | undefined>(undefined);

export default AnchorPressOverrideContext;
