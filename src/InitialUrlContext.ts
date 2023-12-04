import {createContext} from 'react';

export const InitialUrlContext = createContext<{initialUrl: string | undefined}>({initialUrl: undefined});
