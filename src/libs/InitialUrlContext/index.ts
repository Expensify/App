import {createContext} from 'react';

const InitialUrlContext = createContext<{initialUrl: string | null}>({initialUrl: null});

export default InitialUrlContext;
