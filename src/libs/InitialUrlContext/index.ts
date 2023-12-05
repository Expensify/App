import {createContext} from 'react';

// Context to keep the initial url that will be opened when NewDot is embedded into Hybrid App
const InitialUrlContext = createContext<{initialUrl: string | null}>({initialUrl: null});

export default InitialUrlContext;
