import {createContext} from 'react';
import type {Route} from '@src/ROUTES';

/** Initial url that will be opened when NewDot is embedded into Hybrid App. */
const InitialUrlContext = createContext<Route | undefined>(undefined);

export default InitialUrlContext;
