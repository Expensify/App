import {createContext} from 'react';

/**
 * Subtree default for `useOnyx`'s `subscribed`, provided by `OnyxFocusBoundary`. `undefined` = no
 * boundary above.
 */
const OnyxFocusDefaultContext = createContext<boolean | undefined>(undefined);

export default OnyxFocusDefaultContext;
