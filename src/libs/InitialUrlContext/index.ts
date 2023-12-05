import {createContext} from 'react';

/** Initial url that will be opened when NewDot is embedded into Hybrid App. */
const InitialUrlContext = createContext<string | undefined>(undefined);

export default InitialUrlContext;
