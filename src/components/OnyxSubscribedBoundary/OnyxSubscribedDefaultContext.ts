import {createContext} from 'react';

/**
 * Subtree default for `useOnyx`'s `subscribed`, provided by `OnyxSubscribedBoundary`. `undefined` = no
 * boundary above. Wrapper resolution: explicit option > this context > `true`.
 */
const OnyxSubscribedDefaultContext = createContext<boolean | undefined>(undefined);

export default OnyxSubscribedDefaultContext;
