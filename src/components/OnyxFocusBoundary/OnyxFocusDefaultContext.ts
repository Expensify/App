import {createContext} from 'react';

/**
 * Subtree default for `useOnyx`'s `subscribed`, provided by `OnyxFocusBoundary`. `undefined` = no
 * boundary above. Wrapper resolution: explicit option > this context > `true`.
 */
const OnyxFocusDefaultContext = createContext<boolean | undefined>(undefined);

export default OnyxFocusDefaultContext;
